// Save as: src/components/PaymentButton.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PaymentButtonProps {
  bookingId: string
  amount: number
  onSuccess?: () => void
}

export default function PaymentButton({ bookingId, amount, onSuccess }: PaymentButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')

      // Get current user
      const { supabase } = await import('../lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Initialize payment
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          userId: user.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url

    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>💳</span>
            <span>Pay ₦{amount.toLocaleString()}</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 text-center text-xs text-gray-500">
        <p>🔒 Secured by Paystack</p>
        <p>Your payment is protected</p>
      </div>
    </div>
  )
}