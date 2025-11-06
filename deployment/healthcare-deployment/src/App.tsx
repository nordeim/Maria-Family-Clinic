import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/ui/header'
import { Footer } from './components/ui/footer'
import { HomePage } from './pages/HomePage'
import { DoctorSearchPage } from './pages/DoctorSearchPage'
import { ClinicPage } from './pages/ClinicPage'
import { ServicesPage } from './pages/ServicesPage'
import { ContactPage } from './pages/ContactPage'
import './globals.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/doctors" element={<DoctorSearchPage />} />
            <Route path="/clinics" element={<ClinicPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App