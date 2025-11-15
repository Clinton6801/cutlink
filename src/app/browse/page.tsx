'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

interface Stylist {
  id: string
  user_id: string
  bio: string
  years_of_experience: number
  specialties: string[]
  service_type: string
  shop_address: string
  price_range_min: number
  price_range_max: number
  rating: number
  total_bookings: number
  is_verified: boolean
  profiles: {
    full_name: string
    avatar_url: string
  }
}

export default function BrowseStylists() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    serviceType: 'all',
    specialty: 'all',
    minPrice: '',
    maxPrice: '',
    minRating: ''
  })

  // Fetch stylists from database
  useEffect(() => {
    fetchStylists()
  }, [])

  const fetchStylists = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('stylist_profiles')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('rating', { ascending: false })

      if (error) throw error
      setStylists(data || [])
    } catch (error) {
      console.error('Error fetching stylists:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter stylists based on search and filters
  const filteredStylists = stylists.filter(stylist => {
    // Search by name
    const matchesSearch = stylist.profiles.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    // Filter by service type
    const matchesServiceType =
      filters.serviceType === 'all' ||
      stylist.service_type === filters.serviceType ||
      stylist.service_type === 'both'

    // Filter by specialty
    const matchesSpecialty =
      filters.specialty === 'all' ||
      stylist.specialties.includes(filters.specialty)

    // Filter by price
    const matchesPrice =
      (!filters.minPrice || stylist.price_range_min >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || stylist.price_range_max <= parseInt(filters.maxPrice))

    // Filter by rating
    const matchesRating =
      !filters.minRating || stylist.rating >= parseFloat(filters.minRating)

    return matchesSearch && matchesServiceType && matchesSpecialty && matchesPrice && matchesRating
  })

  const allSpecialties = Array.from(
    new Set(stylists.flatMap(s => s.specialties))
  )

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">✂️</span>
            <h1 className="text-2xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </Link>
          <div className="flex gap-4">
            <Link
              href="/customer/dashboard"
              className="text-gray-300 hover:text-yellow-500 transition"
            >
              My Bookings
            </Link>
            <Link
              href="/login"
              className="text-gray-300 hover:text-yellow-500 transition"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Find Your Perfect <span className="text-yellow-500">Stylist</span>
          </h2>
          <p className="text-xl text-gray-400">
            Browse skilled hairstylists in your area
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by stylist name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl text-white text-lg focus:border-yellow-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Filters</h3>
          <div className="grid md:grid-cols-5 gap-4">
            {/* Service Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Service Type</label>
              <select
                value={filters.serviceType}
                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="home_service">Home Service</option>
                <option value="shop">Shop Only</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Specialty</label>
              <select
                value={filters.specialty}
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="all">All Specialties</option>
                {allSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min Price (₦)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Price (₦)</label>
              <input
                type="number"
                placeholder="10000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={() => setFilters({
              serviceType: 'all',
              specialty: 'all',
              minPrice: '',
              maxPrice: '',
              minRating: ''
            })}
            className="mt-4 text-yellow-500 hover:text-yellow-400 text-sm"
          >
            Clear all filters
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-yellow-500 font-bold">{filteredStylists.length}</span> stylists
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✂️</div>
            <p className="text-xl text-gray-400">Loading stylists...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredStylists.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-white mb-2">No stylists found</h3>
            <p className="text-gray-400">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Stylists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStylists.map((stylist) => (
            <div
              key={stylist.id}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-500 transition transform hover:scale-105"
            >
              {/* Avatar */}
              <div className="h-48 bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center">
                {stylist.profiles.avatar_url ? (
                  <img
                    src={stylist.profiles.avatar_url}
                    alt={stylist.profiles.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-7xl">👤</div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Name and Verified Badge */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">
                    {stylist.profiles.full_name}
                  </h3>
                  {stylist.is_verified && (
                    <span className="text-yellow-500 text-xl" title="Verified">
                      ✓
                    </span>
                  )}
                </div>

                {/* Rating and Experience */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-white font-bold">
                      {stylist.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">
                    {stylist.years_of_experience} years exp
                  </span>
                </div>

                {/* Bio */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {stylist.bio || 'No bio available'}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {stylist.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                  {stylist.specialties.length > 3 && (
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-xs">
                      +{stylist.specialties.length - 3} more
                    </span>
                  )}
                </div>

                {/* Service Type */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                  <span>📍</span>
                  <span className="capitalize">
                    {stylist.service_type.replace('_', ' ')}
                  </span>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <span className="text-yellow-500 font-bold">
                    ₦{stylist.price_range_min.toLocaleString()} - ₦{stylist.price_range_max.toLocaleString()}
                  </span>
                </div>

                {/* View Profile Button */}
                <Link
                  href={`/stylist/${stylist.user_id}`}
                  className="block w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg text-center transition"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}