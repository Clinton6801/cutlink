'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReviewModal from '../../../components/ReviewModal'
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
  stylist_id: string
  stylist: {
    profiles: {
      full_name: string
      avatar_url: string
    }
  }
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) 
  const [reviewModalOpen, setReviewModalOpen] = useState(false) 
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
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
      .eq('customer_id', userId)
      .order('appointment_date', { ascending: false })

    if (bookingsError) {
      console.error('Bookings error:', bookingsError)
      throw bookingsError
    }

    // Then for each booking, get the stylist info
    const bookingsWithStylists = await Promise.all(
      (bookingsData || []).map(async (booking) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', booking.stylist_id)
          .single()

        return {
          ...booking,
          stylist: {
            profiles: profileData || { full_name: 'Unknown Stylist', avatar_url: null }
          }
        }
      })
    )

    setBookings(bookingsWithStylists)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    setBookings([]) // Set empty array on error so page still loads
  }
}
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

 const cancelBooking = (booking: any) => {
  setBookingToCancel(booking)
  setCancellationModalOpen(true)
}
  const openReviewModal = (booking: any) => {
  setSelectedBooking(booking)
  setReviewModalOpen(true)
     }

  const upcomingBookings = bookings.filter(b => 
    b.status === 'pending' || b.status === 'confirmed'
  )

  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || b.status === 'cancelled'
  )

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
          href="/browse"
          className="text-gray-300 hover:text-yellow-500 transition font-medium"
        >
          Browse Stylists
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
          href="/browse"
          className="block text-gray-300 hover:text-yellow-500 transition font-medium py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          Browse Stylists
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
            Welcome back, <span className="text-yellow-500">{profile?.full_name || 'there'}!</span>
          </h2>
          <p className="text-gray-400">Manage your bookings and find new stylists</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-500">{upcomingBookings.length}</div>
                <div className="text-gray-400">Upcoming Bookings</div>
              </div>
              <div className="text-5xl">📅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-500">{pastBookings.length}</div>
                <div className="text-gray-400">Past Bookings</div>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-500">{bookings.length}</div>
                <div className="text-gray-400">Total Bookings</div>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </div>
        </div>

        {/* CTA - Find Stylist */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 mb-12 text-center">
          <h3 className="text-3xl font-bold text-black mb-4">Ready for a fresh cut?</h3>
          <Link
            href="/browse"
            className="inline-block bg-black hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
          >
            Browse Stylists
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'upcoming'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'past'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Past ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {activeTab === 'upcoming' && upcomingBookings.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-white mb-2">No upcoming bookings</h3>
              <p className="text-gray-400 mb-6">Book a stylist to get started!</p>
              <Link
                href="/browse"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition"
              >
                Find a Stylist
              </Link>
            </div>
          )}

          {activeTab === 'past' && pastBookings.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">✂️</div>
              <h3 className="text-2xl font-bold text-white mb-2">No past bookings</h3>
              <p className="text-gray-400">Your booking history will appear here</p>
            </div>
          )}

          {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
            <div
              key={booking.id}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-yellow-500 transition"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Stylist Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {booking.stylist?.profiles?.avatar_url ? (
                      <img
                        src={booking.stylist.profiles.avatar_url}
                        alt={booking.stylist.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">👤</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {booking.stylist?.profiles?.full_name || 'Stylist'}
                    </h3>
                    <p className="text-gray-400 capitalize">
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
                    <div className="text-sm text-gray-400">Status</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        booking.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                 <Link
               href={`/stylist/${(booking as any).stylist_profiles?.user_id || ''}`}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg text-center transition text-sm"
                            >
                          View Stylist
                               </Link>


                               <Link href={`/messages/${booking.stylist_id}`} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg text-center transition text-sm"
                               >
                                💬 Message
                                </Link>
                 
 {(booking.status === 'pending' || booking.status === 'confirmed') && (
  <button
    onClick={() => {
      if (booking.status === 'confirmed') {
        if (!confirm('This booking is already confirmed. Are you sure you want to cancel?')) return
      }
      cancelBooking(booking)
    }}
    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold rounded-lg transition text-sm"
  >
    Cancel
  </button>
)}
                 {booking.status === 'completed' && (
  <button 
    onClick={() => openReviewModal(booking)}
    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition text-sm"
  >
    ⭐ Leave Review
  </button>
)}
                </div>
              </div>

              {/* Service Description */}
              {booking.service_description && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="text-sm text-gray-400 mb-1">Service Description</div>
                  <div className="text-white">{booking.service_description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedBooking && (
        <ReviewModal
          bookingId={selectedBooking.id}
          stylistId={selectedBooking.stylist_id}
          customerId={user.id}
          stylistName={selectedBooking.stylist?.profiles?.full_name || 'Stylist'}
          onClose={() => {
            setReviewModalOpen(false)
            setSelectedBooking(null)
          }}
          onSuccess={() => {
            setReviewModalOpen(false)
            setSelectedBooking(null)
            alert('Thank you for your review!')
            fetchBookings(user.id)
          }}
        />
      )}

       {/* Cancellation Modal */}
      {cancellationModalOpen && bookingToCancel && (
        <CancellationModal
          bookingId={bookingToCancel.id}
          userType="customer"
          bookingDetails={bookingToCancel} 
          onClose={() => {
            setCancellationModalOpen(false)
            setBookingToCancel(null)
          }}
          onSuccess={() => {
            setCancellationModalOpen(false)
            setBookingToCancel(null)
            alert('Booking cancelled successfully')
            if (user) fetchBookings(user.id)
          }}
        />
      )}
    </main>
  )
}                                                                                                                                                                                                                                                                                               