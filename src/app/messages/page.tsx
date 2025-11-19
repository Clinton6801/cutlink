'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Conversation {
  otherUserId: string
  otherUserName: string
  otherUserAvatar: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function MessagesInbox() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

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

      setCurrentUser(user)
      await fetchConversations(user.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async (userId: string) => {
    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by conversation partner
      const conversationMap = new Map<string, any>()

      for (const message of messages || []) {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
        
        if (!conversationMap.has(otherUserId)) {
          // Get other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', otherUserId)
            .single()

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', userId)
            .eq('is_read', false)

          conversationMap.set(otherUserId, {
            otherUserId,
            otherUserName: profile?.full_name || 'Unknown User',
            otherUserAvatar: profile?.avatar_url || null,
            lastMessage: message.message,
            lastMessageTime: message.created_at,
            unreadCount: count || 0
          })
        }
      }

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl text-gray-400">Loading messages...</p>
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
        <h2 className="text-4xl font-bold text-white mb-8">
          <span className="text-yellow-500">Messages</span>
        </h2>

        {conversations.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400 mb-6">Start a conversation with a stylist!</p>
            <Link
              href="/browse"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition"
            >
              Browse Stylists
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Link
                key={conv.otherUserId}
                href={`/messages/${conv.otherUserId}`}
                className="block bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-yellow-500 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {conv.otherUserAvatar ? (
                      <img
                        src={conv.otherUserAvatar}
                        alt={conv.otherUserName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl">👤</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-lg">{conv.otherUserName}</h3>
                      {conv.unreadCount > 0 && (
                        <span className="bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.lastMessageTime).toLocaleString()}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="text-gray-600">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}