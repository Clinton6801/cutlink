// Save as: src/app/cancellation/page.tsx

'use client'

import Link from 'next/link'

export default function CancellationPolicy() {
  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">✂️</span>
            <h1 className="text-2xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-yellow-500 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Cancellation & <span className="text-yellow-500">Refund Policy</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Last Updated: January 11, 2026
          </p>

          <div className="space-y-8 text-gray-300">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                This Cancellation and Refund Policy outlines the terms and conditions for canceling bookings and requesting refunds on the CutLink platform. We strive to be fair to both customers and stylists while maintaining a reliable service.
              </p>
            </section>

            {/* Customer Cancellations */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Customer Cancellations</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.1 Before Stylist Confirmation</h3>
              <p className="mb-4">
                If you cancel a booking before the stylist confirms it (while status is "Pending"), you will receive a full refund (100%) processed within 3-5 business days.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.2 More Than 24 Hours Before Appointment</h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="font-bold text-green-500 mb-2">Full Refund (100%)</p>
                <p>Cancellations made more than 24 hours before the scheduled appointment time are eligible for a full refund, minus payment processing fees.</p>
              </div>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.3 Between 12-24 Hours Before Appointment</h3>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="font-bold text-yellow-500 mb-2">Partial Refund (50%)</p>
                <p>Cancellations made between 12 and 24 hours before the appointment will receive a 50% refund. The remaining 50% is kept as compensation to the stylist for the short notice.</p>
              </div>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.4 Less Than 12 Hours Before Appointment</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="font-bold text-red-500 mb-2">No Refund (0%)</p>
                <p>Cancellations made less than 12 hours before the appointment are not eligible for a refund. The full payment goes to the stylist as compensation for the last-minute cancellation.</p>
              </div>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.5 Emergency Situations</h3>
              <p className="mb-4">
                In case of genuine emergencies (medical issues, family emergencies, etc.), please contact our support team immediately. We may make exceptions on a case-by-case basis with proper documentation.
              </p>
            </section>

            {/* Stylist Cancellations */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Stylist Cancellations</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">3.1 At Any Time</h3>
              <p className="mb-4">
                If a stylist cancels a confirmed booking at any time, the customer receives a full refund (100%) immediately.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">3.2 Repeated Cancellations</h3>
              <p className="mb-4">
                Stylists who repeatedly cancel bookings may face penalties including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Lower search rankings</li>
                <li>Account warnings</li>
                <li>Temporary suspension</li>
                <li>Account termination for serious or repeated violations</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">3.3 Emergency Situations</h3>
              <p>
                Stylists experiencing genuine emergencies should notify the customer and CutLink support immediately. Emergency cancellations are understood but should be rare.
              </p>
            </section>

            {/* No-Shows */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. No-Show Policy</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.1 Customer No-Show</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="font-bold text-red-500 mb-2">No Refund</p>
                <p>If a customer fails to show up for a confirmed appointment without prior cancellation, no refund will be issued. The full payment goes to the stylist.</p>
              </div>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.2 Stylist No-Show</h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="font-bold text-green-500 mb-2">Full Refund + Compensation</p>
                <p>If a stylist fails to show up for a confirmed appointment, the customer receives:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Full refund (100%)</li>
                  <li>₦500 credit toward their next booking as compensation</li>
                </ul>
              </div>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.3 Grace Period</h3>
              <p>
                We understand that delays happen. A 15-minute grace period is provided before an appointment is considered a no-show. Both parties should communicate if running late.
              </p>
            </section>

            {/* Service Issues */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Service Quality Issues</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.1 During Service</h3>
              <p className="mb-4">
                If you're unhappy with the service while it's being performed, please communicate with your stylist immediately. Most issues can be resolved on the spot.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.2 After Completion</h3>
              <p className="mb-4">
                If you're dissatisfied with the completed service, contact our support team within 24 hours with:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Photos of the service result</li>
                <li>Description of the issue</li>
                <li>Booking details</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.3 Resolution Process</h3>
              <p className="mb-4">Our support team will:</p>
              <ol className="list-decimal list-inside space-y-2 mb-4">
                <li>Review your complaint and evidence</li>
                <li>Contact the stylist for their perspective</li>
                <li>Mediate between both parties</li>
                <li>Make a fair decision based on evidence</li>
              </ol>
              <p className="mb-4">Possible resolutions include:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Partial refund</li>
                <li>Full refund (in severe cases)</li>
                <li>Free correction appointment</li>
                <li>Credit toward future booking</li>
              </ul>
            </section>

            {/* Refund Processing */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Refund Processing</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">6.1 Timeline</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li><strong>Instant refunds:</strong> Credits to CutLink wallet (for future bookings)</li>
                <li><strong>Bank refunds:</strong> 3-5 business days after approval</li>
                <li><strong>Card refunds:</strong> 5-10 business days (depending on your bank)</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">6.2 Refund Method</h3>
              <p className="mb-4">
                Refunds are processed to the original payment method. If that's not possible, we'll work with you to find an alternative solution.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">6.3 Processing Fees</h3>
              <p>
                Payment processing fees (charged by Paystack) are non-refundable for all partial and full refunds except in cases where CutLink is at fault.
              </p>
            </section>

            {/* Disputes */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Disputes</h2>
              <p className="mb-4">
                If you have a dispute regarding a cancellation or refund:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Contact our support team at support@cutlink.ng</li>
                <li>Provide all relevant details and evidence</li>
                <li>Allow 2-3 business days for investigation</li>
                <li>Our team will make a fair decision based on policy and evidence</li>
              </ol>
            </section>

            {/* Special Circumstances */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Special Circumstances</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">8.1 Weather/Natural Disasters</h3>
              <p className="mb-4">
                In case of severe weather or natural disasters affecting the appointment area, full refunds will be issued regardless of the cancellation timeframe.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">8.2 Government Restrictions</h3>
              <p className="mb-4">
                If government restrictions (lockdowns, curfews, etc.) prevent the service, full refunds will be issued.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">8.3 Technical Issues</h3>
              <p>
                If CutLink platform issues prevent a booking or service, affected customers will receive full refunds plus compensation credit.
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Appointment Modifications</h2>
              <p className="mb-4">
                Instead of canceling, you can request to reschedule your appointment:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li><strong>More than 24 hours before:</strong> Free rescheduling (subject to stylist availability)</li>
                <li><strong>Less than 24 hours:</strong> Subject to stylist approval and may incur a rescheduling fee</li>
              </ul>
              <p>
                Contact your stylist directly through the app to request rescheduling.
              </p>
            </section>

            {/* Policy Changes */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
              <p>
                CutLink reserves the right to modify this Cancellation and Refund Policy at any time. Changes will be communicated via email and the platform. Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
              <p className="mb-4">
                For cancellation or refund inquiries:
              </p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> cutlink001@gmail.com</li>
                <li><strong>Phone:</strong> +234 9037789995</li>
                <li><strong>Support Hours:</strong> Monday - Friday, 9 AM - 6 PM WAT</li>
              </ul>
            </section>

            {/* Summary Table */}
            <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Reference Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 pr-4 text-yellow-500">Cancellation Time</th>
                      <th className="py-2 text-yellow-500">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-700">
                      <td className="py-3 pr-4">Before stylist confirmation</td>
                      <td className="py-3 font-bold text-green-500">100%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 pr-4">More than 24 hours before</td>
                      <td className="py-3 font-bold text-green-500">100%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 pr-4">12-24 hours before</td>
                      <td className="py-3 font-bold text-yellow-500">50%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 pr-4">Less than 12 hours</td>
                      <td className="py-3 font-bold text-red-500">0%</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 pr-4">Customer no-show</td>
                      <td className="py-3 font-bold text-red-500">0%</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">Stylist cancels/no-show</td>
                      <td className="py-3 font-bold text-green-500">100% + Credit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/terms" className="text-gray-400 hover:text-yellow-500 transition">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-gray-400 hover:text-yellow-500 transition">
            Privacy Policy
          </Link>
          <Link href="/" className="text-gray-400 hover:text-yellow-500 transition">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}