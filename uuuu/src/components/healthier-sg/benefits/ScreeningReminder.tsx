"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Bell,
  Stethoscope,
  Heart,
  Activity,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface ScreeningAppointment {
  id: string
  type: 'general' | 'diabetes' | 'cardiovascular' | 'cancer' | 'vision' | 'hearing'
  title: string
  description: string
  scheduledDate: Date
  time: string
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  doctorName: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  preparation?: string[]
  reminderSent: boolean
  estimatedDuration: number
}

interface ScreeningRecommendation {
  id: string
  type: string
  title: string
  description: string
  recommendedAge: string
  frequency: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  benefits: string[]
  icon: React.ReactNode
  color: string
}

export default function ScreeningReminder() {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'upcoming' | 'calendar' | 'recommendations'>('upcoming')

  // Mock data for appointments
  const [appointments] = useState<ScreeningAppointment[]>([
    {
      id: '1',
      type: 'general',
      title: 'Annual Health Check-up',
      description: 'Comprehensive health screening including blood pressure, cholesterol, and general wellness assessment',
      scheduledDate: new Date('2025-11-15'),
      time: '09:00',
      clinicName: 'My Family Clinic',
      clinicAddress: '123 Health Street, Singapore 123456',
      clinicPhone: '+65 6123 4567',
      doctorName: 'Dr. Sarah Tan',
      status: 'scheduled',
      preparation: [
        'Fast for 8-12 hours before the appointment',
        'Bring ID and insurance card',
        'List current medications'
      ],
      reminderSent: true,
      estimatedDuration: 90
    },
    {
      id: '2',
      type: 'diabetes',
      title: 'Diabetes Screening',
      description: 'Blood glucose test and HbA1c measurement for diabetes monitoring',
      scheduledDate: new Date('2025-12-01'),
      time: '14:30',
      clinicName: 'My Family Clinic',
      clinicAddress: '123 Health Street, Singapore 123456',
      clinicPhone: '+65 6123 4567',
      doctorName: 'Dr. Michael Lim',
      status: 'confirmed',
      preparation: [
        'Continue normal eating routine',
        'Bring diabetes log if available'
      ],
      reminderSent: false,
      estimatedDuration: 45
    },
    {
      id: '3',
      type: 'cardiovascular',
      title: 'Heart Health Assessment',
      description: 'ECG, blood pressure monitoring, and cardiovascular risk assessment',
      scheduledDate: new Date('2025-12-20'),
      time: '11:00',
      clinicName: 'My Family Clinic',
      clinicAddress: '123 Health Street, Singapore 123456',
      clinicPhone: '+65 6123 4567',
      doctorName: 'Dr. Jennifer Wong',
      status: 'scheduled',
      preparation: [
        'Avoid caffeine 2 hours before',
        'Wear comfortable clothing',
        'Bring exercise history record'
      ],
      reminderSent: false,
      estimatedDuration: 60
    }
  ])

  // Mock data for recommendations
  const [recommendations] = useState<ScreeningRecommendation[]>([
    {
      id: '1',
      type: 'vision',
      title: 'Vision Screening',
      description: 'Comprehensive eye examination including visual acuity and pressure test',
      recommendedAge: '40+ years',
      frequency: 'Every 2 years',
      urgency: 'medium',
      benefits: [
        'Early detection of vision problems',
        'Glaucoma and cataract prevention',
        'Updated prescription if needed'
      ],
      icon: <Stethoscope className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '2',
      type: 'hearing',
      title: 'Hearing Assessment',
      description: 'Audiometry test and hearing evaluation',
      recommendedAge: '50+ years',
      frequency: 'Every 3 years',
      urgency: 'low',
      benefits: [
        'Detect hearing loss early',
        'Prevent further deterioration',
        'Improve quality of life'
      ],
      icon: <Activity className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: '3',
      type: 'cancer',
      title: 'Cancer Screening (Mammogram)',
      description: 'Breast cancer screening for early detection',
      recommendedAge: '50-69 years',
      frequency: 'Every 2 years',
      urgency: 'high',
      benefits: [
        'Early cancer detection',
        'Higher treatment success rate',
        'Peace of mind'
      ],
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-600 bg-red-100'
    },
    {
      id: '4',
      type: 'bone',
      title: 'Bone Density Scan',
      description: 'DEXA scan for osteoporosis detection',
      recommendedAge: '65+ years',
      frequency: 'Every 3 years',
      urgency: 'medium',
      benefits: [
        'Prevent fractures',
        'Monitor bone health',
        'Guide treatment decisions'
      ],
      icon: <Users className="h-5 w-5" />,
      color: 'text-green-600 bg-green-100'
    }
  ])

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'text-blue-600 bg-blue-100',
      confirmed: 'text-green-600 bg-green-100',
      completed: 'text-gray-600 bg-gray-100',
      cancelled: 'text-red-600 bg-red-100',
      rescheduled: 'text-orange-600 bg-orange-100'
    }
    return colors[status as keyof typeof colors] || colors.scheduled
  }

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    }
    return colors[urgency as keyof typeof colors] || colors.low
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      general: <Stethoscope className="h-4 w-4" />,
      diabetes: <Heart className="h-4 w-4" />,
      cardiovascular: <Activity className="h-4 w-4" />,
      cancer: <Heart className="h-4 w-4" />,
      vision: <Stethoscope className="h-4 w-4" />,
      hearing: <Activity className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <Stethoscope className="h-4 w-4" />
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => 
      apt.scheduledDate >= now && (apt.status === 'scheduled' || apt.status === 'confirmed')
    ).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  }

  const formatDate = (date: Date) => {
    return format(date, 'PPP')
  }

  const getAppointmentStats = () => {
    const upcoming = getUpcomingAppointments().length
    const completed = appointments.filter(apt => apt.status === 'completed').length
    const thisMonth = appointments.filter(apt => 
      apt.scheduledDate.getMonth() === new Date().getMonth() &&
      apt.scheduledDate.getFullYear() === new Date().getFullYear()
    ).length

    return { upcoming, completed, thisMonth }
  }

  const stats = getAppointmentStats()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Health Screening Reminders
          </CardTitle>
          <CardDescription>
            Manage your health screening appointments and get personalized recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(value: any) => setView(value)} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Book Screening
          </Button>
        </div>

        {/* Upcoming Appointments Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="space-y-4">
            {getUpcomingAppointments().map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={cn("p-3 rounded-full", appointment.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')}>
                        {getTypeIcon(appointment.type)}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{appointment.title}</h3>
                          <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {appointment.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(appointment.scheduledDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.time} ({appointment.estimatedDuration}min)</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{appointment.clinicName}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Dr. {appointment.doctorName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.clinicPhone}</span>
                          </div>
                        </div>

                        {appointment.preparation && (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <h4 className="text-sm font-medium text-yellow-800 mb-1">Preparation Required:</h4>
                            <ul className="text-xs text-yellow-700 space-y-1">
                              {appointment.preparation.map((prep, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <AlertCircle className="h-3 w-3" />
                                  {prep}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                    <Button size="sm" variant="outline">
                      Contact Clinic
                    </Button>
                    {!appointment.reminderSent && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Set Reminder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Schedule Calendar</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Appointments on {formatDate(selectedDate)}
                  </h3>
                  
                  {appointments
                    .filter(apt => 
                      apt.scheduledDate.toDateString() === selectedDate.toDateString()
                    )
                    .map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(appointment.type)}
                            <h4 className="font-medium">{appointment.title}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                  
                  {appointments.filter(apt => 
                    apt.scheduledDate.toDateString() === selectedDate.toDateString()
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No appointments scheduled for this date
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={cn("p-3 rounded-full", rec.color)}>
                        {rec.icon}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge className={cn("text-xs", getUrgencyColor(rec.urgency))}>
                            {rec.urgency}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {rec.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Recommended Age: </span>
                            <span className="font-medium">{rec.recommendedAge}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Frequency: </span>
                            <span className="font-medium">{rec.frequency}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Benefits:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {rec.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm">
                      Schedule Screening
                    </Button>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}