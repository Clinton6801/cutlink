import { supabase } from './supabase'

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
          link,
          is_read: false
        }
      ])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error }
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error }
  }
}

export async function markAllAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error marking all as read:', error)
    return { success: false, error }
  }
}

// Add these helper functions to: src/lib/createNotification.ts
// These make it easier to create specific notification types



// Booking Notifications
export async function notifyNewBooking(
  stylistId: string,
  customerName: string,
  date: string,
  time: string
) {
  return createNotification(
    stylistId,
    'new_booking',
    '🎉 New Booking Request!',
    `${customerName} wants to book you for ${date} at ${time}`,
    '/stylist/dashboard'
  )
}

export async function notifyBookingConfirmed(
  customerId: string,
  stylistName: string,
  date: string,
  time: string
) {
  return createNotification(
    customerId,
    'booking_confirmed',
    '✅ Booking Confirmed!',
    `${stylistName} confirmed your booking for ${date} at ${time}`,
    '/customer/dashboard'
  )
}

export async function notifyBookingCancelled(
  userId: string,
  cancelledBy: string,
  reason: string,
  date: string
) {
  return createNotification(
    userId,
    'booking_cancelled',
    '❌ Booking Cancelled',
    `Your booking for ${date} was cancelled. Reason: ${reason}`,
    '/customer/dashboard'
  )
}

export async function notifyBookingCompleted(
  customerId: string,
  stylistName: string
) {
  return createNotification(
    customerId,
    'booking_completed',
    '🎉 Booking Completed!',
    `How was your experience with ${stylistName}? Leave a review!`,
    '/customer/dashboard'
  )
}

// Message Notifications
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  senderId: string,
  messagePreview: string
) {
  return createNotification(
    recipientId,
    'new_message',
    `💬 New message from ${senderName}`,
    messagePreview.substring(0, 100) + (messagePreview.length > 100 ? '...' : ''),
    `/messages/${senderId}`
  )
}

// Verification Notifications
export async function notifyVerificationApproved(
  stylistId: string,
  adminNotes?: string
) {
  return createNotification(
    stylistId,
    'verification_approved',
    '🎉 Profile Verified!',
    `Congratulations! Your profile has been verified. ${adminNotes || ''}`,
    '/stylist/dashboard'
  )
}

export async function notifyVerificationRejected(
  stylistId: string,
  reason: string
) {
  return createNotification(
    stylistId,
    'verification_rejected',
    '⚠️ Verification Update',
    `Your verification needs attention. Reason: ${reason}`,
    '/stylist/edit-profile'
  )
}

// Review Notifications
export async function notifyNewReview(
  stylistId: string,
  customerName: string,
  rating: number
) {
  const stars = '⭐'.repeat(rating)
  return createNotification(
    stylistId,
    'new_review',
    `New ${rating}-Star Review!`,
    `${customerName} left you a review: ${stars}`,
    '/stylist/dashboard'
  )
}

// Payment Notifications
export async function notifyPaymentReceived(
  stylistId: string,
  amount: number,
  customerName: string
) {
  return createNotification(
    stylistId,
    'payment_received',
    '💰 Payment Received!',
    `You earned ₦${amount.toLocaleString()} from ${customerName}`,
    '/stylist/dashboard'
  )
}

export async function notifyPaymentFailed(
  customerId: string,
  reason: string
) {
  return createNotification(
    customerId,
    'payment_failed',
    '⚠️ Payment Failed',
    `Your payment couldn't be processed. Reason: ${reason}`,
    '/customer/dashboard'
  )
}

// Favorite Notifications (optional)
export async function notifyFavoriteStylistAvailable(
  customerId: string,
  stylistName: string,
  stylistId: string
) {
  return createNotification(
    customerId,
    'favorite_available',
    `${stylistName} has new availability! ✂️`,
    'Your favorite stylist has opened up their schedule. Book now!',
    `/stylist/${stylistId}`
  )
}

// Reminder Notifications
export async function notifyAppointmentReminder(
  userId: string,
  otherPartyName: string,
  date: string,
  time: string,
  userType: 'customer' | 'stylist'
) {
  return createNotification(
    userId,
    'appointment_reminder',
    '⏰ Appointment Reminder',
    `You have an appointment with ${otherPartyName} tomorrow at ${time}`,
    `/${userType}/dashboard`
  )
}

// Admin Notifications
export async function notifyAdminNewVerification(
  adminId: string,
  stylistName: string,
  stylistId: string
) {
  return createNotification(
    adminId,
    'new_verification_request',
    '📋 New Verification Request',
    `${stylistName} submitted a verification request`,
    '/admin/verification'
  )
}

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// In your booking confirmation code:
import { notifyBookingConfirmed } from '@/lib/createNotification'

await notifyBookingConfirmed(
  booking.customer_id,
  stylist.full_name,
  booking.appointment_date,
  booking.appointment_time
)

// In your message send code:
import { notifyNewMessage } from '@/lib/createNotification'

await notifyNewMessage(
  recipientId,
  currentUser.full_name,
  currentUser.id,
  messageText
)

// In your verification approval:
import { notifyVerificationApproved } from '@/lib/createNotification'

await notifyVerificationApproved(
  stylist.user_id,
  adminNotes
)
*/