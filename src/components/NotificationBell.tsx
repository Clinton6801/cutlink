// Save as: src/components/NotificationBell.tsx
// This replaces your existing NotificationBell component

'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { markAsRead, markAllAsRead } from '../lib/createNotification'
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

interface NotificationBellProps {
  userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    
    // Set up realtime subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      channel.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    await fetchNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId)
    await fetchNotifications()
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id)
    }
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return '✅'
      case 'booking_cancelled':
        return '❌'
      case 'booking_completed':
        return '🎉'
      case 'new_booking':
        return '📅'
      case 'new_message':
        return '💬'
      case 'verification_approved':
        return '✓'
      case 'verification_rejected':
        return '⚠️'
      default:
        return '🔔'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffMs = now.getTime() - notifTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifTime.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-yellow-500 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-yellow-500">
                  ({unreadCount} new)
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-yellow-500 hover:text-yellow-400 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2 animate-spin">⏳</div>
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h4 className="text-xl font-bold text-white mb-2">
                  No notifications yet
                </h4>
                <p className="text-gray-400 text-sm">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      notification.is_read
                        ? 'bg-transparent hover:bg-gray-800/30'
                        : 'bg-yellow-500/5 hover:bg-yellow-500/10'
                    }`}
                  >
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => handleNotificationClick(notification)}
                        className="block"
                      >
                        <NotificationContent
                          notification={notification}
                          getNotificationIcon={getNotificationIcon}
                          getTimeAgo={getTimeAgo}
                        />
                      </Link>
                    ) : (
                      <div
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="cursor-pointer"
                      >
                        <NotificationContent
                          notification={notification}
                          getNotificationIcon={getNotificationIcon}
                          getTimeAgo={getTimeAgo}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-400 hover:text-yellow-500 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Separate component for notification content
function NotificationContent({
  notification,
  getNotificationIcon,
  getTimeAgo
}: {
  notification: Notification
  getNotificationIcon: (type: string) => string
  getTimeAgo: (timestamp: string) => string
}) {
  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="text-3xl flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white mb-1 truncate">
          {notification.title}
        </h4>
        <p className="text-sm text-gray-300 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {getTimeAgo(notification.created_at)}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  )
}