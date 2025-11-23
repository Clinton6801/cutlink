'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface StylistProfile {
  id: string
  user_id: string
  bio: string
  years_of_experience: number
  specialties: string[]
  service_type: string
  location: string
  shop_address: string
  price_range_min: number
  price_range_max: number
  rating: number
  total_bookings: number
  is_verified: boolean
  portfolio_images: string[]
  profiles: {
    full_name: string
    avatar_url: string
    phone_number: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: {
    full_name: string
  }
}

export default function StylistProfile() {
  const params = useParams()
  const router = useRouter()
  const stylistId = params.id as string

  const [stylist, setStylist] = useState<StylistProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
     checkCurrentUser() 
    fetchStylistData()
    fetchReviews()
  }, [stylistId])

// ← ADD THIS ENTIRE FUNCTION HERE (between useEffect and fetchStylistData)
const checkCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  setCurrentUser(user)
}

  const fetchStylistData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('stylist_profiles')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            phone_number
          )
        `)
        .eq('user_id', stylistId)
        .single()

      if (error) throw error
      setStylist(data)
    } catch (error) {
      console.error('Error fetching stylist:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles:customer_id (
            full_name
          )
        `)
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setReviews(data as any || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleBookNow = () => {
    // For now, we'll just redirect to a booking page (we'll build this later)
    router.push(`/booking/${stylistId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✂️</div>
          <p className="text-xl text-gray-400">Loading stylist profile...</p>
        </div>
      </main>
    )
  }

  if (!stylist) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-2">Stylist not found</h2>
          <Link href="/browse" className="text-yellow-500 hover:text-yellow-400">
            ← Back to browse
          </Link>
        </div>
      </main>
    )
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : stylist.rating

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
     <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <Link href="/browse" className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
      <span>←</span>
      <span>Back to Browse</span>
    </Link>
    <Link href="/" className="flex items-center gap-2">
      <span className="text-3xl">✂️</span>
      <h1 className="text-2xl font-bold">
        <span className="text-yellow-500">Cut</span>
        <span className="text-white">Link</span>
      </h1>
    </Link>
    {/* ← REPLACE THE <div className="w-32"></div> WITH THIS: */}
    <div className="flex items-center gap-4">
      {currentUser && currentUser.id === stylistId && (
        <Link
          href="/stylist/dashboard"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition"
        >
          My Dashboard
        </Link>
      )}
      {!currentUser && <div className="w-32"></div>}
    </div>
  </div>
</header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stylist Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden sticky top-24">
              {/* Avatar */}
              <div className="h-64 bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center">
                {stylist.profiles.avatar_url ? (
                  <img
                    src={stylist.profiles.avatar_url}
                    alt={stylist.profiles.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-9xl">👤</div>
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                {/* Name and Verified */}
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {stylist.profiles.full_name}
                  </h1>
                  {stylist.is_verified && (
                    <span className="text-yellow-500 text-2xl" title="Verified Stylist">
                      ✓
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= averageRating ? 'text-yellow-500' : 'text-gray-600'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-white font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-black rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {stylist.total_bookings}
                    </div>
                    <div className="text-sm text-gray-400">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {stylist.years_of_experience}
                    </div>
                    <div className="text-sm text-gray-400">Years Exp</div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-1">Price Range</div>
                  <div className="text-2xl font-bold text-yellow-500">
                    ₦{stylist.price_range_min.toLocaleString()} - ₦{stylist.price_range_max.toLocaleString()}
                  </div>
                </div>

                {/* Service Type */}
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">Service Options</div>
                  <div className="flex gap-2">
                    {stylist.service_type === 'home_service' || stylist.service_type === 'both' ? (
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-sm">
                        🏠 Home Service
                      </span>
                    ) : null}
                    {stylist.service_type === 'shop' || stylist.service_type === 'both' ? (
                      <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-sm">
                        🏪 Shop Visit
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Shop Address */}
                {stylist.shop_address && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-400 mb-1">Shop Location</div>
                    <div className="text-white">{stylist.shop_address}</div>
                  </div>
                )}

                {/* ← ADD LOCATION/AREA HERE */}
{stylist.location && (
  <div className="mb-6">
    <div className="text-sm text-gray-400 mb-1">Area/City</div>
    <div className="text-white flex items-center gap-2">
      <span>🌍</span>
      <span>{stylist.location}</span>
    </div>
  </div>
)}

                {/* Book Now Button */}
                <button
                  onClick={handleBookNow}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 mb-3"
                >
                  Book Now
                </button>

                {/* Contact Button */}
                <Link
                    href={`/messages/${stylistId}`}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition block text-center">
                      💬 Message
                 </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-4 px-2 font-bold transition ${
                  activeTab === 'about'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 px-2 font-bold transition ${
                  activeTab === 'reviews'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                {/* Bio */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">About Me</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {stylist.bio || 'No bio available yet.'}
                  </p>
                </div>

                {/* Specialties */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Specialties</h2>
                  <div className="flex flex-wrap gap-3">
                    {stylist.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500"
                      >
                        ✂️ {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio */}
                {stylist.portfolio_images && stylist.portfolio_images.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Portfolio</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {stylist.portfolio_images.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-800"
                        >
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">⭐</div>
                    <h3 className="text-xl font-bold text-white mb-2">No reviews yet</h3>
                    <p className="text-gray-400">Be the first to book and review this stylist!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6"
                    >
                      {/* Reviewer Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-2xl">
                            👤
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {review.profiles?.full_name || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= review.rating ? 'text-yellow-500' : 'text-gray-600'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Review Comment */}
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}