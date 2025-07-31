"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, Mail, Phone, Star, Edit, Trash, Users } from "lucide-react"

// Mock contacts data
const mockContacts = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", phone: "+1 (555) 123-4567", favorite: true },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", phone: "+1 (555) 987-6543", favorite: false },
  { id: 3, name: "Robert Johnson", email: "robert.j@example.com", phone: "+1 (555) 456-7890", favorite: true },
  { id: 4, name: "Emily Davis", email: "emily.davis@example.com", phone: "+1 (555) 234-5678", favorite: false },
  { id: 5, name: "Michael Wilson", email: "michael.w@example.com", phone: "+1 (555) 876-5432", favorite: false },
]

function ContactsPage() {
  const [contacts, setContacts] = useState(mockContacts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState(null)

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm),
  )

  const toggleFavorite = (contactId) => {
    setContacts(
      contacts.map((contact) => (contact.id === contactId ? { ...contact, favorite: !contact.favorite } : contact)),
    )
  }

  const handleContactClick = (contact) => {
    setSelectedContact(contact)
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex flex-col md:flex-row h-full">
        {/* Contacts list */}
        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search contacts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className={`p-4 hover:bg-gray-100 cursor-pointer ${selectedContact?.id === contact.id ? "bg-purple-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold">
                      {contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(contact.id)
                    }}
                    className="text-gray-400 hover:text-yellow-400"
                  >
                    <Star
                      size={18}
                      fill={contact.favorite ? "currentColor" : "none"}
                      className={contact.favorite ? "text-yellow-400" : ""}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact details */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedContact ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xl font-semibold">
                    {selectedContact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold">{selectedContact.name}</h2>
                    <p className="text-gray-500">{selectedContact.favorite ? "Favorite Contact" : "Contact"}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Edit size={20} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Trash size={20} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Mail size={20} className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{selectedContact.email}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Phone size={20} className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{selectedContact.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  <Mail size={16} className="mr-2" />
                  Send Email
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Phone size={16} className="mr-2" />
                  Call
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Users size={48} strokeWidth={1} />
              <p className="mt-2">Select a contact to view details</p>
              <button className="mt-4 flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <Plus size={16} className="mr-2" />
                Add New Contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactsPage

