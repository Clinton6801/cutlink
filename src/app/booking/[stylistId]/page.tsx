'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { sendEmail } from '../../../lib/sendEmail'
import { emailTemplates } from '../../../lib/emailTemplates'
import Link from 'next/link'

interface StylistInfo {
  user_id: string
  service_type: string
  price_range_min: number
  price_range_max: number
  shop_address: string
  profiles: {
    full_name: string
    avatar_url: string
  }
  working_hours: {
    [day: string]: {
      enabled: boolean
      start: string
      end: string
    }
  }
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const stylistId = params.stylistId as string

  const [stylist, setStylist] = useState<StylistInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [services, setServices] = useState<any[]>([]) // ← ADD THIS
  const [selectedService, setSelectedService] = useState<any>(null)

  const [bookingData, setBookingData] = useState({
    serviceType: '',
    appointmentDate: '',
    appointmentTime: '',
    location: '',
    serviceDescription: '',
    estimatedPrice: ''
  })

  useEffect(() => {
    checkUser()
    fetchStylistInfo()
    fetchServices()
  }, [stylistId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login')
    } else {
      setCurrentUser(user)
    }
  }

  // ← ADD THIS FUNCTION
const fetchServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('stylist_id', stylistId)
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) throw error
    setServices(data || [])
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

  // ← ADD THIS ENTIRE FUNCTION
const generateAvailableSlots = async (date: string, workingHours: any) => {
  if (!date) {
    setAvailableSlots([])
    return
  }

  const selectedDate = new Date(date)
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  
  // Check if stylist works on this day
  if (!workingHours[dayName]?.enabled) {
    setAvailableSlots([])
    return
  }

  const { start, end } = workingHours[dayName]
  
  // Get existing bookings for this date
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('appointment_time')
    .eq('stylist_id', stylistId)
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])

  const bookedTimes = existingBookings?.map(b => b.appointment_time) || []

  // Generate slots between start and end time
  const slots: string[] = []
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)

  let currentHour = startHour
  let currentMin = startMin

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
    
    // Only add if not already booked
    if (!bookedTimes.includes(timeSlot)) {
      slots.push(timeSlot)
    }

    // Increment by 30 minutes
    currentMin += 30
    if (currentMin >= 60) {
      currentMin = 0
      currentHour++
    }
  }

  setAvailableSlots(slots)
}

  const fetchStylistInfo = async () => {
  try {
    setLoading(true)
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select(`
        user_id,
        service_type,
        price_range_min,
        price_range_max,
        shop_address,
        working_hours,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', stylistId)
      .single()

    if (error) throw error
    setStylist(data as any)

    // Pre-fill location if shop service
    if (data.service_type === 'shop') {
      setBookingData(prev => ({
        ...prev,
        serviceType: 'shop',
        location: data.shop_address
      }))
    }
  } catch (error) {
    console.error('Error fetching stylist:', error)
  } finally {
    setLoading(false)
  }
}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!currentUser) {
        throw new Error('You must be logged in to book')
      }

      // Create booking in database
      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            customer_id: currentUser.id,
            stylist_id: stylistId,
            service_type: bookingData.serviceType,
            appointment_date: bookingData.appointmentDate,
            appointment_time: bookingData.appointmentTime,
            location: bookingData.location,
            service_description: bookingData.serviceDescription,
            price: parseInt(bookingData.estimatedPrice),
            status: 'pending',
            payment_status: 'pending'
          }
        ])
        .select()

      if (bookingError) throw bookingError

        // ← ADD EMAIL SENDING HERE
// Get stylist email via API
const emailResponse = await fetch('/api/get-user-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: stylistId })
})

const { email: stylistEmail } = await emailResponse.json()

if (stylistEmail) {
  // Get current user's name
  const { data: customerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', currentUser.id)
    .single()

  // Send email to stylist
  const emailContent = emailTemplates.newBooking(
    stylist?.profiles?.full_name || 'Stylist',
    customerProfile?.full_name || 'Customer',
    new Date(bookingData.appointmentDate).toLocaleDateString(),
    bookingData.appointmentTime,
    bookingData.location,
    parseInt(bookingData.estimatedPrice)
  )

  try {
    await sendEmail(stylistEmail, emailContent.subject, emailContent.html)
  } catch (emailError) {
    console.error('Failed to send email:', emailError)
  }
}
      // Success! Redirect to customer dashboard
      alert('Booking request sent successfully! The stylist will confirm shortly.')
      router.push('/customer/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Generate time slots (8 AM - 8 PM)
  const timeSlots = []
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 20) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✂️</div>
          <p className="text-xl text-gray-400">Loading booking page...</p>
        </div>
      </main>
    )
  }

  if (!stylist) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-2">Stylist not found</h2>
          <Link href="/browse" className="text-yellow-500 hover:text-yellow-400">
            ← Back to browse
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/stylist/${stylistId}`} className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
            <span>←</span>
            <span>Back to Profile</span>
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
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Book Your <span className="text-yellow-500">Appointment</span>
          </h2>
          <p className="text-gray-400">Fill in the details below to book with {stylist.profiles.full_name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Stylist Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 sticky top-6">
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-gray-800 flex items-center justify-center overflow-hidden">
                {stylist.profiles.avatar_url ? (
                  <img
                    src={stylist.profiles.avatar_url}
                    alt={stylist.profiles.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-5xl">👤</div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-4">
                {stylist.profiles.full_name}
              </h3>

              {/* Price Range */}
              <div className="bg-black rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-400 mb-1">Price Range</div>
                <div className="text-xl font-bold text-yellow-500">
                  ₦{stylist.price_range_min.toLocaleString()} - ₦{stylist.price_range_max.toLocaleString()}
                </div>
              </div>

              {/* Booking Summary */}
              {bookingData.appointmentDate && bookingData.appointmentTime && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="text-sm text-yellow-500 font-bold mb-2">Booking Summary</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white font-medium">
                        {new Date(bookingData.appointmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-white font-medium">{bookingData.appointmentTime}</span>
                    </div>
                    {bookingData.serviceType && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-medium capitalize">
                          {bookingData.serviceType.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Service Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(stylist.service_type === 'home_service' || stylist.service_type === 'both') && (
                      <button
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, serviceType: 'home_service', location: '' })}
                        className={`p-4 rounded-lg border-2 transition ${
                          bookingData.serviceType === 'home_service'
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-gray-700 bg-black hover:border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">🏠</div>
                        <div className="font-bold text-white">Home Service</div>
                        <div className="text-xs text-gray-400">Stylist comes to you</div>
                      </button>
                    )}
                    {(stylist.service_type === 'shop' || stylist.service_type === 'both') && (
                      <button
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, serviceType: 'shop', location: stylist.shop_address })}
                        className={`p-4 rounded-lg border-2 transition ${
                          bookingData.serviceType === 'shop'
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-gray-700 bg-black hover:border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">🏪</div>
                        <div className="font-bold text-white">Shop Visit</div>
                        <div className="text-xs text-gray-400">Visit their shop</div>
                      </button>
                    )}
                  </div>
                </div>

               {/* Date */}
<div>
  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
    Appointment Date *
  </label>
  <input
    id="date"
    type="date"
    required
    min={minDate}
    value={bookingData.appointmentDate}
    onChange={(e) => {
      setBookingData({ ...bookingData, appointmentDate: e.target.value, appointmentTime: '' })
      if (stylist?.working_hours) {
        generateAvailableSlots(e.target.value, stylist.working_hours)
      }
    }}
    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
  />
</div>

{/* Time */}
<div>
  <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
    Appointment Time *
  </label>
  {bookingData.appointmentDate ? (
    availableSlots.length > 0 ? (
      <select
        id="time"
        required
        value={bookingData.appointmentTime}
        onChange={(e) => setBookingData({ ...bookingData, appointmentTime: e.target.value })}
        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
      >
        <option value="">Select a time</option>
        {availableSlots.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    ) : (
      <div className="w-full px-4 py-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center">
        No available slots for this date. Stylist is not working or fully booked.
      </div>
    )
  ) : (
    <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 text-center">
      Please select a date first
    </div>
  )}
</div>
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    id="location"
                    type="text"
                    required
                    value={bookingData.location}
                    onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                    readOnly={bookingData.serviceType === 'shop'}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none disabled:opacity-50"
                    placeholder={bookingData.serviceType === 'home_service' ? 'Enter your address' : 'Shop location'}
                  />
                  {bookingData.serviceType === 'home_service' && (
                    <p className="text-xs text-gray-400 mt-1">
                      Enter your full address including landmarks
                    </p>
                  )}
                </div>

                {/* Service Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Service Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={bookingData.serviceDescription}
                    onChange={(e) => setBookingData({ ...bookingData, serviceDescription: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="Describe the haircut/style you want..."
                  />
                </div>

                {/* Estimated Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Price (₦) *
                  </label>
                  <input
                    id="price"
                    type="number"
                    required
                    min={stylist.price_range_min}
                    max={stylist.price_range_max}
                    value={bookingData.estimatedPrice}
                    onChange={(e) => setBookingData({ ...bookingData, estimatedPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder={`${stylist.price_range_min} - ${stylist.price_range_max}`}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Price range: ₦{stylist.price_range_min.toLocaleString()} - ₦{stylist.price_range_max.toLocaleString()}
                  </p>
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
                  disabled={submitting}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending Request...' : 'Confirm Booking'}
                </button>

                <p className="text-sm text-gray-400 text-center">
                  Your booking request will be sent to the stylist for confirmation. You'll be notified once confirmed.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}