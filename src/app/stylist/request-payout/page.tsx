// Save as: src/app/stylist/request-payout/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PAYSTACK_CONFIG } from '../../../lib/paystack'

interface BankAccount {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_primary: boolean
}

interface PayoutRequest {
  id: string
  amount: number
  status: string
  created_at: string
  processed_at: string | null
  bank_account_id: string
  failure_reason: string | null
}

export default function RequestPayoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')

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
      await loadData(user.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (userId: string) => {
    try {
      // Get available balance
      const { data: balanceData } = await supabase
        .rpc('get_stylist_available_balance', {
          stylist_user_id: userId
        })
      
      setAvailableBalance(balanceData || 0)

      // Get bank accounts
      const { data: accountsData } = await supabase
        .from('stylist_bank_accounts')
        .select('*')
        .eq('stylist_id', userId)
        .order('is_primary', { ascending: false })

      setBankAccounts(accountsData || [])
      
      // Set primary account as default
      const primaryAccount = accountsData?.find(a => a.is_primary)
      if (primaryAccount) {
        setSelectedAccount(primaryAccount.id)
      }

      // Get payout requests
      const { data: requestsData } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('stylist_id', userId)
        .order('created_at', { ascending: false })

      setPayoutRequests(requestsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleRequestPayout = async () => {
    setError('')

    const requestAmount = parseInt(amount)

    // Validation
    if (!requestAmount || requestAmount < PAYSTACK_CONFIG.MIN_PAYOUT_AMOUNT) {
      setError(`Minimum payout amount is ₦${PAYSTACK_CONFIG.MIN_PAYOUT_AMOUNT.toLocaleString()}`)
      return
    }

    if (requestAmount > availableBalance) {
      setError('Insufficient balance')
      return
    }

    if (!selectedAccount) {
      setError('Please select a bank account')
      return
    }

    setRequesting(true)

    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          stylist_id: user.id,
          amount: requestAmount,
          bank_account_id: selectedAccount,
          status: 'pending'
        })

      if (error) throw error

      alert('Payout request submitted! Admin will process it within 24-48 hours.')
      setAmount('')
      await loadData(user.id)
    } catch (error: any) {
      setError(error.message || 'Failed to request payout')
    } finally {
      setRequesting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500'
      case 'processing': return 'bg-blue-500/20 text-blue-500'
      case 'pending': return 'bg-yellow-500/20 text-yellow-500'
      case 'failed': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-6xl animate-spin">⏳</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/stylist/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Request <span className="text-yellow-500">Payout</span>
          </h1>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 mb-8 text-center">
          <div className="text-sm text-black/80 mb-2">Available Balance</div>
          <div className="text-5xl font-bold text-black mb-4">
            ₦{availableBalance.toLocaleString()}
          </div>
          {availableBalance < PAYSTACK_CONFIG.MIN_PAYOUT_AMOUNT && (
            <p className="text-black/70 text-sm">
              Minimum ₦{PAYSTACK_CONFIG.MIN_PAYOUT_AMOUNT.toLocaleString()} required for payout
            </p>
          )}
        </div>

        {/* Bank Account Check */}
        {bankAccounts.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 text-center mb-8">
            <div className="text-6xl mb-4">🏦</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Bank Account Added</h3>
            <p className="text-gray-400 mb-6">Please add your bank account first to receive payouts</p>
            <Link
              href="/stylist/bank-account"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition"
            >
              Add Bank Account
            </Link>
          </div>
        ) : (
          <>
            {/* Request Payout Form */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Request New Payout</h3>

              <div className="space-y-6">
                {/* Select Account */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Bank Account
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  >
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bank_name} - {account.account_number} ({account.account_name})
                        {account.is_primary ? ' - PRIMARY' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    min={PAYSTACK_CONFIG.MIN_PAYOUT_AMOUNT}
                    max={availableBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder={`Min: ₦${PAYSTACK_CONFIG.MIN_PAYOUT_AMOUNT.toLocaleString()}`}
                  />
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => setAmount(availableBalance.toString())}
                      className="text-yellow-500 text-sm hover:underline"
                    >
                      Request All
                    </button>
                    <p className="text-gray-500 text-sm">
                      Available: ₦{availableBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleRequestPayout}
                  disabled={requesting || availableBalance < PAYSTACK_CONFIG.MIN_PAYOUT_AMOUNT || !amount}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requesting ? 'Submitting...' : 'Request Payout'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Payouts are processed within 24-48 hours by our team
                </p>
              </div>
            </div>

            {/* Payout History */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Payout History</h3>
              
              {payoutRequests.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h4 className="text-xl font-bold text-white mb-2">No payout requests yet</h4>
                  <p className="text-gray-400">Your payout requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payoutRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-white mb-1">
                            ₦{request.amount.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {new Date(request.created_at).toLocaleString()}
                          </div>
                          {request.processed_at && (
                            <div className="text-gray-500 text-xs mt-1">
                              Processed: {new Date(request.processed_at).toLocaleString()}
                            </div>
                          )}
                          {request.failure_reason && (
                            <div className="text-red-500 text-sm mt-2">
                              Reason: {request.failure_reason}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}