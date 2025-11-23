'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CancellationModal from '../../../components/CancellationModal' // ← ADD THIS

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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Get stylist profile
      const { data: stylistData } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setStylistProfile(stylistData as any)

      // Fetch bookings
      await fetchBookings(user.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async (userId: string) => {
  try {
    // First get the bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('stylist_id', userId)
      .order('appointment_date', { ascending: true })

   if (bookingsError) {
  console.error('Bookings error details:', {
    message: bookingsError.message,
    details: bookingsError.details,
    hint: bookingsError.hint,
    code: bookingsError.code
  })
  throw bookingsError
}
    // Then for each booking, get the customer info
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
    setBookings([]) // Set empty array on error so page still loads
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
    await updateBookingStatus(bookingId, 'completed')
  }

  const confirmBooking = async (bookingId: string) => {
    if (!confirm('Confirm this booking?')) return
    await updateBookingStatus(bookingId, 'confirmed')
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

  // Calculate earnings
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0)
  const pendingEarnings = confirmedBookings.reduce((sum, b) => sum + b.price, 0)

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✂️</div>
          <p className="text-xl text-gray-400">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      {/* Header */}
<header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
    {/* Mobile Layout */}
    <div className="flex md:hidden items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">✂️</span>
        <h1 className="text-xl font-bold">
          <span className="text-yellow-500">Cut</span>
          <span className="text-white">Link</span>
        </h1>
      </Link>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="text-white text-2xl"
      >
        ☰
      </button>
    </div>

    {/* Desktop Layout */}
    <div className="hidden md:flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-3xl">✂️</span>
        <h1 className="text-2xl font-bold">
          <span className="text-yellow-500">Cut</span>
          <span className="text-white">Link</span>
        </h1>
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/messages"
          className="text-gray-300 hover:text-yellow-500 transition font-medium"
        >
          💬 Messages
        </Link>
        <Link
          href="/stylist/edit-profile"
          className="text-gray-300 hover:text-yellow-500 transition font-medium"
        >
          Edit Profile
        </Link>
        <Link
          href={`/stylist/${user?.id}`}
          className="text-gray-300 hover:text-yellow-500 transition font-medium"
        >
          View My Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="text-gray-300 hover:text-red-500 transition"
        >
          Sign Out
        </button>
      </div>
    </div>

    {/* Mobile Menu Dropdown */}
    {mobileMenuOpen && (
      <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-800 pt-4">
        <Link
          href="/messages"
          className="block text-gray-300 hover:text-yellow-500 transition font-medium py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          💬 Messages
        </Link>
        <Link
          href="/stylist/edit-profile"
          className="block text-gray-300 hover:text-yellow-500 transition font-medium py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          Edit Profile
        </Link>
        <Link
          href={`/stylist/${user?.id}`}
          className="block text-gray-300 hover:text-yellow-500 transition font-medium py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          View My Profile
        </Link>
        <button
          onClick={() => {
            setMobileMenuOpen(false)
            handleSignOut()
          }}
          className="block w-full text-left text-gray-300 hover:text-red-500 transition font-medium py-2"
        >
          Sign Out
        </button>
      </div>
    )}
  </div>
</header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome, <span className="text-yellow-500">{profile?.full_name}!</span>
            {stylistProfile?.is_verified && (
              <span className="text-yellow-500 ml-2" title="Verified Stylist">✓</span>
            )}
          </h2>
          <p className="text-gray-400">Manage your bookings and grow your business</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-500">
                  ₦{totalEarnings.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Total Earnings</div>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-500">
                  ₦{pendingEarnings.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Pending Earnings</div>
              </div>
              <div className="text-5xl">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-500">
                  {stylistProfile?.total_bookings || 0}
                </div>
                <div className="text-gray-400 text-sm">Total Bookings</div>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-500">
                  {stylistProfile?.rating.toFixed(1) || '0.0'}★
                </div>
                <div className="text-gray-400 text-sm">Average Rating</div>
              </div>
              <div className="text-5xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Pending Requests Alert */}
        {pendingBookings.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-black mb-1">
                  {pendingBookings.length} New Booking Request{pendingBookings.length > 1 ? 's' : ''}!
                </h3>
                <p className="text-black/80">Review and respond to customer requests</p>
              </div>
              <button
                onClick={() => setActiveTab('pending')}
                className="bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                View Requests
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'pending'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending ({pendingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'confirmed'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Confirmed ({confirmedBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'completed'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Completed ({completedBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {activeTab === 'pending' && pendingBookings.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">No pending requests</h3>
              <p className="text-gray-400">New booking requests will appear here</p>
            </div>
          )}

          {activeTab === 'confirmed' && confirmedBookings.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-white mb-2">No confirmed bookings</h3>
              <p className="text-gray-400">Confirmed bookings will appear here</p>
            </div>
          )}

          {activeTab === 'completed' && completedBookings.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">No completed bookings</h3>
              <p className="text-gray-400">Your completed bookings will appear here</p>
            </div>
          )}

          {(
            activeTab === 'pending' ? pendingBookings :
            activeTab === 'confirmed' ? confirmedBookings :
            completedBookings
          ).map((booking) => (
            <div
              key={booking.id}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-yellow-500 transition"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {booking.customer?.profiles?.avatar_url ? (
                      <img
                        src={booking.customer.profiles.avatar_url}
                        alt={booking.customer.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">👤</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {booking.customer?.profiles?.full_name || 'Customer'}
                    </h3>
                    <p className="text-gray-400">
                      {booking.customer?.profiles?.phone_number || 'No phone'}
                    </p>
                    <p className="text-gray-400 capitalize text-sm">
                      {booking.service_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Date & Time</div>
                    <div className="text-white font-medium">
                      {new Date(booking.appointment_date).toLocaleDateString()} at {booking.appointment_time}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="text-white font-medium">{booking.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Price</div>
                    <div className="text-yellow-500 font-bold">₦{booking.price.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Payment</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.payment_status === 'paid' ? 'bg-green-500/20 text-green-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {booking.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => confirmBooking(booking.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition text-sm"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={() => rejectBooking(booking.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold rounded-lg transition text-sm"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => completeBooking(booking.id)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                  <Link 
                  href={`/messages/${booking.customer_id}`}
                   className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition text-sm block text-center">
                    💬 Message
                    </Link>
                </div>
              </div>

              {/* Service Description */}
              {booking.service_description && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="text-sm text-gray-400 mb-1">Service Request</div>
                  <div className="text-white">{booking.service_description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}