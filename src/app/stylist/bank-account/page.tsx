// Save as: src/app/stylist/bank-account/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBankList, resolveAccountNumber, createTransferRecipient } from '../../../lib/paystack'

interface BankAccount {
  id: string
  bank_name: string
  bank_code: string
  account_number: string
  account_name: string
  is_verified: boolean
  is_primary: boolean
  recipient_code: string | null
}

export default function BankAccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [banks, setBanks] = useState<any[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
  })
  
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    loadBanks()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      await loadAccounts(user.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // UPDATED: Logic to handle Paystack duplicate bank codes
  const loadBanks = async () => {
    try {
      const bankList = await getBankList()
      
      if (bankList && Array.isArray(bankList)) {
        // 1. Remove duplicates by bank code
        const uniqueBanks = bankList.reduce((acc: any[], current: any) => {
          const exists = acc.find(item => item.code === current.code)
          if (!exists) {
            return acc.concat([current])
          }
          return acc
        }, [])

        // 2. Sort alphabetically for better UX
        const sortedBanks = uniqueBanks.sort((a, b) => a.name.localeCompare(b.name))
        
        setBanks(sortedBanks)
      }
    } catch (error) {
      console.error('Error loading banks:', error)
    }
  }

  const loadAccounts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stylist_bank_accounts')
        .select('*')
        .eq('stylist_id', userId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error loading accounts:', error)
    }
  }

  const verifyAccount = async () => {
    if (!formData.bankCode || !formData.accountNumber) {
      setError('Please select a bank and enter account number')
      return
    }

    setVerifying(true)
    setError('')

    try {
      const accountDetails = await resolveAccountNumber(
        formData.accountNumber,
        formData.bankCode
      )

      setFormData({
        ...formData,
        accountName: accountDetails.account_name
      })

      alert('Account verified successfully!')
    } catch (error: any) {
      setError(error.message || 'Failed to verify account. Please check the details.')
    } finally {
      setVerifying(false)
    }
  }

  const handleSave = async () => {
    if (!formData.accountName) {
      setError('Please verify your account first')
      return
    }

    setSaving(true)
    setError('')

    try {
      const selectedBank = banks.find(b => b.code === formData.bankCode)
      
      if (!selectedBank) {
        throw new Error('Bank not found')
      }

      const recipient = await createTransferRecipient({
        type: 'nuban',
        name: formData.accountName,
        account_number: formData.accountNumber,
        bank_code: formData.bankCode
      })

      const { error } = await supabase
        .from('stylist_bank_accounts')
        .insert({
          stylist_id: user.id,
          bank_name: selectedBank.name,
          bank_code: formData.bankCode,
          account_number: formData.accountNumber,
          account_name: formData.accountName,
          recipient_code: recipient.recipient_code,
          is_verified: true,
          is_primary: accounts.length === 0
        })

      if (error) throw error

      alert('Bank account added successfully!')
      await loadAccounts(user.id)
      setShowAddForm(false)
      setFormData({ bankCode: '', accountNumber: '', accountName: '' })
    } catch (error: any) {
      setError(error.message || 'Failed to save account')
    } finally {
      setSaving(false)
    }
  }

  const setPrimaryAccount = async (accountId: string) => {
    try {
      await supabase
        .from('stylist_bank_accounts')
        .update({ is_primary: false })
        .eq('stylist_id', user.id)

      await supabase
        .from('stylist_bank_accounts')
        .update({ is_primary: true })
        .eq('id', accountId)

      await loadAccounts(user.id)
      alert('Primary account updated')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteAccount = async (accountId: string) => {
    if (!confirm('Delete this bank account?')) return

    try {
      await supabase
        .from('stylist_bank_accounts')
        .delete()
        .eq('id', accountId)

      await loadAccounts(user.id)
      alert('Account deleted')
    } catch (error) {
      console.error('Error:', error)
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
    <main className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/stylist/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Bank <span className="text-yellow-500">Account</span>
          </h1>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Bank <span className="text-yellow-500">Accounts</span>
          </h2>
          <p className="text-gray-400">Add your bank account to receive payouts</p>
        </div>

        {/* Saved Accounts List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Your Accounts</h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition"
              >
                + Add Account
              </button>
            )}
          </div>

          {accounts.length === 0 && !showAddForm ? (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🏦</div>
              <h3 className="text-2xl font-bold text-white mb-2">No bank account added</h3>
              <p className="text-gray-400 mb-6">Add your bank account to receive payouts</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition"
              >
                Add Bank Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-white">{account.bank_name}</h4>
                        {account.is_primary && (
                          <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">PRIMARY</span>
                        )}
                        {account.is_verified && <span className="text-green-500">✓</span>}
                      </div>
                      <p className="text-gray-300 font-mono text-lg">{account.account_number}</p>
                      <p className="text-gray-400">{account.account_name}</p>
                    </div>
                    <div className="flex gap-2">
                      {!account.is_primary && (
                        <button
                          onClick={() => setPrimaryAccount(account.id)}
                          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 font-bold rounded-lg transition text-sm"
                        >
                          Set as Primary
                        </button>
                      )}
                      <button
                        onClick={() => deleteAccount(account.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold rounded-lg transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Account</h3>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ bankCode: '', accountNumber: '', accountName: '' })
                  setError('')
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >✕</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Select Bank</label>
                <select
                  value={formData.bankCode}
                  onChange={(e) => setFormData({ ...formData, bankCode: e.target.value, accountName: '' })}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none appearance-none"
                >
                  <option value="">Choose your bank</option>
                  {/* UPDATED: Key now uses code + index for absolute uniqueness */}
                  {banks.map((bank, idx) => (
                    <option key={`${bank.code}-${idx}`} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Account Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, ''), accountName: '' })}
                    className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="0123456789"
                  />
                  <button
                    onClick={verifyAccount}
                    disabled={verifying || !formData.bankCode || formData.accountNumber.length !== 10}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              {formData.accountName && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Account Name</label>
                  <div className="px-4 py-3 bg-green-500/10 border border-green-500 rounded-lg">
                    <p className="text-green-500 font-bold">✓ {formData.accountName}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !formData.accountName}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}