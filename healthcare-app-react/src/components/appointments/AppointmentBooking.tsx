import React, { useState } from 'react'
import { Calendar, Clock, User, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { format, addDays, startOfToday, isBefore, isToday, parse } from 'date-fns'
import { useCreateAppointment, useDoctorAppointments } from '../../hooks/useAppointments'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

interface AppointmentBookingProps {
  doctorId: string
  doctorName: string
  clinicId: string
  clinicName: string
  consultationFee: number
  onClose: () => void
  onSuccess?: () => void
}

// Available time slots (9 AM to 5 PM, 30-minute intervals)
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  doctorId,
  doctorName,
  clinicId,
  clinicName,
  consultationFee,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1))
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [reasonForVisit, setReasonForVisit] = useState('')
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirm'>('date')

  const createAppointment = useCreateAppointment()
  const { data: existingAppointments } = useDoctorAppointments(
    doctorId,
    format(selectedDate, 'yyyy-MM-dd')
  )

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))

  // Check if time slot is available
  const isTimeSlotAvailable = (time: string) => {
    if (!existingAppointments) return true
    return !existingAppointments.some(apt => {
      const aptDate = new Date(apt.appointment_date)
      const aptTime = format(aptDate, 'HH:mm')
      return aptTime === time && apt.status !== 'cancelled'
    })
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to book an appointment')
      return
    }

    try {
      // Combine date and time into ISO timestamp
      const appointmentDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`)
      
      await createAppointment.mutateAsync({
        doctor_id: doctorId,
        clinic_id: clinicId,
        appointment_date: appointmentDateTime.toISOString(),
        duration_minutes: 30,
        status: 'pending',
        notes: reasonForVisit || '',
      })

      toast.success('Appointment booked successfully!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-600 mt-1">
              with {doctorName} at {clinicName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mt-4 flex items-center justify-between">
          {['Date', 'Time', 'Details', 'Confirm'].map((label, index) => {
            const stepValue = ['date', 'time', 'details', 'confirm'][index]
            const currentIndex = ['date', 'time', 'details', 'confirm'].indexOf(step)
            const isActive = index === currentIndex
            const isCompleted = index < currentIndex

            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Date Selection */}
        {step === 'date' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Select Appointment Date
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableDates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-sm text-gray-500">{format(date, 'EEE')}</div>
                  <div className="text-lg font-semibold">{format(date, 'MMM d')}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('time')}
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 'time' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Select Appointment Time for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {TIME_SLOTS.map((time) => {
                const available = isTimeSlotAvailable(time)
                return (
                  <button
                    key={time}
                    onClick={() => available && setSelectedTime(time)}
                    disabled={!available}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      time === selectedTime
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : available
                        ? 'border-gray-200 hover:border-blue-300 text-gray-900'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {time}
                    {!available && <div className="text-xs mt-1">Booked</div>}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('date')}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep('details')}
                disabled={!selectedTime}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Appointment Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit (Optional)
                </label>
                <textarea
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please describe your symptoms or reason for consultation..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('time')}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Confirm Appointment</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clinic:</span>
                <span className="font-medium">{clinicName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">30 minutes</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-semibold text-lg">${consultationFee}</span>
              </div>
              {reasonForVisit && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600 block mb-2">Reason for Visit:</span>
                  <p className="text-sm">{reasonForVisit}</p>
                </div>
              )}
            </div>

            {!user && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Please sign in to complete your booking
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('details')}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={createAppointment.isPending || !user}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {createAppointment.isPending ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentBooking
