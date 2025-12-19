'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FavoriteStylist {
  id: string
  stylist_id: string
  stylist: {
    rating: number
    total_bookings: number
    price_range_min: number
    price_range_max: number
    location: string
    profiles: {
      full_name: string
      avatar_url: string
    }
  }
}

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteStylist[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
      await fetchFavorites(user.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

 const fetchFavorites = async (userId: string) => {
  try {
    // First, get the favorite records
    const { data: favoritesData, error: favError } = await supabase
      .from('favorites')
      .select('id, stylist_id, created_at')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })

    if (favError) throw favError

    if (!favoritesData || favoritesData.length === 0) {
      setFavorites([])
      return
    }

    // Then fetch stylist details for each favorite
    const favoritesWithDetails = await Promise.all(
      favoritesData.map(async (fav) => {
        // Get stylist profile
        const { data: stylistData } = await supabase
          .from('stylist_profiles')
          .select('rating, total_bookings, price_range_min, price_range_max, location')
          .eq('user_id', fav.stylist_id)
          .single()

        // Get stylist user profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', fav.stylist_id)
          .single()

        return {
          id: fav.id,
          stylist_id: fav.stylist_id,
          stylist: {
            rating: stylistData?.rating || 0,
            total_bookings: stylistData?.total_bookings || 0,
            price_range_min: stylistData?.price_range_min || 0,
            price_range_max: stylistData?.price_range_max || 0,
            location: stylistData?.location || '',
            profiles: {
              full_name: userProfile?.full_name || 'Unknown Stylist',
              avatar_url: userProfile?.avatar_url || null
            }
          }
        }
      })
    )

    setFavorites(favoritesWithDetails)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    setFavorites([])
  }
}
  const removeFavorite = async (favoriteId: string) => {
    if (!confirm('Remove from favorites?')) return

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error
      
      if (user) fetchFavorites(user.id)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❤️</div>
          <p className="text-xl text-gray-400">Loading favorites...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/customer/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">✂️</span>
            <h1 className="text-2xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-gray-300 hover:text-red-500 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Favorite <span className="text-yellow-500">Stylists</span> ❤️
          </h2>
          <p className="text-gray-400">Your saved stylists for quick booking</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-2xl font-bold text-white mb-2">No favorites yet</h3>
            <p className="text-gray-400 mb-6">Save your favorite stylists for easy rebooking!</p>
            <Link
              href="/browse"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition"
            >
              Browse Stylists
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-500 transition"
              >
                {/* Avatar */}
                <div className="h-48 bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center relative">
                  {fav.stylist.profiles.avatar_url ? (
                    <img
                      src={fav.stylist.profiles.avatar_url}
                      alt={fav.stylist.profiles.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-7xl">👤</div>
                  )}
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
                    title="Remove from favorites"
                  >
                    ❤️
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {fav.stylist.profiles.full_name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-500">★</span>
                    <span className="text-white font-bold">{fav.stylist.rating.toFixed(1)}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{fav.stylist.total_bookings} bookings</span>
                  </div>

                  {fav.stylist.location && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                      <span>🌍</span>
                      <span>{fav.stylist.location}</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <span className="text-yellow-500 font-bold">
                      ₦{fav.stylist.price_range_min.toLocaleString()} - ₦{fav.stylist.price_range_max.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/booking/${fav.stylist_id}`}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg text-center transition"
                    >
                      Book Now
                    </Link>
                    <Link
                      href={`/stylist/${fav.stylist_id}`}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-center transition"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}