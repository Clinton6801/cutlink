'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  totalCustomers: number
  totalStylists: number
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalRevenue: number
  pendingVerifications: number
  recentUsers: any[]
  recentBookings: any[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalStylists: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    recentUsers: [],
    recentBookings: []
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Check if user is admin
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !adminData) {
        // Not an admin - redirect
        alert('Access denied. Admin only.')
        router.push('/')
        return
      }

      setIsAdmin(true)
      await fetchStats()
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Count customers
      const { count: customerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'customer')

      // Count stylists
      const { count: stylistCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'stylist')

      // Count total bookings
      const { count: totalBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

        const { count: pendingVerificationCount } = await supabase
  .from('stylist_profiles')
  .select('*', { count: 'exact', head: true })
  .eq('verification_status', 'pending')

      // Count pending bookings
      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Count completed bookings
      const { count: completedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // Calculate total revenue (completed bookings)
      const { data: completedBookings } = await supabase
        .from('bookings')
        .select('price')
        .eq('status', 'completed')

      const totalRevenue = completedBookings?.reduce((sum, booking) => sum + booking.price, 0) || 0

      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Get recent bookings
      const { data: recentBookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (full_name),
          stylist:stylist_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalCustomers: customerCount || 0,
        totalStylists: stylistCount || 0,
        totalBookings: totalBookingsCount || 0,
        pendingBookings: pendingCount || 0,
        completedBookings: completedCount || 0,
        totalRevenue,
        pendingVerifications: pendingVerificationCount || 0,
        recentUsers: recentUsers || [],
        recentBookings: recentBookingsData || []
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
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
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl text-gray-400">Checking admin access...</p>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return null
  }

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
              <span className="ml-3 text-sm bg-red-500 text-white px-3 py-1 rounded-full">ADMIN</span>
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-yellow-500 transition">
              Home
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-300 hover:text-red-500 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Admin <span className="text-yellow-500">Dashboard</span>
          </h2>
          <p className="text-gray-400">Overview of CutLink platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Customers */}
          <div className="bg-gradient-to-br from-blue-500/20 to-gray-900 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">👥</div>
              <div className="text-3xl font-bold text-blue-400">{stats.totalCustomers}</div>
            </div>
            <h3 className="text-xl font-bold text-white">Total Customers</h3>
            <p className="text-gray-400 text-sm">Registered customers</p>
          </div>

          {/* Total Stylists */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-gray-900 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">✂️</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.totalStylists}</div>
            </div>
            <h3 className="text-xl font-bold text-white">Total Stylists</h3>
            <p className="text-gray-400 text-sm">Active stylists</p>
          </div>

          {/* Total Bookings */}
          <div className="bg-gradient-to-br from-green-500/20 to-gray-900 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📅</div>
              <div className="text-3xl font-bold text-green-400">{stats.totalBookings}</div>
            </div>
            <h3 className="text-xl font-bold text-white">Total Bookings</h3>
            <p className="text-gray-400 text-sm">All time bookings</p>
          </div>

          {/* Pending Bookings */}
          <div className="bg-gradient-to-br from-orange-500/20 to-gray-900 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">⏳</div>
              <div className="text-3xl font-bold text-orange-400">{stats.pendingBookings}</div>
            </div>
            <h3 className="text-xl font-bold text-white">Pending Bookings</h3>
            <p className="text-gray-400 text-sm">Awaiting confirmation</p>
          </div>

          {/* Completed Bookings */}
          <div className="bg-gradient-to-br from-purple-500/20 to-gray-900 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">✅</div>
              <div className="text-3xl font-bold text-purple-400">{stats.completedBookings}</div>
            </div>
            <h3 className="text-xl font-bold text-white">Completed</h3>
            <p className="text-gray-400 text-sm">Successful bookings</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">💰</div>
              <div className="text-3xl font-bold text-black">₦{stats.totalRevenue.toLocaleString()}</div>
            </div>
            <h3 className="text-xl font-bold text-black">Total Revenue</h3>
            <p className="text-black/70 text-sm">From completed bookings</p>
          </div>
        </div>

        // Add this section to your admin dashboard after the stats grid (around line 190)
// This goes in src/app/admin/page.tsx

{/* Quick Actions */}
<div className="mb-12">
  <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
  <div className="grid md:grid-cols-3 gap-6">
    {/* Verification Management */}
    <Link
      href="/admin/verification"
      className="bg-gradient-to-br from-yellow-500/20 to-gray-900 border border-yellow-500/30 rounded-2xl p-6 hover:border-yellow-500 transition group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-5xl">✅</div>
        <div className="text-3xl font-bold text-yellow-400">
          {/* Show pending count */}
          {stats.pendingVerifications || 0}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        Verification Requests
      </h3>
      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">
        Review pending stylist verifications →
      </p>
    </Link>

    {/* User Management */}
    <div className="bg-gradient-to-br from-blue-500/20 to-gray-900 border border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-5xl">👥</div>
        <div className="text-3xl font-bold text-blue-400">
          {stats.totalCustomers + stats.totalStylists}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        Total Users
      </h3>
      <p className="text-gray-400 text-sm">
        Customers and stylists combined
      </p>
    </div>

    {/* Revenue Stats */}
    <div className="bg-gradient-to-br from-green-500/20 to-gray-900 border border-green-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-5xl">💰</div>
        <div className="text-3xl font-bold text-green-400">
          ₦{stats.totalRevenue.toLocaleString()}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        Total Revenue
      </h3>
      <p className="text-gray-400 text-sm">
        From completed bookings
      </p>
    </div>
  </div>
</div>

        {/* Recent Users */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Users</h3>
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-white">{user.full_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.user_type === 'stylist' 
                            ? 'bg-yellow-500/20 text-yellow-500' 
                            : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.phone_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Recent Bookings</h3>
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Stylist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stats.recentBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-white">{booking.customer?.full_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-white">{booking.stylist?.full_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(booking.appointment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-yellow-500 font-bold">
                        ₦{booking.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}