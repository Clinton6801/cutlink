// Save as: src/app/terms/page.tsx

'use client'

import Link from 'next/link'

export default function TermsOfService() {
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
            Terms of <span className="text-yellow-500">Service</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Last Updated: January 11, 2026
          </p>

          <div className="space-y-8 text-gray-300">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to CutLink ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the CutLink platform, including our website, mobile application, and related services (collectively, the "Service").
              </p>
              <p className="mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
              </p>
              <p>
                CutLink is a platform that connects customers with professional hairstylists and barbers in Nigeria. We facilitate bookings but are not directly responsible for the services provided by stylists.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Definitions</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>"Customer"</strong> refers to users seeking hairstyling or barbering services through the platform.</li>
                <li><strong>"Stylist"</strong> refers to independent service providers offering their services through CutLink.</li>
                <li><strong>"Booking"</strong> refers to an appointment scheduled between a Customer and a Stylist through our platform.</li>
                <li><strong>"Service Fee"</strong> refers to the commission charged by CutLink for facilitating bookings.</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
              <h3 className="text-xl font-bold text-yellow-500 mb-3">3.1 Eligibility</h3>
              <p className="mb-4">
                You must be at least 18 years old to use our Service. By creating an account, you represent that you meet this age requirement and that all information you provide is accurate and complete.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">3.2 Account Security</h3>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized access or security breaches.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">3.3 Account Types</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Customer Accounts:</strong> For individuals seeking hairstyling services</li>
                <li><strong>Stylist Accounts:</strong> For professional hairstylists and barbers offering their services</li>
              </ul>
            </section>

            {/* For Customers */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. For Customers</h2>
              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.1 Booking Services</h3>
              <p className="mb-4">
                Customers can browse stylist profiles, view portfolios, read reviews, and book appointments through the platform. All bookings are subject to stylist confirmation.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.2 Payment</h3>
              <p className="mb-4">
                Payment for services must be made through the CutLink platform. We use Paystack as our payment processor. By making a payment, you agree to Paystack's terms and conditions.
              </p>
              <p className="mb-4">
                Payments are held in escrow until the service is completed. Once you confirm completion, payment is released to the stylist minus our service fee.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.3 Cancellations</h3>
              <p className="mb-4">
                You may cancel a booking according to our Cancellation Policy. Cancellations made less than 24 hours before the scheduled appointment may not be eligible for a refund.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.4 Reviews</h3>
              <p>
                After a service is completed, you may leave a review for the stylist. Reviews must be honest, fair, and not contain offensive language or personal attacks.
              </p>
            </section>

            {/* For Stylists */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. For Stylists</h2>
              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.1 Profile Requirements</h3>
              <p className="mb-4">
                Stylists must provide accurate information about their services, experience, and pricing. Portfolio images must accurately represent your work.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.2 Verification</h3>
              <p className="mb-4">
                To become a verified stylist, you must submit valid identification and proof of experience. Verification is at CutLink's discretion and can be revoked for policy violations.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.3 Service Standards</h3>
              <p className="mb-4">
                Stylists must:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Provide professional, high-quality services</li>
                <li>Arrive on time for appointments</li>
                <li>Maintain proper hygiene and safety standards</li>
                <li>Use proper, sanitized equipment</li>
                <li>Treat customers with respect</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.4 Independent Contractor Status</h3>
              <p className="mb-4">
                Stylists are independent contractors, not employees of CutLink. You are responsible for your own taxes, insurance, and business expenses.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.5 Service Fees</h3>
              <p className="mb-4">
                CutLink charges a service fee (commission) on each completed booking. This fee is automatically deducted from your earnings before payout.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">5.6 Payouts</h3>
              <p>
                Earnings are released after service completion and customer confirmation. Payouts are processed according to our payout schedule. You must provide valid bank account information to receive payments.
              </p>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Activities</h2>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use the platform for any illegal activities</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Impersonate others or provide false information</li>
                <li>Attempt to circumvent our payment system</li>
                <li>Upload malicious code or viruses</li>
                <li>Scrape or collect user data without permission</li>
                <li>Use automated systems to access the platform</li>
                <li>Attempt to bypass our booking and payment system by exchanging contact information to complete transactions off-platform</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="mb-4">
                The CutLink platform, including its design, code, logos, and content, is owned by CutLink and protected by intellectual property laws. You may not copy, modify, or distribute our intellectual property without permission.
              </p>
              <p>
                By uploading content (photos, reviews, etc.), you grant CutLink a non-exclusive, worldwide license to use, display, and promote that content on our platform.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                CutLink is a platform that connects customers with stylists. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>The quality of services provided by stylists</li>
                <li>Disputes between customers and stylists</li>
                <li>Personal injury or property damage during services</li>
                <li>Missed appointments or no-shows</li>
                <li>Lost or stolen items during appointments</li>
              </ul>
              <p>
                To the maximum extent permitted by law, CutLink shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Dispute Resolution</h2>
              <p className="mb-4">
                If you have a dispute with another user, you should first attempt to resolve it directly with them. If resolution is not possible, you may contact our support team.
              </p>
              <p>
                Any disputes arising from these Terms shall be governed by the laws of the Federal Republic of Nigeria and resolved in Nigerian courts.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
              <p className="mb-4">
                We may suspend or terminate your account at any time for violations of these Terms or for any other reason at our discretion.
              </p>
              <p>
                You may close your account at any time by contacting support. Upon termination, you will no longer have access to your account or the platform.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. We will notify you of significant changes by email or through the platform. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
              <p className="mb-2">
                If you have questions about these Terms, please contact us:
              </p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> support@cutlink.ng</li>
                <li><strong>Phone:</strong> +234 XXX XXX XXXX</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
              </ul>
            </section>

            {/* Acceptance */}
            <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
              <p className="text-white font-bold">
                By using CutLink, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/privacy" className="text-gray-400 hover:text-yellow-500 transition">
            Privacy Policy
          </Link>
          <Link href="/cancellation" className="text-gray-400 hover:text-yellow-500 transition">
            Cancellation Policy
          </Link>
          <Link href="/" className="text-gray-400 hover:text-yellow-500 transition">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}