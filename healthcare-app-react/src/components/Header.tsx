import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Phone, MapPin, Menu, X, User, Shield, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single()
      return !!data
    },
    enabled: !!user,
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/')
      setIsMobileMenuOpen(false)
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavigation = (href: string, itemName: string) => {
    console.log(`Navigating from ${itemName} to:`, href)
    navigate(href)
    setIsMobileMenuOpen(false)
  }

  // Hardcoded navigation items to avoid map closure issues
  const isHomeCurrent = location.pathname === '/'
  const isDoctorsCurrent = location.pathname.startsWith('/doctors')
  const isClinicsCurrent = location.pathname === '/clinics'
  const isServicesCurrent = location.pathname === '/services'
  const isContactCurrent = location.pathname === '/contact'
  const isDashboardCurrent = location.pathname === '/dashboard'
  const isAdminCurrent = location.pathname === '/admin'

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MyFamily Clinic</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => handleNavigation('/', 'Home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isHomeCurrent
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/doctors', 'Find Doctors')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isDoctorsCurrent
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => handleNavigation('/clinics', 'Clinics')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isClinicsCurrent
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Clinics
            </button>
            <button
              onClick={() => handleNavigation('/services', 'Services')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isServicesCurrent
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNavigation('/contact', 'Contact')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isContactCurrent
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Contact
            </button>
            {user && (
              <button
                onClick={() => handleNavigation('/dashboard', 'Dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center ${
                  isDashboardCurrent
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <User className="h-4 w-4 mr-1" />
                Dashboard
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleNavigation('/admin', 'Admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center ${
                  isAdminCurrent
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </button>
            )}
            {!user ? (
              <button
                onClick={() => handleNavigation('/login', 'Login')}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer border-none outline-none flex items-center"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors cursor-pointer border-none outline-none flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            )}
          </div>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>+65 6123 4567</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Singapore</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => handleNavigation('/', 'Home')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isHomeCurrent
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/doctors', 'Find Doctors')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isDoctorsCurrent
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => handleNavigation('/clinics', 'Clinics')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isClinicsCurrent
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Clinics
            </button>
            <button
              onClick={() => handleNavigation('/services', 'Services')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isServicesCurrent
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNavigation('/contact', 'Contact')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
                isContactCurrent
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Contact
            </button>
            {user && (
              <button
                onClick={() => handleNavigation('/dashboard', 'Dashboard')}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center ${
                  isDashboardCurrent
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <User className="h-5 w-5 mr-2" />
                Dashboard
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleNavigation('/admin', 'Admin')}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center ${
                  isAdminCurrent
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin
              </button>
            )}
            {!user ? (
              <button
                onClick={() => handleNavigation('/login', 'Login')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer border-none outline-none flex items-center"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors cursor-pointer border-none outline-none flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
