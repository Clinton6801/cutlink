// Save as: src/app/payment/callback/page.tsx

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ✅ Wrap the component that uses useSearchParams in Suspense
function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('reference')

      if (!reference) {
        setStatus('failed')
        setMessage('Payment reference not found')
        return
      }

      // Verify payment
      // This tells the whole browser to go to the verify route.
// The API will handle the database and then redirect the user to the dashboard.
window.location.href = `/api/payment/verify?reference=${reference}`;

      setStatus('success')
      setMessage('Payment successful! Redirecting to dashboard...')

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/customer/dashboard')
      }, 3000)

    } catch (error: any) {
      console.error('Verification error:', error)
      setStatus('failed')
      setMessage('An error occurred while verifying your payment')
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="text-6xl mb-6 animate-spin">⏳</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Verifying Payment...
            </h1>
            <p className="text-gray-400">
              Please wait while we confirm your payment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-green-500 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-300 mb-6">
              {message}
            </p>
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-green-500 text-sm">
                Your booking is confirmed and the stylist has been notified. 
                Funds will be held securely until your service is completed.
              </p>
            </div>
            <Link
              href="/customer/dashboard"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-red-500 mb-4">
              Payment Failed
            </h1>
            <p className="text-gray-300 mb-6">
              {message}
            </p>
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-500 text-sm">
                Don't worry, no charges were made to your account. 
                You can try again or contact support if the issue persists.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/customer/dashboard"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => router.back()}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

// ✅ Export with Suspense wrapper
export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-6xl animate-spin">⏳</div>
      </main>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}