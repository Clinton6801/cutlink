'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '../../../components/ImageUpload'
import WorkingHoursSettings from '../../../components/WorkingHoursSettings'
import ServiceManager from '../../../components/ServiceManager'
import VerificationSubmission from '../../../components/VerificationSubmission'

export default function EditStylistProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string>('') 
  const [uploadingAvatar, setUploadingAvatar] = useState(false) 
  const [verificationStatus, setVerificationStatus] = useState('unverified')
  
  const [formData, setFormData] = useState({
    bio: '',
    yearsOfExperience: 0,
    specialties: [] as string[],
    serviceType: 'both',
    shopAddress: '',
    location: '', 
    priceRangeMin: 0,
    priceRangeMax: 0,
  })

  const [workingHours, setWorkingHours] = useState<any>({ // ← ADD THIS
  monday: { enabled: true, start: '09:00', end: '18:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00' },
  friday: { enabled: true, start: '09:00', end: '18:00' },
  saturday: { enabled: true, start: '09:00', end: '18:00' },
  sunday: { enabled: false, start: '09:00', end: '18:00' },
})

  const specialtyOptions = [
    'Fade', 'Buzz Cut', 'Afro', 'Dreadlocks', 'Braids',
    'Cornrows', 'Twists', 'Low Cut', 'Beard Trim', 'Hair Coloring'
  ]

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Get stylist profile
      const { data: stylistData, error } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (stylistData) {
        setFormData({
          bio: stylistData.bio || '',
          yearsOfExperience: stylistData.years_of_experience || 0,
          specialties: stylistData.specialties || [],
          serviceType: stylistData.service_type || 'both',
          shopAddress: stylistData.shop_address || '',
          location: stylistData.location || '', // ← ADD THIS
          priceRangeMin: stylistData.price_range_min || 0,
          priceRangeMax: stylistData.price_range_max || 0,
        })
        setPortfolioImages(stylistData.portfolio_images || [])
        setWorkingHours(stylistData.working_hours || workingHours)
      }

      // Get user profile for avatar
const { data: profileData } = await supabase
  .from('profiles')
  .select('avatar_url')
  .eq('id', user.id)
  .single()

if (profileData) {
  setAvatarUrl(profileData.avatar_url || '')
}
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

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

        // ← ADD THIS ENTIRE FUNCTION HERE
const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
  try {
    setUploadingAvatar(true)

    if (!event.target.files || event.target.files.length === 0) {
      throw new Error('You must select an image to upload.')
    }

    const file = event.target.files[0]
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('stylist-portfolios')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('stylist-portfolios')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    setAvatarUrl(data.publicUrl)
    alert('Avatar updated successfully!')
    
    // Reset input
    event.target.value = ''
  } catch (error: any) {
    alert('Error uploading avatar: ' + error.message)
    console.error('Error uploading avatar:', error)
  } finally {
    setUploadingAvatar(false)
  }
}

  const handleImageUpload = (url: string) => {
    setPortfolioImages([...portfolioImages, url])
  }

  const removeImage = async (imageUrl: string) => {
    if (!confirm('Delete this image?')) return

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Delete from storage
      await supabase.storage
        .from('stylist-portfolios')
        .remove([fileName])

      // Remove from state
      setPortfolioImages(portfolioImages.filter(img => img !== imageUrl))
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const { error } = await supabase
        .from('stylist_profiles')
        .update({
          bio: formData.bio,
          years_of_experience: formData.yearsOfExperience,
          specialties: formData.specialties,
          service_type: formData.serviceType,
          shop_address: formData.shopAddress,
          location: formData.location,
          price_range_min: formData.priceRangeMin,
          price_range_max: formData.priceRangeMax,
          portfolio_images: portfolioImages,
          working_hours: workingHours,
        })
        .eq('user_id', user.id)

      if (error) throw error

      alert('Profile updated successfully!')
      router.push('/stylist/dashboard')
    } catch (error: any) {
      alert('Error updating profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✂️</div>
          <p className="text-xl text-gray-400">Loading profile...</p>
        </div>
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
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">✂️</span>
            <h1 className="text-2xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </Link>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Edit Your <span className="text-yellow-500">Profile</span>
          </h2>
          <p className="text-gray-400">Update your information and portfolio</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 space-y-8">

          <div className="text-center">
    <label className="block text-sm font-medium text-gray-300 mb-4">
      Profile Picture
    </label>
    
    {/* Current Avatar */}
    <div className="mb-4 flex justify-center">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">👤</div>
        )}
      </div>
    </div>

    {/* Upload Button */}
    <label
      htmlFor="avatar-upload"
      className={`
        inline-flex items-center justify-center px-6 py-3 
        border-2 border-dashed rounded-lg cursor-pointer transition
        ${uploadingAvatar 
          ? 'border-gray-600 bg-gray-800 cursor-not-allowed' 
          : 'border-gray-700 bg-black hover:border-yellow-500 hover:bg-gray-900'
        }
      `}
    >
      {uploadingAvatar ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          <span className="text-gray-400">Uploading...</span>
        </>
      ) : (
        <>
          <span className="text-2xl mr-2">📸</span>
          <span className="text-yellow-500 font-medium">
            {avatarUrl ? 'Change Picture' : 'Upload Picture'}
          </span>
        </>
      )}
    </label>
    <input
      id="avatar-upload"
      type="file"
      accept="image/*"
      onChange={uploadAvatar}
      disabled={uploadingAvatar}
      className="hidden"
    />
    < p className="text-xs text-gray-500 mt-2">
      PNG, JPG, JPEG (MAX. 5MB)
    </p>
  </div>
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Tell customers about yourself and your skills..."
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Specialties
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
            <label className="block text-sm font-medium text-gray-300 mb-3">
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

          <div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Location/Area
  </label>
  <select
    value={formData.location}
    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
  >
    <option value="">Select your location</option>
    <option value="Lagos">Lagos</option>
    <option value="Abuja">Abuja</option>
    <option value="Port Harcourt">Port Harcourt</option>
    <option value="Ibadan">Ibadan</option>
    <option value="Kano">Kano</option>
    <option value="Benin City">Benin City</option>
    <option value="Enugu">Enugu</option>
    <option value="Kaduna">Kaduna</option>
    <option value="Jos">Jos</option>
    <option value="Calabar">Calabar</option>
    <option value="Warri">Warri</option>
    <option value="Abeokuta">Abeokuta</option>
    <option value="Ilorin">Ilorin</option>
    <option value="Owerri">Owerri</option>
    <option value="Akure">Akure</option>
    <option value="Other">Other</option>
  </select>
</div>

          {/* Shop Address */}
          {(formData.serviceType === 'shop' || formData.serviceType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shop Address
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Price (₦)
              </label>
              <input
                type="number"
                min="0"
                value={formData.priceRangeMin}
                onChange={(e) => setFormData({ ...formData, priceRangeMin: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Price (₦)
              </label>
              <input
                type="number"
                min="0"
                value={formData.priceRangeMax}
                onChange={(e) => setFormData({ ...formData, priceRangeMax: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Working Hours */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-3">
    Working Hours
  </label>
  <p className="text-sm text-gray-400 mb-4">
    Set your available days and hours. Customers can only book during these times.
  </p>
  <WorkingHoursSettings
    initialHours={workingHours}
    onChange={setWorkingHours}
  />
</div>

{/* Services Menu */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-3">
    Services & Pricing
  </label>
  <p className="text-sm text-gray-400 mb-4">
    Create a menu of services you offer with individual prices. Customers will choose from this menu when booking.
  </p>
  <ServiceManager stylistId={user?.id || ''} />
</div>


          {/* Portfolio Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Portfolio Images
            </label>
            
            {/* Image Upload */}
            <ImageUpload
              onUploadComplete={handleImageUpload}
              currentImages={portfolioImages}
              maxImages={6}
            />

            {/* Display Uploaded Images */}
            {portfolioImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {portfolioImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      onClick={() => removeImage(imageUrl)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/stylist/dashboard')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}