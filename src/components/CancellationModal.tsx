'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface CancellationModalProps {
  bookingId: string
  userType: 'customer' | 'stylist'
  onClose: () => void
  onSuccess: () => void
}

export default function CancellationModal({
  bookingId,
  userType,
  onClose,
  onSuccess
}: CancellationModalProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const cancellationReasons = userType === 'customer' 
    ? [
        'Found another stylist',
        'Change of plans',
        'Pricing issue',
        'Stylist not responding',
        'Emergency came up',
        'Other'
      ]
    : [
        'Scheduling conflict',
        'Emergency',
        'Customer not responding',
        'Unable to reach location',
        'Personal reasons',
        'Other'
      ]

  const handleCancel = async (e: React.FormEvent) => {
  e.preventDefault()
  console.log('=== FORM SUBMITTED ===') // ← DEBUG
  console.log('Booking ID:', bookingId) // ← DEBUG
  console.log('Reason:', reason) // ← DEBUG
  console.log('User Type:', userType) // ← DEBUG
  
  setSubmitting(true)
  setError('')

  if (!reason) {
    console.log('No reason selected!') // ← DEBUG
    setError('Please select a reason for cancellation')
    setSubmitting(false)
    return
  }

  try {
    console.log('Attempting to update booking...') // ← DEBUG
    
    const { error: updateError, data } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: userType,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    console.log('Update response:', { data, updateError }) // ← DEBUG

    if (updateError) {
      console.error('Update error:', updateError) // ← DEBUG
      throw updateError
    }

    console.log('Success! Calling onSuccess()') // ← DEBUG
    onSuccess()
  } catch (error: any) {
    console.error('Caught error:', error) // ← DEBUG
    setError(error.message)
  } finally {
    setSubmitting(false)
  }
}
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Cancel Booking?</h2>
          <p className="text-gray-400">
            {userType === 'customer' 
              ? 'Please let us know why you\'re cancelling'
              : 'Please provide a reason for the customer'
            }
          </p>
        </div>

        <form onSubmit={handleCancel} className="space-y-6">
          {/* Cancellation Reasons */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Reason for Cancellation
            </label>
            <div className="space-y-2">
              {cancellationReasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                    reason === r
                      ? 'bg-yellow-500/10 border-yellow-500'
                      : 'bg-black border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-white">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              <strong>Note:</strong> {userType === 'customer' 
                ? 'Frequent cancellations may affect your ability to book in the future.'
                : 'The customer will be notified of the cancellation immediately.'
              }
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={submitting || !reason}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}