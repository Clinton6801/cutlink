'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StylistSignup() {
  const router = useRouter()
  const [step, setStep] = useState(1) // Multi-step form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword:'',
    fullName: '',
    phoneNumber: '',
    bio: '',
    yearsOfExperience: '',
    specialties: [] as string[],
    serviceType: 'both',
    shopAddress: '',
    priceRangeMin: '',
    priceRangeMax: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const specialtyOptions = [
    'Fade', 'Buzz Cut', 'Afro', 'Dreadlocks', 'Braids', 
    'Cornrows', 'Twists', 'Low Cut', 'Beard Trim', 'Hair Coloring'
  ]

  const toggleSpecialty = (specialty: string) => {
    if (formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(s => s !== specialty)
      })
    } else {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      })
    }
  }

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
              user_type: 'stylist',
              full_name: formData.fullName,
              phone_number: formData.phoneNumber,
            }
          ])

        if (profileError) throw profileError

        // 3. Create stylist profile
        const { error: stylistError } = await supabase
          .from('stylist_profiles')
          .insert([
            {
              user_id: authData.user.id,
              bio: formData.bio,
              years_of_experience: parseInt(formData.yearsOfExperience) || 0,
              specialties: formData.specialties,
              service_type: formData.serviceType,
              shop_address: formData.shopAddress,
              price_range_min: parseInt(formData.priceRangeMin) || 0,
              price_range_max: parseInt(formData.priceRangeMax) || 0,
            }
          ])

        if (stylistError) throw stylistError

        // Success!
        alert('Stylist account created successfully! Check your email to verify.')
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
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">✂️</span>
            <h1 className="text-3xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Join as a Stylist</h2>
          <p className="text-gray-400">Start earning and grow your business</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`h-2 w-24 rounded-full ${step >= 1 ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
          <div className={`h-2 w-24 rounded-full ${step >= 2 ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
        </div>

        {/* Signup Form */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <h3 className="text-2xl font-bold text-yellow-500 mb-4">Basic Information</h3>
                
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
                    required
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

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
                >
                  Continue
                </button>
              </>
            )}

            {/* Step 2: Professional Info */}
            {step === 2 && (
              <>
                <h3 className="text-2xl font-bold text-yellow-500 mb-4">Professional Details</h3>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="Tell customers about yourself and your skills..."
                  />
                </div>

                {/* Years of Experience */}
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Specialties (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialtyOptions.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-4 py-2 rounded-lg border transition ${
                          formData.specialties.includes(specialty)
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : 'bg-black text-gray-300 border-gray-700 hover:border-yellow-500'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Service Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['home_service', 'shop', 'both'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, serviceType: type })}
                        className={`px-4 py-2 rounded-lg border transition capitalize ${
                          formData.serviceType === type
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : 'bg-black text-gray-300 border-gray-700 hover:border-yellow-500'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shop Address (if applicable) */}
                {(formData.serviceType === 'shop' || formData.serviceType === 'both') && (
                  <div>
                    <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-300 mb-2">
                      Shop Address
                    </label>
                    <input
                      id="shopAddress"
                      type="text"
                      value={formData.shopAddress}
                      onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="Enter your shop address"
                    />
                  </div>
                )}

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priceMin" className="block text-sm font-medium text-gray-300 mb-2">
                      Min Price (₦)
                    </label>
                    <input
                      id="priceMin"
                      type="number"
                      min="0"
                      value={formData.priceRangeMin}
                      onChange={(e) => setFormData({ ...formData, priceRangeMin: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label htmlFor="priceMax" className="block text-sm font-medium text-gray-300 mb-2">
                      Max Price (₦)
                    </label>
                    <input
                      id="priceMax"
                      type="number"
                      min="0"
                      value={formData.priceRangeMax}
                      onChange={(e) => setFormData({ ...formData, priceRangeMax: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="5000"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
  <input type="checkbox" required />
  <span className="text-sm text-gray-300">
    I agree to the{' '}
    <Link href="/terms" className="text-yellow-500 hover:underline">
      Terms of Service
    </Link>{' '}
    and{' '}
    <Link href="/privacy" className="text-yellow-500 hover:underline">
      Privacy Policy
    </Link>
  </span>
</label>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Complete Signup'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium">
              Log in
            </Link>
          </p>
        </div>

        {/* Customer Signup Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Looking for a stylist?{' '}
            <Link href="/signup/customer" className="text-yellow-500 hover:text-yellow-400 font-medium">
              Sign up as Customer
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}