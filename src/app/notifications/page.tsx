// Save as: src/app/notifications/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { markAsRead, markAllAsRead } from '../../lib/createNotification'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

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
      await fetchNotifications(user.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    if (user) await fetchNotifications(user.id)
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    await markAllAsRead(user.id)
    await fetchNotifications(user.id)
  }

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Delete this notification?')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      if (user) await fetchNotifications(user.id)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return '✅'
      case 'booking_cancelled': return '❌'
      case 'booking_completed': return '🎉'
      case 'new_booking': return '📅'
      case 'new_message': return '💬'
      case 'verification_approved': return '✓'
      case 'verification_rejected': return '⚠️'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return 'from-green-500/20 to-gray-900 border-green-500/30'
      case 'booking_cancelled': return 'from-red-500/20 to-gray-900 border-red-500/30'
      case 'booking_completed': return 'from-yellow-500/20 to-gray-900 border-yellow-500/30'
      case 'new_booking': return 'from-blue-500/20 to-gray-900 border-blue-500/30'
      case 'new_message': return 'from-purple-500/20 to-gray-900 border-purple-500/30'
      case 'verification_approved': return 'from-green-500/20 to-gray-900 border-green-500/30'
      case 'verification_rejected': return 'from-orange-500/20 to-gray-900 border-orange-500/30'
      default: return 'from-gray-900 to-black border-gray-800'
    }
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-xl text-gray-400">Loading notifications...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">✂️</span>
            <h1 className="text-2xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </Link>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Notifications
            </h2>
            <p className="text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              filter === 'all'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              filter === 'unread'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">
                {filter === 'unread' ? '✅' : '🔔'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h3>
              <p className="text-gray-400">
                {filter === 'unread' 
                  ? 'You have no unread notifications' 
                  : 'We\'ll notify you when something happens'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gradient-to-br ${getNotificationColor(notification.type)} border rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                  !notification.is_read ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-5xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full flex-shrink-0">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 mb-4">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-auto">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition text-sm"
                          >
                            View
                          </Link>
                        )}
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition text-sm"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold rounded-lg transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}