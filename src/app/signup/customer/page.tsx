'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CustomerSignup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword:'',
    fullName: '',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false) 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

        if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match!')
    setLoading(false)
    return
  }

  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters')
    setLoading(false)
    return
  }

    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // 2. Create profile in profiles table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              user_type: 'customer',
              full_name: formData.fullName,
              phone_number: formData.phoneNumber,
            }
          ])

        if (profileError) throw profileError

        // Success! Redirect to customer dashboard (we'll build this later)
        alert('Account created successfully! Check your email to verify.')
        router.push('/login')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">✂️</span>
            <h1 className="text-3xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Sign up to find your perfect stylist</p>
        </div>

        {/* Signup Form */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                placeholder="+234 XXX XXX XXXX"
              />
            </div>

           {/* Password */}
<div>
  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
    Password
  </label>
  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      required
      value={formData.password}
      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none pr-12"
      placeholder="At least 6 characters"
      minLength={6}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      {showPassword ? '👁️' : '👁️‍🗨️'}
    </button>
  </div>
</div>

{/* Confirm Password */}
<div>
  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
    Confirm Password
  </label>
  <div className="relative">
    <input
      id="confirmPassword"
      type={showConfirmPassword ? "text" : "password"}
      required
      value={formData.confirmPassword}
      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none pr-12"
      placeholder="Confirm your password"
      minLength={6}
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
    </button>
  </div>
  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
  )}
</div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium">
              Log in
            </Link>
          </p>
        </div>

        {/* Stylist Signup Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Are you a stylist?{' '}
            <Link href="/signup/stylist" className="text-yellow-500 hover:text-yellow-400 font-medium">
              Join as a Stylist
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}