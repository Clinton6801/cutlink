'use client'

import Link from 'next/link'

export default function PrivacyPolicy() {
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
            Privacy <span className="text-yellow-500">Policy</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Last Updated: January 11, 2026
          </p>

          <div className="space-y-8 text-gray-300">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                CutLink ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p>
                By using CutLink, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.1 Personal Information</h3>
              <p className="mb-4">When you register on CutLink, we collect:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Profile photo (optional)</li>
                <li>Location/address</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.2 Additional Information for Stylists</h3>
              <p className="mb-4">If you register as a stylist, we also collect:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Business information (years of experience, specialties)</li>
                <li>Portfolio images</li>
                <li>Bank account details (for payouts)</li>
                <li>Verification documents (ID, certificates)</li>
                <li>Working hours and availability</li>
                <li>Service menu and pricing</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.3 Booking Information</h3>
              <p className="mb-4">When you make or accept a booking:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Appointment date, time, and location</li>
                <li>Service type and details</li>
                <li>Payment information</li>
                <li>Communication between customers and stylists</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.4 Payment Information</h3>
              <p className="mb-4">
                We use Paystack to process payments. We do not store your full credit card details. Paystack securely processes and stores payment information according to PCI DSS standards.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">2.5 Automatically Collected Information</h3>
              <p className="mb-4">We automatically collect:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Usage data (pages visited, features used)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Create and manage your account</li>
                <li>Facilitate bookings between customers and stylists</li>
                <li>Process payments and payouts</li>
                <li>Send booking confirmations, reminders, and notifications</li>
                <li>Verify stylist credentials</li>
                <li>Provide customer support</li>
                <li>Improve our platform and user experience</li>
                <li>Prevent fraud and ensure security</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns and trends</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. How We Share Your Information</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.1 With Other Users</h3>
              <p className="mb-4">
                When you book a service, your name, phone number, and appointment details are shared with the stylist. Similarly, stylists' profiles and contact information are visible to customers.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.2 With Service Providers</h3>
              <p className="mb-4">We share information with third-party service providers who help us operate our platform:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Paystack:</strong> Payment processing</li>
                <li><strong>Resend:</strong> Email delivery</li>
                <li><strong>Vercel:</strong> Hosting and infrastructure</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.3 For Legal Reasons</h3>
              <p className="mb-4">We may disclose your information if required by law or in response to:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Court orders or legal processes</li>
                <li>Government investigations</li>
                <li>Requests from law enforcement</li>
                <li>Protection of our rights and property</li>
                <li>Emergency situations involving safety</li>
              </ul>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">4.4 Business Transfers</h3>
              <p>
                If CutLink is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Encryption of data in transit (HTTPS/SSL)</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits</li>
                <li>Access controls and permissions</li>
                <li>Secure cloud infrastructure</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-bold text-yellow-500 mb-3">6.1 Access and Update</h3>
              <p className="mb-4">
                You can access and update your personal information through your account settings at any time.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">6.2 Account Deletion</h3>
              <p className="mb-4">
                You may request deletion of your account by contacting support. Please note that some information may be retained for legal or legitimate business purposes.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">6.3 Marketing Communications</h3>
              <p className="mb-4">
                You can opt out of marketing emails by clicking the "unsubscribe" link or updating your notification preferences in your account settings.
              </p>

              <h3 className="text-xl font-bold text-yellow-500 mb-3">6.4 Cookies</h3>
              <p>
                You can control cookies through your browser settings. However, disabling cookies may limit some features of the platform.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
              <p>
                CutLink is not intended for users under 18 years of age. We do not knowingly collect information from children. If we discover that we have collected information from a child, we will delete it immediately.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. International Users</h2>
              <p>
                CutLink is based in Nigeria and primarily serves Nigerian users. If you access our platform from outside Nigeria, your information may be transferred to and processed in Nigeria. By using our Service, you consent to this transfer.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Links</h2>
              <p>
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. The "Last Updated" date at the top of this policy indicates when it was last revised.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="space-y-2">
                <li><strong>Email:</strong> privacy@cutlink.ng</li>
                <li><strong>Support Email:</strong> support@cutlink.ng</li>
                <li><strong>Phone:</strong> +234 XXX XXX XXXX</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
              </ul>
            </section>

            {/* Data Protection Officer */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Data Protection Officer</h2>
              <p>
                For data protection inquiries, you may contact our Data Protection Officer at: dpo@cutlink.ng
              </p>
            </section>

            {/* Consent */}
            <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
              <p className="text-white font-bold">
                By using CutLink, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and sharing of your information as described herein.
              </p>
            </section>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/terms" className="text-gray-400 hover:text-yellow-500 transition">
            Terms of Service
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