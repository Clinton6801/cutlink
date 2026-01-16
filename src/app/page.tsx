 import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Header/Logo */}
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-4xl">✂️</span>
            <h1 className="text-3xl font-bold">
              <span className="text-yellow-500">Cut</span>
              <span className="text-white">Link</span>
            </h1>
          </div>
          <Link href ="/login" className="text-white hover:text-yellow-500 transition">
            Sign In
          </Link>
        </div>
      </header>

      {/* Split Screen Hero */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Side - For Customers */}
        <div className="flex-1 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Animated circles representing customers/satisfaction */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-500 rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute bottom-32 right-20 w-40 h-40 bg-yellow-500 rounded-full opacity-5 animate-ping"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full opacity-5 animate-pulse delay-75"></div>
            
            {/* Barber tool icons floating */}
            <div className="absolute top-1/4 right-1/4 text-6xl opacity-20 animate-float">
              ✂️
            </div>
            <div className="absolute bottom-1/3 left-1/3 text-5xl opacity-10 animate-float-delayed">
              💈
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 md:p-12">
            <div className="max-w-md text-center space-y-6">
              <div className="text-7xl mb-4 animate-bounce-slow">👤</div>
              <h2 className="text-5xl md:text-6xl font-bold text-white">
                Find Your Perfect Cut
              </h2>
              <p className="text-xl text-gray-300">
                Connect with skilled hairstylists in your area. Home service or shop visit - your choice.
              </p>
              <Link href="/signup/customer" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105">
                Find a Stylist
              </Link>
              <p className="text-sm text-gray-400 italic mt-4">
                Your barber, your way
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - For Stylists */}
        <div className="flex-1 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Animated circles representing opportunity/growth */}
            <div className="absolute top-32 right-16 w-36 h-36 bg-yellow-500 rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute bottom-20 left-24 w-28 h-28 bg-yellow-500 rounded-full opacity-5 animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-white rounded-full opacity-5 animate-pulse delay-100"></div>
            
            {/* Money/opportunity symbols */}
            <div className="absolute top-1/4 left-1/4 text-6xl opacity-20 animate-float">
              💰
            </div>
            <div className="absolute bottom-1/3 right-1/3 text-5xl opacity-15 animate-float-delayed">
              ⭐
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 md:p-12">
            <div className="max-w-md text-center space-y-6">
              <div className="text-7xl mb-4 animate-bounce-slow">💼</div>
              <h2 className="text-5xl md:text-6xl font-bold text-yellow-500">
                Start Earning Today
              </h2>
              <p className="text-xl text-gray-300">
                Join CutLink and connect with customers ready for quality cuts. Build your reputation, grow your business.
              </p>
              <Link href="/signup/stylist" className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105">
                Join as Stylist
              </Link>
              <p className="text-sm text-yellow-500 italic mt-4">
                Create opportunities. Make the dough.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              How <span className="text-yellow-500">CutLink</span> Works
            </h2>
            <p className="text-xl text-gray-400">Simple, fast, and built for you</p>
          </div>

          {/* Two Column Layout - Customer & Stylist */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Customers */}
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-yellow-500 mb-8 text-center">For Customers</h3>
              
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-2xl">
                  1
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Search & Discover</h4>
                  <p className="text-gray-400">
                    Enter your location and browse skilled hairstylists nearby. Filter by ratings, services, and availability.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-2xl">
                  2
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Book Your Cut</h4>
                  <p className="text-gray-400">
                    Choose home service or shop visit. Pick your preferred time and confirm your booking instantly.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-2xl">
                  3
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Get Fresh</h4>
                  <p className="text-gray-400">
                    Meet your stylist, get that perfect cut, and pay securely through the app. Rate and review after.
                  </p>
                </div>
              </div>
            </div>

            {/* For Stylists */}
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">For Stylists</h3>
              
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center text-black font-bold text-2xl">
                  1
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Create Your Profile</h4>
                  <p className="text-gray-400">
                    Sign up in minutes. Add your skills, portfolio photos, services, and set your prices.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center text-black font-bold text-2xl">
                  2
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Get Booked</h4>
                  <p className="text-gray-400">
                    Receive booking requests from customers. Accept jobs that fit your schedule and location.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center text-black font-bold text-2xl">
                  3
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Earn & Grow</h4>
                  <p className="text-gray-400">
                    Complete jobs, collect payments instantly, build your reputation, and grow your client base.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <Link href="/signup/customer" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-12 rounded-lg text-xl transition transform hover:scale-105">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Why <span className="text-yellow-500">Thousands</span> Trust CutLink
            </h2>
            <p className="text-xl text-gray-400">Everything you need for the perfect cut experience</p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-3">Easy Search</h3>
              <p className="text-gray-400">
                Find verified stylists in your area instantly. Filter by ratings, price, and availability.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-2xl font-bold text-white mb-3">Secure Payment</h3>
              <p className="text-gray-400">
                Pay safely through the app with Paystack. No cash hassles, complete transparency.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-3">Direct Chat</h3>
              <p className="text-gray-400">
                Message stylists directly. Discuss your style, confirm details, and stay connected.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-white mb-3">Real Reviews</h3>
              <p className="text-gray-400">
                Read honest reviews from real customers. Make informed decisions every time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-2xl font-bold text-white mb-3">Location Based</h3>
              <p className="text-gray-400">
                See stylists near you. Choose home service or visit their shop - your choice.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-3">Instant Booking</h3>
              <p className="text-gray-400">
                Book appointments in seconds. Real-time availability means no waiting around.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-3">Verified Stylists</h3>
              <p className="text-gray-400">
                All stylists are verified. Quality service guaranteed or your money back.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-yellow-500 transition transform hover:scale-105">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-3">Build Reputation</h3>
              <p className="text-gray-400">
                Stylists earn badges and rewards. Great service leads to more bookings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CutLink Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              More Than Just an <span className="text-yellow-500">App</span>
            </h2>
            <p className="text-xl text-gray-400">We're building a community and creating opportunities</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Empowerment */}
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">💪</div>
              <h3 className="text-2xl font-bold text-yellow-500">Empowering Youth</h3>
              <p className="text-gray-400 leading-relaxed">
                We believe every talented barber deserves a chance to shine. No huge shop rent, no barriers - just you, your skills, and unlimited opportunity.
              </p>
            </div>

            {/* Fair Pricing */}
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-yellow-500">Fair for Everyone</h3>
              <p className="text-gray-400 leading-relaxed">
                Transparent pricing. Customers get quality cuts at fair rates. Stylists keep more of what they earn. Win-win for the community.
              </p>
            </div>

            {/* Community */}
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-yellow-500">Built by Africans</h3>
              <p className="text-gray-400 leading-relaxed">
                Created in Nigeria, for Africans. We understand the hustle, the culture, and what it takes to make it. This is your platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-black border-y border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-yellow-500 mb-2">500+</div>
              <div className="text-xl text-gray-400">Active Stylists</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-500 mb-2">10K+</div>
              <div className="text-xl text-gray-400">Happy Customers</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-500 mb-2">50+</div>
              <div className="text-xl text-gray-400">Cities Covered</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-500 mb-2">4.8★</div>
              <div className="text-xl text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              What People Are <span className="text-yellow-500">Saying</span>
            </h2>
            <p className="text-xl text-gray-400">Real stories from our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer Testimonial */}
            <div className="bg-gradient-to-br from-black to-gray-900 p-8 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-3xl">
                  👨
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Chidi O.</h4>
                  <p className="text-gray-400">Lagos Customer</p>
                </div>
              </div>
              <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-300 italic">
                "Best thing ever! I found an amazing barber who comes to my house. No more traffic or waiting. My guy is skilled and professional."
              </p>
            </div>

            {/* Stylist Testimonial */}
            <div className="bg-gradient-to-br from-black to-gray-900 p-8 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-3xl">
                  ✂️
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Samuel A.</h4>
                  <p className="text-gray-400">Abuja Stylist</p>
                </div>
              </div>
              <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-300 italic">
                "CutLink changed my life. I couldn't afford shop rent but now I have 30+ regular clients. I'm making more than I ever imagined!"
              </p>
            </div>

            {/* Customer Testimonial 2 */}
            <div className="bg-gradient-to-br from-black to-gray-900 p-8 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-3xl">
                  👩
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Blessing M.</h4>
                  <p className="text-gray-400">Port Harcourt</p>
                </div>
              </div>
              <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-300 italic">
                "As a busy professional, CutLink is a lifesaver. I book, pay, and get fresh cuts without leaving my office. Game changer!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-4xl">✂️</span>
                <h3 className="text-2xl font-bold">
                  <span className="text-yellow-500">Cut</span>
                  <span className="text-white">Link</span>
                </h3>
              </div>
              <p className="text-gray-400 mb-4">Your barber, your way</p>
              <p className="text-gray-500 text-sm">Connecting quality stylists with customers across Nigeria.</p>
            </div>

            {/* For Customers */}
            <div>
              <h4 className="text-white font-bold mb-4">For Customers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-500 transition">Find a Stylist</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">How It Works</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Safety</a></li>
              </ul>
            </div>

            {/* For Stylists */}
            <div>
              <h4 className="text-white font-bold mb-4">For Stylists</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-500 transition">Become a Stylist</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Earnings</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Resources</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Success Stories</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-yellow-500 transition">About Us</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Contact</a></li>
                <li><Link href="/terms" className="hover:text-yellow-500 transition">
                    Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-yellow-500 transition">
                         Privacy Policy
                              </Link></li>
                <li><Link href="/cancellation" className="hover:text-yellow-500 transition">
  Cancellation Policy
</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 CutLink. All rights reserved. Made with ❤️ in Nigeria
            </p>
            <div className="flex gap-6 text-2xl">
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition">📘</a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition">📷</a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition">🐦</a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition">💼</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}