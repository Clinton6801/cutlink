'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface VerificationSubmissionProps {
  stylistId: string
  currentStatus: string
  onSuccess: () => void
}

export default function VerificationSubmission({
  stylistId,
  currentStatus,
  onSuccess
}: VerificationSubmissionProps) {
  const [notes, setNotes] = useState('')
  const [documents, setDocuments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const uploadDocument = async (file: File) => {
    try {
      setUploading(true)
      setError('')

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File must be less than 5MB')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPG, PNG, and PDF files are allowed')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `verification-${stylistId}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('stylist-portfolios')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('stylist-portfolios')
        .getPublicUrl(fileName)

      setDocuments([...documents, data.publicUrl])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = (url: string) => {
    setDocuments(documents.filter(doc => doc !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (documents.length === 0) {
      setError('Please upload at least one document')
      setSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('stylist_profiles')
        .update({
          verification_status: 'pending',
          verification_documents: documents,
          verification_notes: notes,
          submitted_at: new Date().toISOString()
        })
        .eq('user_id', stylistId)

      if (error) throw error

      alert('Verification submitted! We\'ll review your application within 24-48 hours.')
      onSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusInfo = () => {
    switch (currentStatus) {
      case 'verified':
        return {
          color: 'green',
          icon: '✅',
          title: 'Verified!',
          message: 'Your profile is verified and trusted by customers.'
        }
      case 'pending':
        return {
          color: 'yellow',
          icon: '⏳',
          title: 'Under Review',
          message: 'We\'re reviewing your verification documents. This usually takes 24-48 hours.'
        }
      case 'rejected':
        return {
          color: 'red',
          icon: '❌',
          title: 'Verification Rejected',
          message: 'Your verification was not approved. Please submit new documents.'
        }
      default:
        return {
          color: 'gray',
          icon: '⚠️',
          title: 'Not Verified',
          message: 'Get verified to build trust with customers and rank higher in search!'
        }
    }
  }

  const statusInfo = getStatusInfo()

  if (currentStatus === 'verified') {
    return (
      <div className="bg-green-500/10 border border-green-500 rounded-lg p-6 text-center">
        <div className="text-6xl mb-3">{statusInfo.icon}</div>
        <h3 className="text-xl font-bold text-green-500 mb-2">{statusInfo.title}</h3>
        <p className="text-gray-300">{statusInfo.message}</p>
      </div>
    )
  }

  if (currentStatus === 'pending') {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6 text-center">
        <div className="text-6xl mb-3">{statusInfo.icon}</div>
        <h3 className="text-xl font-bold text-yellow-500 mb-2">{statusInfo.title}</h3>
        <p className="text-gray-300 mb-4">{statusInfo.message}</p>
        <p className="text-sm text-gray-400">
          Check back soon or we'll notify you once reviewed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`bg-${statusInfo.color}-500/10 border border-${statusInfo.color}-500 rounded-lg p-6`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">{statusInfo.icon}</div>
          <div>
            <h3 className={`text-xl font-bold text-${statusInfo.color}-500 mb-2`}>
              {statusInfo.title}
            </h3>
            <p className="text-gray-300">{statusInfo.message}</p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 space-y-6">
        <h3 className="text-2xl font-bold text-white">Apply for Verification</h3>

        {/* What to Submit */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="font-bold text-yellow-500 mb-2">Required Documents:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Valid government-issued ID (Driver's License, National ID, or Passport)</li>
            <li>• Proof of experience (Certificate, previous work photos, etc.)</li>
            <li>• Recent photo of you with your barbering tools</li>
          </ul>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
            placeholder="Tell us about your experience, certifications, or anything that helps verify you..."
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Upload Documents * (Max 5MB each, JPG/PNG/PDF)
          </label>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {documents.map((doc, index) => (
                <div key={index} className="relative group">
                  {doc.endsWith('.pdf') ? (
                    <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-xs text-gray-400">PDF Document</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={doc}
                      alt={`Document ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-700"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeDocument(doc)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="block w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg text-center cursor-pointer transition">
            {uploading ? 'Uploading...' : `📎 ${documents.length > 0 ? 'Add Another Document' : 'Upload Documents'}`}
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            {documents.length} / 5 documents uploaded
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || documents.length === 0}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  )
}