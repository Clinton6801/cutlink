'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CancellationModal from '../../../components/CancellationModal'
import { sendEmail } from '../../../lib/sendEmail'
import { emailTemplates } from '../../../lib/emailTemplates'
import { createNotification } from '../../../lib/createNotification'
import NotificationBell from '../../../components/NotificationBell'

interface Booking {
  id: string
  service_type: string
  appointment_date: string
  appointment_time: string
  location: string
  service_description: string
  price: number
  status: string
  payment_status: string
  created_at: string
  customer_id: string
  customer: {
    profiles: {
      full_name: string
      phone_number: string
      avatar_url: string
    }
  }
}

interface StylistProfile {
  rating: number
  total_bookings: number
  is_verified: boolean
  price_range_min: number
  price_range_max: number
}

export default function StylistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stylistProfile, setStylistProfile] = useState<StylistProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed'>('pending')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<any>(null)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [primaryBank, setPrimaryBank] = useState<any>(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/login')
          return
        }

        setUser(authUser)
        await loadDashboardData(authUser.id)
      } catch (error) {
        console.error('Initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const loadDashboardData = async (userId: string) => {
    try {
      // 1. Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(profileData)

      // 2. Get stylist profile
      const { data: stylistData } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      setStylistProfile(stylistData as any)

      // 3. Get available balance
      const { data: balanceData } = await supabase.rpc('get_stylist_available_balance', {
        stylist_user_id: userId
      })
      setAvailableBalance(balanceData || 0)

      // 4. Get Primary Bank Account
      const { data: bankData } = await supabase
        .from('stylist_bank_accounts')
        .select('*')
        .eq('stylist_id', userId)
        .eq('is_primary', true)
        .maybeSingle()
      setPrimaryBank(bankData)

      // 5. Fetch bookings
      await fetchBookings(userId)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const fetchBookings = async (userId: string) => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles!customer_id (
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .eq('stylist_id', userId)

      if (bookingsError) throw bookingsError

      const bookingsWithCustomers = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, phone_number, avatar_url')
            .eq('id', booking.customer_id)
            .single()

          return {
            ...booking,
            customer: {
              profiles: profileData || {
                full_name: 'Unknown Customer',
                phone_number: 'N/A',
                avatar_url: null
              }
            }
          }
        })
      )

      setBookings(bookingsWithCustomers)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      alert(`Booking ${newStatus} successfully!`)
      if (user) fetchBookings(user.id)
    } catch (error: any) {
      alert('Error updating booking: ' + error.message)
    }
  }

  const completeBooking = async (bookingId: string) => {
    if (!confirm('Mark this booking as completed?')) return

    try {
      await updateBookingStatus(bookingId, 'completed')

      await supabase.rpc('release_earnings_for_booking', {
        booking_uuid: bookingId
      })

      const booking = bookings.find(b => b.id === bookingId)
      if (booking) {
        const { data: earningsData } = await supabase
          .from('stylist_earnings')
          .select('stylist_payout')
          .eq('booking_id', bookingId)
          .single()

        const payoutAmount = earningsData?.stylist_payout || booking.price

        await createNotification(
          user.id,
          'earnings_released',
          '💰 Earnings Released!',
          `₦${payoutAmount.toLocaleString()} is now available in your balance`,
          '/stylist/dashboard'
        )

        // Refresh balance
        const { data: balanceData } = await supabase.rpc('get_stylist_available_balance', {
          stylist_user_id: user.id
        })
        setAvailableBalance(balanceData || 0)
      }
    } catch (error) {
      console.error('Error completing booking:', error)
    }
  }

  const confirmBooking = async (bookingId: string) => {
    if (!confirm('Confirm this booking?')) return
    try {
      await updateBookingStatus(bookingId, 'confirmed')
      const booking = bookings.find(b => b.id === bookingId)
      if (booking) {
        await createNotification(
          booking.customer_id,
          'booking_confirmed',
          'Booking Confirmed! ✅',
          `${profile?.full_name || 'Your stylist'} confirmed your booking`,
          '/customer/dashboard'
        )
      }
    } catch (error) {
      console.error('Error confirming booking:', error)
    }
  }

  const rejectBooking = async (bookingId: string) => {
    if (!confirm('Reject this booking? This cannot be undone.')) return
    await updateBookingStatus(bookingId, 'cancelled')
  }

  const cancelConfirmedBooking = (booking: any) => {
    setBookingToCancel(booking)
    setCancellationModalOpen(true)
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const completedBookings = bookings.filter(b => b.status === 'completed')

  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0)
  const pendingEarnings = confirmedBookings.reduce((sum, b) => sum + b.price, 0)

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✂️</div>
          <p className="text-xl text-gray-400 font-medium">Setting up your shop...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">✂️</span>
              <h1 className="text-2xl font-bold">
                <span className="text-yellow-500">Cut</span>
                <span className="text-white">Link</span>
              </h1>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {user && <NotificationBell userId={user.id} />}
              <Link href="/messages" className="text-gray-300 hover:text-yellow-500 transition font-medium">
                💬 Messages
              </Link>
              <Link href="/stylist/edit-profile" className="text-gray-300 hover:text-yellow-500 transition font-medium">
                Edit Profile
              </Link>
              <button onClick={handleSignOut} className="text-gray-300 hover:text-red-500 transition font-medium">
                Sign Out
              </button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white text-2xl">☰</button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-800 pt-4">
              <Link href="/messages" className="block text-gray-300 py-2">💬 Messages</Link>
              <Link href="/stylist/edit-profile" className="block text-gray-300 py-2">Edit Profile</Link>
              <button onClick={handleSignOut} className="block w-full text-left text-red-500 py-2">Sign Out</button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome, <span className="text-yellow-500">{profile?.full_name}!</span>
          </h2>
          <p className="text-gray-400">Manage your bookings and your bankroll</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {/* Earnings Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-yellow-500">₦{totalEarnings.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Life Earnings</div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-yellow-500">₦{pendingEarnings.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Escrow (Pending)</div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-yellow-500">{stylistProfile?.total_bookings || 0}</div>
            <div className="text-gray-400 text-sm">Bookings</div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-yellow-500">{stylistProfile?.rating.toFixed(1) || '0.0'}★</div>
            <div className="text-gray-400 text-sm">Rating</div>
          </div>

          {/* AVAILABLE BALANCE & WITHDRAW CARD */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium uppercase tracking-wider">Available Balance</p>
              <h3 className="text-2xl font-bold text-white mb-4">₦{availableBalance.toLocaleString()}</h3>
            </div>
            
            <div className="space-y-2">
              <Link 
                href="/stylist/request-payout"
                className="block w-full bg-black text-white text-center py-2 rounded-lg font-bold hover:bg-gray-900 transition text-xs"
              >
                Withdraw
              </Link>
              <Link 
                href="/stylist/bank-account"
                className="block w-full bg-white/20 text-white text-center py-2 rounded-lg font-bold hover:bg-white/30 transition text-xs"
              >
                Bank Setup
              </Link>
            </div>

            <p className="mt-3 text-[10px] text-green-100/70 border-t border-white/10 pt-2">
              {primaryBank ? `Bank: ${primaryBank.bank_name}` : "⚠️ No bank linked"}
            </p>
          </div>
        </div>

        {/* Tabs and Bookings section continues below... */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button onClick={() => setActiveTab('pending')} className={`pb-4 px-2 font-bold transition ${activeTab === 'pending' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'}`}>
            Pending ({pendingBookings.length})
          </button>
          <button onClick={() => setActiveTab('confirmed')} className={`pb-4 px-2 font-bold transition ${activeTab === 'confirmed' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'}`}>
            Confirmed ({confirmedBookings.length})
          </button>
          <button onClick={() => setActiveTab('completed')} className={`pb-4 px-2 font-bold transition ${activeTab === 'completed' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'}`}>
            Completed ({completedBookings.length})
          </button>
        </div>

        {/* Booking Cards (Simplified Loop) */}
        <div className="space-y-4">
           {(activeTab === 'pending' ? pendingBookings : activeTab === 'confirmed' ? confirmedBookings : completedBookings).map((booking) => (
             <div key={booking.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-xl">👤</div>
                    <div>
                      <h4 className="text-white font-bold">{booking.customer?.profiles?.full_name}</h4>
                      <p className="text-gray-400 text-sm">{booking.service_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-500 font-bold">₦{booking.price.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs">{new Date(booking.appointment_date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                   {booking.status === 'pending' && (
                     <button onClick={() => confirmBooking(booking.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Accept</button>
                   )}
                   {booking.status === 'confirmed' && (
                     <button onClick={() => completeBooking(booking.id)} className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold">Finish Job</button>
                   )}
                   <Link href={`/messages/${booking.customer_id}`} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">Message</Link>
                </div>
             </div>
           ))}
        </div>
      </div>

      {cancellationModalOpen && bookingToCancel && (
        <CancellationModal
          bookingId={bookingToCancel.id}
          userType="stylist"
          onClose={() => setCancellationModalOpen(false)}
          onSuccess={() => {
            setCancellationModalOpen(false)
            if (user) fetchBookings(user.id)
          }}
        />
      )}
    </main>
  )
}