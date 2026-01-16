// Save as: src/app/api/payment/verify/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPayment, calculateStylistPayout } from '../../../../lib/paystack'
import { createNotification } from '../../../../lib/createNotification'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference required' },
        { status: 400 }
      )
    }

    // 1. Verify payment with Paystack
    const paymentData = await verifyPayment(reference)

    if (paymentData.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment not successful', data: paymentData },
        { status: 400 }
      )
    }

    // 2. Get booking from metadata
    const bookingId = paymentData.metadata?.booking_id

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID not found in payment metadata' },
        { status: 400 }
      )
    }

    // 3. Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 4. PREVENT DOUBLE-CREDITING: Check if already paid
    if (booking.payment_status === 'paid') {
      return NextResponse.json({ success: true, message: 'Payment already processed' })
    }

    // 5. Update booking payment status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        payment_verified_at: new Date().toISOString(),
        payment_amount: paymentData.amount / 100,
        payment_channel: paymentData.channel,
        payment_ip_address: paymentData.ip_address
      })
      .eq('id', bookingId)

    if (updateError) throw updateError

    // 6. Calculate payout breakdown
    const payout = calculateStylistPayout(booking.price)

    // 7. NEW: Update Stylist's Available Balance
    // We call the SQL function we created in Supabase
    const { error: balanceError } = await supabase.rpc('increment_balance', {
      user_id: booking.stylist_id,
      amount: payout.stylistPayout // The actual amount the stylist keeps
    })

    if (balanceError) {
      console.error('Error updating balance:', balanceError)
      // We don't throw here to ensure the rest of the flow finishes, 
      // but you should log this for manual correction if it fails.
    }

    // 8. Create earnings record
    const { data: existingEarnings } = await supabase
      .from('stylist_earnings')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (!existingEarnings) {
      await supabase
        .from('stylist_earnings')
        .insert({
          booking_id: bookingId,
          stylist_id: booking.stylist_id,
          booking_amount: payout.bookingAmount,
          platform_commission: payout.platformCommission,
          paystack_fee: payout.paystackFee,
          stylist_payout: payout.stylistPayout,
          status: 'completed', // Changed from 'held' to 'completed' so it shows in balance
          payment_date: new Date().toISOString()
        })
    }

    // 9. Notify stylist
    await createNotification(
      booking.stylist_id,
      'payment_received',
      '💰 Payment Received!',
      `You've received ₦${payout.stylistPayout.toLocaleString()}. Balance updated!`,
      '/stylist/dashboard'
    )

    return NextResponse.json({
      success: true,
      message: 'Payment verified and balance updated',
      booking_id: bookingId,
      payout: payout
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}