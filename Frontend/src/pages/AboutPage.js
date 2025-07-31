import { Mail, GitlabIcon as GitHub, Twitter, Linkedin } from "lucide-react"

function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">About MailFloww</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Version 1.0.0</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Application</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">MailFloww - Autonomous Email Reply Assistant using LangGraph and RAG</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                MailFloww is an autonomous email reply assistant that uses LangGraph and RAG to automatically respond to customer inquiries, support requests, and sales communications 24/7 while maintaining your company's professional tone and brand voice.
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Technologies</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">React.js</span>
                    </div>
                  </li>
                  <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">Tailwind CSS</span>
                    </div>
                  </li>
                  <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">React Router</span>
                    </div>
                  </li>
                  <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">Lucide Icons</span>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Contact</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex space-x-4">
                  <a href="mailto:support@mailflow.example.com" className="text-purple-600 hover:text-purple-800">
                    <Mail size={20} />
                  </a>
                  <a href="#" className="text-purple-600 hover:text-purple-800">
                    <GitHub size={20} />
                  </a>
                  <a href="#" className="text-purple-600 hover:text-purple-800">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="text-purple-600 hover:text-purple-800">
                    <Linkedin size={20} />
                  </a>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Frequently Asked Questions</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="space-y-6 divide-y divide-gray-200">
            <div className="pt-6">
              <dt className="text-lg">
                <button className="text-left w-full flex justify-between items-start text-gray-400">
                  <span className="font-medium text-gray-900">How do I change my password?</span>
                </button>
              </dt>
              <dd className="mt-2 pr-12">
                <p className="text-base text-gray-500">
                  You can change your password in the Settings page under the Account tab.
                </p>
              </dd>
            </div>

            <div className="pt-6">
              <dt className="text-lg">
                <button className="text-left w-full flex justify-between items-start text-gray-400">
                  <span className="font-medium text-gray-900">How do I schedule an email?</span>
                </button>
              </dt>
              <dd className="mt-2 pr-12">
                <p className="text-base text-gray-500">
                  When composing an email, click on the calendar icon in the toolbar or the "Schedule Send" button at
                  the bottom of the compose form.
                </p>
              </dd>
            </div>

            <div className="pt-6">
              <dt className="text-lg">
                <button className="text-left w-full flex justify-between items-start text-gray-400">
                  <span className="font-medium text-gray-900">Is my data secure?</span>
                </button>
              </dt>
              <dd className="mt-2 pr-12">
                <p className="text-base text-gray-500">
                  Yes, we use industry-standard encryption to protect your data. Your emails and personal information
                  are never shared with third parties.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default AboutPage

