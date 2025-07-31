"use client"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { PenSquare, Mail, Users, Settings, HelpCircle, LogOut, Moon } from "lucide-react"

function Sidebar({ darkMode, toggleDarkMode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="fixed inset-y-0 left-0 w-16 md:w-20 bg-gray-900 text-white flex flex-col items-center py-4">
      <div className="flex flex-col items-center justify-between h-full">
        <div className="flex flex-col items-center space-y-4">
          <NavLink
            to="/dashboard/compose"
            className={({ isActive }) => `sidebar-icon ${isActive ? "bg-purple-600 text-white" : ""}`}
          >
            <PenSquare size={20} />
            <span className="sidebar-tooltip">Compose</span>
          </NavLink>

          <NavLink
            to="/dashboard/inbox"
            className={({ isActive }) => `sidebar-icon ${isActive ? "bg-purple-600 text-white" : ""}`}
          >
            <Mail size={20} />
            <span className="sidebar-tooltip">Mail</span>
          </NavLink>

          <NavLink
            to="/dashboard/contacts"
            className={({ isActive }) => `sidebar-icon ${isActive ? "bg-purple-600 text-white" : ""}`}
          >
            <Users size={20} />
            <span className="sidebar-tooltip">Contacts</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => `sidebar-icon ${isActive ? "bg-purple-600 text-white" : ""}`}
          >
            <Settings size={20} />
            <span className="sidebar-tooltip">Settings</span>
          </NavLink>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button onClick={toggleDarkMode} className="sidebar-icon">
            <Moon size={20} />
            <span className="sidebar-tooltip">Dark mode</span>
          </button>

          <NavLink
            to="/dashboard/about"
            className={({ isActive }) => `sidebar-icon ${isActive ? "bg-purple-600 text-white" : ""}`}
          >
            <HelpCircle size={20} />
            <span className="sidebar-tooltip">About</span>
          </NavLink>

          <button onClick={handleLogout} className="sidebar-icon text-red-500 hover:bg-red-600 hover:text-white">
            <LogOut size={20} />
            <span className="sidebar-tooltip">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

