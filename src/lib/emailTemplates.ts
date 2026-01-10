export const emailTemplates = {
  // Email to stylist when customer books
  newBooking: (stylistName: string, customerName: string, date: string, time: string, location: string, price: number) => ({
    subject: '🎉 New Booking Request on CutLink!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .details { background: white; padding: 20px; border-left: 4px solid #FFD700; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✂️ CutLink</h1>
              <h2>New Booking Request!</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${stylistName}</strong>,</p>
              <p>Great news! You have a new booking request from <strong>${customerName}</strong>.</p>
              
              <div class="details">
                <h3>Booking Details:</h3>
                <p><strong>📅 Date:</strong> ${date}</p>
                <p><strong>🕐 Time:</strong> ${time}</p>
                <p><strong>📍 Location:</strong> ${location}</p>
                <p><strong>💰 Price:</strong> ₦${price.toLocaleString()}</p>
              </div>

              <p>Log in to your dashboard to confirm or decline this booking.</p>
              
              <a href="http://localhost:3000/stylist/dashboard" class="button">View Booking</a>

              <p>Don't keep your customer waiting! Respond as soon as possible.</p>
            </div>
            <div class="footer">
              <p>© 2024 CutLink - Your barber, your way</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Email to customer when stylist confirms
  bookingConfirmed: (customerName: string, stylistName: string, date: string, time: string, location: string) => ({
    subject: '✅ Your CutLink Booking is Confirmed!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .details { background: white; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✂️ CutLink</h1>
              <h2>Booking Confirmed! ✅</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${customerName}</strong>,</p>
              <p>Good news! <strong>${stylistName}</strong> has confirmed your booking.</p>
              
              <div class="details">
                <h3>Your Appointment:</h3>
                <p><strong>📅 Date:</strong> ${date}</p>
                <p><strong>🕐 Time:</strong> ${time}</p>
                <p><strong>📍 Location:</strong> ${location}</p>
                <p><strong>✂️ Stylist:</strong> ${stylistName}</p>
              </div>

              <p>We'll send you a reminder before your appointment. Get ready for a fresh cut!</p>
              
              <a href="http://localhost:3000/customer/dashboard" class="button">View Booking</a>

              <p>Need to make changes? You can message your stylist directly through the app.</p>
            </div>
            <div class="footer">
              <p>© 2024 CutLink - Your barber, your way</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Email when booking is cancelled
  bookingCancelled: (recipientName: string, cancelledBy: string, reason: string, date: string, time: string) => ({
    subject: '❌ Booking Cancelled - CutLink',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 20px; border-left: 4px solid #ff9800; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✂️ CutLink</h1>
              <h2>Booking Cancelled</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>We're sorry to inform you that your booking has been cancelled.</p>
              
              <div class="warning">
                <h3>Cancellation Details:</h3>
                <p><strong>Cancelled by:</strong> ${cancelledBy === 'customer' ? 'Customer' : 'Stylist'}</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p><strong>Original Date:</strong> ${date} at ${time}</p>
              </div>

              <p>${cancelledBy === 'customer' 
                ? 'No worries! You can book another stylist anytime.' 
                : 'We apologize for the inconvenience. Please book another stylist at your convenience.'
              }</p>
              
              <a href="http://localhost:3000/browse" class="button">Find Another Stylist</a>
            </div>
            <div class="footer">
              <p>© 2024 CutLink - Your barber, your way</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Email to customer after booking is completed
  requestReview: (customerName: string, stylistName: string, bookingId: string) => ({
    subject: '⭐ How was your experience with CutLink?',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #FFD700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .stars { font-size: 30px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✂️ CutLink</h1>
              <h2>How was your cut?</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${customerName}</strong>,</p>
              <p>We hope you're loving your fresh cut from <strong>${stylistName}</strong>!</p>
              
              <div class="stars">⭐⭐⭐⭐⭐</div>

              <p>Your feedback helps other customers find great stylists and helps ${stylistName} improve their service.</p>
              
              <a href="http://localhost:3000/customer/dashboard" class="button">Leave a Review</a>

              <p>It only takes 30 seconds and means a lot to our stylists!</p>
            </div>
            <div class="footer">
              <p>© 2024 CutLink - Your barber, your way</p>
          </div>
        </div>
      </body>
    </html>
  `
}),

// Verification approved
verificationApproved: (stylistName: string, adminNotes?: string) => ({
  subject: '🎉 Your CutLink Profile is Verified!',
  html: `
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
            <p>Hi <strong>${stylistName}</strong>,</p>
            
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

            ${adminNotes ? `<p><strong>Note from our team:</strong> ${adminNotes}</p>` : ''}
            
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
}),

// Verification rejected
verificationRejected: (stylistName: string, reason: string) => ({
  subject: 'CutLink Verification Update',
  html: `
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
            <p>Hi <strong>${stylistName}</strong>,</p>
            
            <div class="warning">
              <h3>Your verification request needs attention</h3>
              <p>Unfortunately, we couldn't approve your verification at this time.</p>
            </div>

            <p><strong>Reason:</strong></p>
            <p>${reason}</p>

            <p><strong>What to do next:</strong></p>
            <ul>
              <li>Review the reason above</li>
              <li>Prepare the required documents (valid ID, proof of experience, recent photo with tools)</li>
              <li>Submit a new verification request from your profile</li>
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
  }),
};