'use client'

import Link from 'next/link'
import { Plane, Clock, DollarSign, Sparkles, Shield, Map, Calendar, Heart } from 'lucide-react'

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-blue-600 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              Your Perfect Vacation in <span className="text-yellow-300">Minutes</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-50 max-w-2xl mx-auto">
              Skip expensive travel agencies. Let AI create personalized itineraries that save you 
              <span className="font-bold text-yellow-300"> 90% on planning fees</span> and hours of research.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/plan" 
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Planning Free
              </Link>
              <Link 
                href="/how-it-works" 
                className="bg-white/10 backdrop-blur-sm border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
              >
                See How It Works
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-300" />
                <span>Plans in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-300" />
                <span>0.3-0.7% fee only</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-300" />
                <span>100% Transparent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Atlas Escape?</h2>
              <p className="text-xl text-gray-600">Traditional planning is broken. We fixed it.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Old Way */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
                  <span className="text-3xl">😩</span> Traditional Way
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-gray-700"><strong>3-15% agency fees</strong> on every booking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-gray-700"><strong>Days or weeks</strong> of back-and-forth emails</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-gray-700"><strong>Generic templates</strong> that ignore your preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-gray-700"><strong>Hidden commissions</strong> from hotels and tours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <span className="text-gray-700"><strong>DIY planning stress</strong> - endless tabs and research</span>
                  </li>
                </ul>
              </div>
              
              {/* New Way */}
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
                  <span className="text-3xl">✨</span> Atlas Escape Way
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700"><strong>0.3-0.7% fee</strong> - save thousands</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700"><strong>2 minutes to 2 hours</strong> - instant itineraries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700"><strong>100% personalized</strong> to your style & budget</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Full transparency</strong> - see real prices, no bias</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Smart integrations</strong> - Google Maps, weather, real-time updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Personas */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Perfect For Every Traveler</h2>
              <p className="text-xl text-gray-600">Whether you're saving money or time, we've got you covered.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">The Money Saver</h3>
                <p className="text-gray-600 mb-4">Families, students, budget travelers</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Save 90% on agency fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Optimized budget allocation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Transparent cost breakdowns</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">The Spontaneous</h3>
                <p className="text-gray-600 mb-4">Young professionals, solo travelers</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Last-minute trip planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Instant itineraries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Pack-and-go simplicity</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Plane className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">The Frequent Flyer</h3>
                <p className="text-gray-600 mb-4">Business travelers, digital nomads</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Repeated trip efficiency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Massive fee savings over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Quick international planning</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600">Everything you need for the perfect vacation</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Map className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Google Maps Integration</h3>
                <p className="text-gray-600">Real routes, travel times, and optimized daily paths</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Adjustments</h3>
                <p className="text-gray-600">Weather updates, cancellations, and emergency replanning</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Deep Personalization</h3>
                <p className="text-gray-600">AI learns your preferences and travel style</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Hidden Gems</h3>
                <p className="text-gray-600">Discover local secrets and travel like a local</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Backup Plans</h3>
                <p className="text-gray-600">Automatic alternative plans for any situation</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Budget Optimization</h3>
                <p className="text-gray-600">Maximum value for every dollar spent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Plan Your Dream Vacation?</h2>
            <p className="text-xl mb-8 text-blue-50">
              Get started with a free itinerary draft. No credit card required.
            </p>
            <Link 
              href="/plan" 
              className="inline-block bg-white text-primary-600 px-10 py-5 rounded-lg font-semibold text-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Planning Now
            </Link>
            <p className="mt-6 text-blue-100 text-sm">
              ✓ Free draft itinerary  ✓ No signup required  ✓ 2 minute setup
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
                <div className="text-gray-600">Trips Planned</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">$2.5M+</div>
                <div className="text-gray-600">Fees Saved</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
                <div className="text-gray-600">Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">150+</div>
                <div className="text-gray-600">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



