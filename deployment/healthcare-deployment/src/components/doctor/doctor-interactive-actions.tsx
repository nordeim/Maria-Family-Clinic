import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  Printer,
  Phone,
  MapPin,
  Clock,
  Star,
  UserPlus,
  BookOpen,
  Bell,
  ExternalLink,
  Navigation2,
  Send
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialties: string[]
  email?: string
  phone?: string
  clinics: Array<{
    id: string
    name: string
    address: string
  }>
  rating?: {
    average: number
    count: number
  }
}

interface DoctorInteractiveActionsProps {
  doctor: Doctor
  className?: string
}

export function DoctorInteractiveActions({ doctor, className }: DoctorInteractiveActionsProps) {
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`

  // Mock appointment availability
  const nextAvailableSlots = [
    { date: "Today", time: "2:30 PM", clinic: "My Family Clinic" },
    { date: "Tomorrow", time: "10:00 AM", clinic: "My Family Clinic" },
    { date: "Dec 6", time: "3:15 PM", clinic: "City Health Center" }
  ]

  // Handle appointment booking
  const handleBookAppointment = (clinicId?: string, serviceId?: string) => {
    // In a real app, this would navigate to booking flow
    console.log("Booking appointment with doctor:", doctor.id, "clinic:", clinicId, "service:", serviceId)
    // window.location.href = `/appointments/book?doctor=${doctor.id}&clinic=${clinicId}&service=${serviceId}`
  }

  // Handle view clinic
  const handleViewClinic = (clinicId: string) => {
    console.log("Viewing clinic:", clinicId)
    // window.location.href = `/clinics/${clinicId}`
  }

  // Handle save doctor (add to favorites)
  const handleSaveDoctor = () => {
    console.log("Saving doctor to favorites:", doctor.id)
    // In real app, this would call API to save doctor
  }

  // Handle ask question
  const handleAskQuestion = () => {
    console.log("Opening question form for doctor:", doctor.id)
  }

  // Handle share profile
  const handleShareProfile = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareTitle = `${fullName} - ${doctor.specialties.join(', ')}`
    const shareText = `Book an appointment with ${fullName}, ${doctor.specialties.join(', ')} specialist.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        console.log("Link copied to clipboard")
        // You could show a toast notification here
      } catch (error) {
        console.error("Failed to copy link")
      }
    }
  }

  // Handle print profile
  const handlePrintProfile = () => {
    console.log("Printing doctor profile:", doctor.id)
    window.print()
  }

  // Render contact dialog
  const ContactDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask a Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ask Dr. {doctor.lastName} a Question</DialogTitle>
          <DialogDescription>
            Send your question and we'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Question about your services" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Your Question</Label>
            <Textarea 
              id="question" 
              placeholder="Please describe your question or concern..."
              className="min-h-[100px]"
            />
          </div>
          <Button className="w-full" onClick={handleAskQuestion}>
            <Send className="h-4 w-4 mr-2" />
            Send Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Actions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">
            Book Appointment
          </h4>
          <div className="space-y-2">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleBookAppointment()}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
            
            {/* Next Available Slots */}
            {nextAvailableSlots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Next available:</p>
                {nextAvailableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleBookAppointment(doctor.clinics[0]?.id)}
                  >
                    <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{slot.date} at {slot.time}</span>
                        <span className="text-xs text-muted-foreground">{slot.clinic}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Secondary Actions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">
            Information & Contact
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            {/* Contact Information */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Contact Info</span>
              </div>
              <div className="flex gap-1">
                {doctor.phone && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`tel:${doctor.phone}`}>
                      <Phone className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                {doctor.email && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`mailto:${doctor.email}`}>
                      <MessageSquare className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Clinic Locations */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Available at:</p>
              {doctor.clinics.map((clinic, index) => (
                <div 
                  key={clinic.id}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{clinic.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{clinic.address}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewClinic(clinic.id)}
                  >
                    <Navigation2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Interactive Actions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">
            Profile Actions
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveDoctor}
            >
              <Heart className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShareProfile}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrintProfile}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            
            <ContactDialog />
          </div>
        </div>

        {/* Rating Summary */}
        {doctor.rating && doctor.rating.count > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Patient Reviews
              </h4>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{doctor.rating.average.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({doctor.rating.count} reviews)
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <BookOpen className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Emergency Notice */}
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-800">
                For Medical Emergencies
              </p>
              <p className="text-xs text-red-700">
                Call 995 or visit your nearest emergency department.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}