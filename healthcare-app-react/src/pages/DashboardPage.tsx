import React from 'react'
import { Calendar, Clock, MapPin, User, FileText, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useUserAppointments, useCancelAppointment } from '../hooks/useAppointments'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: appointments, isLoading } = useUserAppointments()
  const cancelAppointment = useCancelAppointment()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to view your dashboard</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  const upcomingAppointments = appointments?.filter(
    apt => apt.status !== 'cancelled' && apt.status !== 'completed' && 
    new Date(apt.appointment_date) >= new Date()
  ) || []

  const pastAppointments = appointments?.filter(
    apt => apt.status === 'completed' || 
    new Date(apt.appointment_date) < new Date()
  ) || []

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      await cancelAppointment.mutateAsync(appointmentId)
      toast.success('Appointment cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel appointment')
    }
  }

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: any, isPast?: boolean }) => {
    const appointmentDateTime = new Date(appointment.appointment_date)

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Doctor Appointment
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  appointment.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : appointment.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {format(appointmentDateTime, 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                {format(appointmentDateTime, 'h:mm a')} ({appointment.duration_minutes} minutes)
              </div>
            </div>
            {appointment.reason_for_visit && (
              <div className="mt-3 flex items-start">
                <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-600">{appointment.reason_for_visit}</p>
              </div>
            )}
          </div>
        </div>

        {!isPast && appointment.status !== 'cancelled' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleCancelAppointment(appointment.id)}
              disabled={cancelAppointment.isPending}
              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              Cancel Appointment
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and health records</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/doctors"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <User className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Find a Doctor</h3>
            <p className="text-sm text-gray-600">Search for healthcare providers</p>
          </Link>
          <Link
            to="/clinics"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <MapPin className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Find a Clinic</h3>
            <p className="text-sm text-gray-600">Locate nearby healthcare facilities</p>
          </Link>
          <Link
            to="/services"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <FileText className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Browse Services</h3>
            <p className="text-sm text-gray-600">View available medical services</p>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You have no upcoming appointments</p>
              <Link
                to="/doctors"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Book an Appointment
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Appointments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastAppointments.slice(0, 4).map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} isPast />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
