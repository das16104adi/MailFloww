import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { Play, Clock, ArrowRight, Calendar, Video } from "lucide-react"

function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Play className="h-20 w-20 text-purple-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              See MailFloww in Action
            </h1>
            
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Watch how our AI automatically handles customer emails and generates professional responses
            </p>

            <div className="mt-12 bg-purple-50 border border-purple-200 rounded-lg p-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-purple-900">Demo Coming Soon</h2>
              </div>
              
              <p className="text-purple-700 mb-8">
                We're preparing an interactive demo to show you exactly how MailFloww automates your customer communications
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-purple-100">
                  <div className="flex items-center mb-4">
                    <Video className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="font-bold text-purple-900">Live Demo</h3>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    Interactive walkthrough of the AI email automation process
                  </p>
                  <ul className="text-xs text-purple-600 space-y-1">
                    <li>• Real customer email examples</li>
                    <li>• AI response generation</li>
                    <li>• Analytics dashboard tour</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-purple-100">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="font-bold text-purple-900">Scheduled Demo</h3>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    Personalized demo with our team for your specific use case
                  </p>
                  <ul className="text-xs text-purple-600 space-y-1">
                    <li>• Custom setup walkthrough</li>
                    <li>• Q&A with our experts</li>
                    <li>• Integration planning</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <a
                href="mailto:demo@mailfloww.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Personal Demo
              </a>
            </div>

            <div className="mt-12 bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll See in the Demo</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Email Processing</h4>
                  <ul className="space-y-1">
                    <li>• Customer inquiry analysis</li>
                    <li>• Context understanding</li>
                    <li>• Response generation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Business Impact</h4>
                  <ul className="space-y-1">
                    <li>• Response time improvements</li>
                    <li>• Cost savings calculation</li>
                    <li>• Customer satisfaction metrics</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Want early access to the demo? 
              <Link to="/signup" className="text-purple-600 hover:text-purple-500 ml-1">
                Sign up for updates
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoPage
