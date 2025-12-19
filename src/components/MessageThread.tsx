'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { createNotification } from '../lib/createNotification'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
}

interface MessageThreadProps {
  currentUserId: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
}

export default function MessageThread({
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    
    // Subscribe to new messages in real-time
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          if (payload.new.sender_id === otherUserId) {
            setMessages(prev => [...prev, payload.new as Message])
            scrollToBottom()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false)

    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUserId,
            receiver_id: otherUserId,
            message: newMessage.trim(),
            is_read: false
          }
        ])

      if (error) throw error

      // ← ADD NOTIFICATION HERE
// Create notification for receiver
await createNotification(
  otherUserId,
  'new_message',
  'New Message 💬',
  newMessage.trim().substring(0, 100) + (newMessage.length > 100 ? '...' : ''),
  `/messages/${currentUserId}`
)

      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden">
          {otherUserAvatar ? (
            <img src={otherUserAvatar} alt={otherUserName} className="w-full h-full object-cover" />
          ) : (
            <div className="text-2xl">👤</div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-white">{otherUserName}</h3>
          <p className="text-xs text-gray-400">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-6xl mb-4">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSender = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isSender
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <p className="break-words">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isSender ? 'text-black/60' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}