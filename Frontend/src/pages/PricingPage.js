import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { DollarSign, Clock, ArrowRight, Check } from "lucide-react"

function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <DollarSign className="h-20 w-20 text-purple-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h1>
            
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Choose the plan that fits your customer email volume and business needs
            </p>

            <div className="mt-12 bg-purple-50 border border-purple-200 rounded-lg p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-900">Pricing Coming Soon</h2>
              </div>
              
              <p className="text-purple-700 mb-8">
                We're finalizing our pricing structure based on your actual email automation needs
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-purple-100">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">Starter</h3>
                  <p className="text-purple-700 mb-4">Perfect for small businesses</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Up to 100 emails/day</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Basic AI responses</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Email support</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border-2 border-purple-500 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-purple-900 mb-4">Professional</h3>
                  <p className="text-purple-700 mb-4">For growing companies</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Up to 1,000 emails/day</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Advanced AI with context</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Analytics dashboard</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-purple-100">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">Enterprise</h3>
                  <p className="text-purple-700 mb-4">For large-scale operations</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Unlimited emails</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Custom AI training</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Dedicated support</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>CRM integrations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              All plans include a 30-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
