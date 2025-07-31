import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { Building2, Clock, ArrowRight, Mail } from "lucide-react"

function EnterprisePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Building2 className="h-20 w-20 text-purple-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Enterprise Solutions
            </h1>
            
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Advanced AI email automation features designed for large-scale customer communications
            </p>

            <div className="mt-12 bg-purple-50 border border-purple-200 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-900">Coming Soon</h2>
              </div>
              
              <p className="text-purple-700 mb-6">
                We're building advanced enterprise features including:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-purple-900 mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-purple-700">Detailed customer communication insights and ROI tracking</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-purple-900 mb-2">Multi-Domain Support</h3>
                  <p className="text-sm text-purple-700">Handle multiple company domains and brands</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-purple-900 mb-2">CRM Integration</h3>
                  <p className="text-sm text-purple-700">Seamless integration with Salesforce, HubSpot, and more</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-purple-900 mb-2">Custom AI Training</h3>
                  <p className="text-sm text-purple-700">Train AI on your specific industry and communication style</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Get Early Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <a
                href="mailto:enterprise@mailfloww.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Sales
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Want to be notified when enterprise features launch? 
              <Link to="/signup" className="text-purple-600 hover:text-purple-500 ml-1">
                Join our waitlist
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterprisePage
