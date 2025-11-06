import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  CheckCircle, XCircle, Calendar, Star, User, Clock, 
  Filter, Search, AlertCircle, Shield, Stethoscope, ToggleLeft, ToggleRight 
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'reviews' | 'appointments' | 'doctors'>('reviews')
  const [filterStatus, setFilterStatus] = useState<string>('pending')

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      return !!data && !error
    },
    enabled: !!user,
  })

  // Fetch pending reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-reviews', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*, doctors(name, specialty)')
        .order('created_at', { ascending: false })
      
      if (filterStatus === 'pending') {
        query = query.eq('is_approved', false)
      } else if (filterStatus === 'approved') {
        query = query.eq('is_approved', true)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !!isAdmin && activeTab === 'reviews',
  })

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialty), clinics(name)')
        .order('appointment_date', { ascending: true })
        .limit(50)
      
      if (error) throw error
      return data
    },
    enabled: !!isAdmin && activeTab === 'appointments',
  })

  // Fetch doctors
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*, clinics(name)')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!isAdmin && activeTab === 'doctors',
  })

  // Approve review mutation
  const approveReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review approved')
    },
    onError: () => {
      toast.error('Failed to approve review')
    },
  })

  // Reject review mutation
  const rejectReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review rejected')
    },
    onError: () => {
      toast.error('Failed to reject review')
    },
  })

  // Update appointment status
  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      toast.success('Appointment updated')
    },
    onError: () => {
      toast.error('Failed to update appointment')
    },
  })

  // Toggle doctor active status
  const toggleDoctorStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('doctors')
        .update({ is_active: !isActive })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
      toast.success('Doctor status updated')
    },
    onError: () => {
      toast.error('Failed to update doctor status')
    },
  })

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage reviews, appointments, and doctors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Star className="inline h-4 w-4 mr-2" />
              Review Moderation
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appointments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Appointment Management
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'doctors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Stethoscope className="inline h-4 w-4 mr-2" />
              Doctors Management
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {/* Filter */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="all">All Reviews</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {reviews?.length || 0} review(s)
              </div>
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : !reviews || reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reviews to display</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            review.is_approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          For: <span className="font-medium text-gray-900">{review.doctors?.name}</span>
                          {' '}({review.doctors?.specialty})
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(review.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                    )}
                    {!review.is_approved && (
                      <div className="flex gap-3 pt-4 border-t">
                        <button
                          onClick={() => approveReview.mutate(review.id)}
                          disabled={approveReview.isPending}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectReview.mutate(review.id)}
                          disabled={rejectReview.isPending}
                          className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:bg-gray-100 flex items-center justify-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <div className="mb-6 text-sm text-gray-600">
              {appointments?.length || 0} appointment(s)
            </div>

            {appointmentsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : !appointments || appointments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments to display</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt: any) => (
                  <div key={apt.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {apt.doctors?.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{apt.doctors?.specialty}</p>
                        <p className="text-sm text-gray-600 mb-1">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {format(new Date(apt.appointment_date), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Clinic: {apt.clinics?.name}
                        </p>
                        {apt.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            Notes: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {apt.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t">
                        <button
                          onClick={() => updateAppointmentStatus.mutate({ id: apt.id, status: 'confirmed' })}
                          disabled={updateAppointmentStatus.isPending}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus.mutate({ id: apt.id, status: 'cancelled' })}
                          disabled={updateAppointmentStatus.isPending}
                          className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div>
            <div className="mb-6 text-sm text-gray-600">
              {doctors?.length || 0} doctor(s)
            </div>

            {doctorsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading doctors...</p>
              </div>
            ) : !doctors || doctors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No doctors to display</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doctor: any) => (
                  <div key={doctor.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {doctor.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doctor.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {doctor.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Specialty:</strong> {doctor.specialty}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Experience:</strong> {doctor.years_of_experience} years
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Clinic:</strong> {doctor.clinics?.name}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Fee:</strong> ${doctor.consultation_fee}
                        </p>
                        {doctor.rating && (
                          <div className="flex items-center mt-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-gray-700 font-medium">
                              {doctor.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <button
                        onClick={() => toggleDoctorStatus.mutate({ id: doctor.id, isActive: doctor.is_active })}
                        disabled={toggleDoctorStatus.isPending}
                        className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${
                          doctor.is_active
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-50`}
                      >
                        {doctor.is_active ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Set Inactive
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Set Active
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
