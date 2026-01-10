'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createNotification } from '../../../lib/createNotification'
import { sendEmail } from '../../../lib/sendEmail'

interface VerificationRequest {
  id: string
  user_id: string
  bio: string
  years_of_experience: number
  verification_status: string
  verification_documents: string[]
  verification_notes: string
  admin_notes: string
  submitted_at: string
  profiles: {
    full_name: string
    phone_number: string
    avatar_url: string
  }
}

export default function AdminVerification() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

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

      // Check if admin
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !adminData) {
        alert('Access denied. Admin only.')
        router.push('/')
        return
      }

      await fetchRequests()
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('stylist_profiles')
        .select(`
          id,
          user_id,
          bio,
          years_of_experience,
          verification_status,
          verification_documents,
          verification_notes,
          admin_notes,
          submitted_at,
          profiles:user_id (
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setRequests(data as any || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const openModal = (request: VerificationRequest) => {
    setSelectedRequest(request)
    setAdminNotes(request.admin_notes || '')
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setAdminNotes('')
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    if (!confirm('Approve this verification request?')) return

    setProcessing(true)

    try {
      // Update stylist profile
      const { error } = await supabase
        .from('stylist_profiles')
        .update({
          verification_status: 'verified',
          is_verified: true,
          admin_notes: adminNotes,
          verified_at: new Date().toISOString(),
          verified_by: user.id
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      // Get stylist email
      const emailResponse = await fetch('/api/get-user-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedRequest.user_id })
      })

      const { email: stylistEmail } = await emailResponse.json()

      // Send approval email
      if (stylistEmail) {
        await sendEmail(
          stylistEmail,
          '🎉 Your CutLink Profile is Verified!',
          `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                  .success { background: #d4edda; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; }
                  .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>✂️ CutLink</h1>
                    <h2>Congratulations! 🎉</h2>
                  </div>
                  <div class="content">
                    <p>Hi <strong>${selectedRequest.profiles.full_name}</strong>,</p>
                    
                    <div class="success">
                      <h3>Your profile has been verified! ✅</h3>
                      <p>You now have a verified badge on your profile, which helps build trust with customers and improves your search ranking.</p>
                    </div>

                    <p><strong>What this means for you:</strong></p>
                    <ul>
                      <li>✅ Verified badge displayed on your profile</li>
                      <li>🔝 Higher ranking in search results</li>
                      <li>💰 More booking opportunities</li>
                      <li>🤝 Increased customer trust</li>
                    </ul>

                    ${adminNotes ? `<p><strong>Note from admin:</strong> ${adminNotes}</p>` : ''}
                    
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/stylist/dashboard" class="button">View Your Dashboard</a>

                    <p>Keep up the great work and continue providing excellent service to your customers!</p>
                  </div>
                  <div class="footer">
                    <p>© 2024 CutLink - Your barber, your way</p>
                  </div>
                </div>
              </body>
            </html>
          `
        )
      }

      // Create notification
      await createNotification(
        selectedRequest.user_id,
        'verification_approved',
        '🎉 Profile Verified!',
        'Congratulations! Your profile has been verified. You now have a verified badge.',
        '/stylist/dashboard'
      )

      alert('Verification approved!')
      await fetchRequests()
      closeModal()
    } catch (error: any) {
      alert('Error approving verification: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    
    const reason = prompt('Please provide a reason for rejection (required):')
    if (!reason) return

    setProcessing(true)

    try {
      // Update stylist profile
      const { error } = await supabase
        .from('stylist_profiles')
        .update({
          verification_status: 'rejected',
          is_verified: false,
          admin_notes: `${adminNotes}\n\nRejection reason: ${reason}`
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      // Get stylist email
      const emailResponse = await fetch('/api/get-user-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedRequest.user_id })
      })

      const { email: stylistEmail } = await emailResponse.json()

      // Send rejection email
      if (stylistEmail) {
        await sendEmail(
          stylistEmail,
          'CutLink Verification Update',
          `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                  .warning { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
                  .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>✂️ CutLink</h1>
                    <h2>Verification Update</h2>
                  </div>
                  <div class="content">
                    <p>Hi <strong>${selectedRequest.profiles.full_name}</strong>,</p>
                    
                    <div class="warning">
                      <h3>Your verification request needs attention</h3>
                      <p>Unfortunately, we couldn't approve your verification at this time.</p>
                    </div>

                    <p><strong>Reason:</strong></p>
                    <p>${reason}</p>

                    <p><strong>What to do next:</strong></p>
                    <ul>
                      <li>Review the reason above</li>
                      <li>Prepare the required documents</li>
                      <li>Submit a new verification request</li>
                    </ul>
                    
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/stylist/edit-profile" class="button">Resubmit Verification</a>

                    <p>If you have questions, please contact our support team.</p>
                  </div>
                  <div class="footer">
                    <p>© 2024 CutLink - Your barber, your way</p>
                  </div>
                </div>
              </body>
            </html>
          `
        )
      }

      // Create notification
      await createNotification(
        selectedRequest.user_id,
        'verification_rejected',
        'Verification Update',
        `Your verification needs attention. Reason: ${reason}`,
        '/stylist/edit-profile'
      )

      alert('Verification rejected')
      await fetchRequests()
      closeModal()
    } catch (error: any) {
      alert('Error rejecting verification: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'pending') return r.verification_status === 'pending'
    if (activeTab === 'approved') return r.verification_status === 'verified'
    if (activeTab === 'rejected') return r.verification_status === 'rejected'
    return false
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl text-gray-400">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold">
            <span className="text-yellow-500">Verification</span>
            <span className="text-white"> Management</span>
          </h1>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'pending'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⏳ Pending ({requests.filter(r => r.verification_status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'approved'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✅ Approved ({requests.filter(r => r.verification_status === 'verified').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`pb-4 px-2 font-bold transition ${
              activeTab === 'rejected'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ❌ Rejected ({requests.filter(r => r.verification_status === 'rejected').length})
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">No requests</h3>
              <p className="text-gray-400">No {activeTab} verification requests</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-yellow-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {request.profiles.avatar_url ? (
                        <img
                          src={request.profiles.avatar_url}
                          alt={request.profiles.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-3xl">👤</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {request.profiles.full_name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {request.years_of_experience} years experience
                      </p>
                      <p className="text-gray-400 text-sm">
                        Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Review Button */}
                  <button
                    onClick={() => openModal(request)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">
                  Review Verification
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-3xl"
                >
                  ✕
                </button>
              </div>

              {/* Stylist Info */}
              <div className="flex items-center gap-4 mb-8 p-6 bg-black rounded-xl">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden">
                  {selectedRequest.profiles.avatar_url ? (
                    <img
                      src={selectedRequest.profiles.avatar_url}
                      alt={selectedRequest.profiles.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">👤</div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedRequest.profiles.full_name}
                  </h3>
                  <p className="text-gray-400">{selectedRequest.profiles.phone_number}</p>
                  <p className="text-gray-400">{selectedRequest.years_of_experience} years experience</p>
                </div>
              </div>

              {/* Bio */}
              {selectedRequest.bio && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-2">Bio</h4>
                  <p className="text-gray-300">{selectedRequest.bio}</p>
                </div>
              )}

              {/* Stylist Notes */}
              {selectedRequest.verification_notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-2">Stylist Notes</h4>
                  <p className="text-gray-300">{selectedRequest.verification_notes}</p>
                </div>
              )}

              {/* Documents */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">
                  Submitted Documents ({selectedRequest.verification_documents.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedRequest.verification_documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500 transition"
                    >
                      {doc.endsWith('.pdf') ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-2">📄</div>
                            <p className="text-xs text-gray-400">View PDF</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={doc}
                          alt={`Document ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Add any notes for the stylist..."
                />
              </div>

              {/* Actions */}
              {selectedRequest.verification_status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-4 rounded-lg transition disabled:opacity-50"
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition disabled:opacity-50"
                  >
                    ✅ Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}