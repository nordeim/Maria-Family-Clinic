import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'

// Contexts
import { AuthProvider } from './contexts/AuthContext'

// Layouts
import RootLayout from './layouts/RootLayout'

// Pages
import HomePage from './pages/HomePage'
import DoctorsPage from './pages/DoctorsPage'
import DoctorDetailPage from './pages/DoctorDetailPage'
import ClinicsPage from './pages/ClinicsPage'
import ClinicDetailPage from './pages/ClinicDetailPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="doctors" element={<DoctorsPage />} />
                <Route path="doctors/:id" element={<DoctorDetailPage />} />
                <Route path="clinics" element={<ClinicsPage />} />
                <Route path="clinics/:id" element={<ClinicDetailPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
