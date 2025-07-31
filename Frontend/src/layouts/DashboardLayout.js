"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function DashboardLayout() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ml-16 md:ml-20 min-h-screen">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

