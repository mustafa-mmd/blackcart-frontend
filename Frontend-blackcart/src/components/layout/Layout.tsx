// components/layout/Layout.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../common/Header'
import Footer from '../common/Footer'
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton'

interface LayoutProps {
  children?: React.ReactNode // Optional children for backward compatibility
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen overflow-x-clip flex flex-col bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="flex-grow">
        {/* Use Outlet for nested routes, fallback to children for direct usage */}
        {children ? children : <Outlet />}
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  )
}

export default Layout
