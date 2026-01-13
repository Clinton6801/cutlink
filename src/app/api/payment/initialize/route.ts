// Save as: src/app/api/payment/initialize/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { initializePayment } from '../../../../lib/paystack'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { bookingId, userId } = await request.json()

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, customer_id')
      .eq('id', bookingId)
      .eq('customer_id', userId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if already paid
    if (booking.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Booking already paid' },
        { status: 400 }
      )
    }

    // Get customer email
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    
    if (!user?.email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Generate unique payment reference
    const reference = `CL-${bookingId}-${Date.now()}`

    // Initialize Paystack payment
    const paymentData = await initializePayment({
      email: user.email,
      amount: booking.price,
      reference,
      metadata: {
        booking_id: bookingId,
        customer_id: userId,
        stylist_id: booking.stylist_id,
        custom_fields: [
          {
            display_name: 'Booking ID',
            variable_name: 'booking_id',
            value: bookingId
          }
        ]
      }
    })

    // Save payment reference to booking
    await supabase
      .from('bookings')
      .update({
        payment_reference: reference,
        payment_status: 'pending'
      })
      .eq('id', bookingId)

    return NextResponse.json({
      authorization_url: paymentData.authorization_url,
      access_code: paymentData.access_code,
      reference: paymentData.reference
    })

  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    )
  }
}