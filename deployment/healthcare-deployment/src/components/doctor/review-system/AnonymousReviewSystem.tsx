import * as React from "react"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Checkbox
} from "@/components/ui/checkbox"
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Camera,
  FileImage,
  Search,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Heart,
  MessageCircle,
  ThumbsUp,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReviewSubmission, PrivateFeedback } from "./types"

interface AnonymousReviewSystemProps {
  doctorId: string
  doctorName: string
  clinicId?: string
  onSubmitAnonymous?: (submission: ReviewSubmission) => Promise<void>
  onSubmitPrivate?: (feedback: PrivateFeedback) => Promise<void>
  className?: string
}

interface VerificationData {
  phoneLast4?: string
  emailDomain?: string
  appointmentDate?: string
  reason?: string
}

export function AnonymousReviewSystem({
  doctorId,
  doctorName,
  clinicId,
  onSubmitAnonymous,
  onSubmitPrivate,
  className,
}: AnonymousReviewSystemProps) {
  const [mode, setMode] = useState<'anonymous' | 'private'>('anonymous')
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verificationData, setVerificationData] = useState<VerificationData>({})
  const [isVerified, setIsVerified] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [anonymousData, setAnonymousData] = useState<Partial<ReviewSubmission>>({
    doctorId,
    clinicId,
    dimensions: {
      overallRating: 0,
      bedsideManner: 0,
      communication: 0,
      waitTime: 0,
      treatmentEffectiveness: 0,
      facilityEnvironment: 0,
      painManagement: 0,
      followUpCare: 0,
    },
    isAnonymous: true,
    allowPublicDisplay: true,
    agreeToTerms: false,
    consentGiven: false,
  })

  const [privateData, setPrivateData] = useState<Partial<PrivateFeedback>>({
    concernType: 'other',
    description: '',
    isConfidential: true,
    followUpRequired: false,
  })

  const handleAnonymousSubmission = async () => {
    if (!anonymousData.comment?.trim() || !anonymousData.dimensions?.overallRating) {
      setErrors({ submit: 'Please complete all required fields' })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmitAnonymous?.(anonymousData as ReviewSubmission)
      // Reset form
      setAnonymousData({
        doctorId,
        clinicId,
        dimensions: {
          overallRating: 0,
          bedsideManner: 0,
          communication: 0,
          waitTime: 0,
          treatmentEffectiveness: 0,
          facilityEnvironment: 0,
          painManagement: 0,
          followUpCare: 0,
        },
        isAnonymous: true,
        allowPublicDisplay: true,
        agreeToTerms: false,
        consentGiven: false,
      })
      setStep(1)
      setMode('anonymous')
    } catch (error) {
      console.error('Error submitting anonymous review:', error)
      setErrors({ submit: 'Failed to submit review. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrivateSubmission = async () => {
    if (!privateData.description?.trim()) {
      setErrors({ submit: 'Please describe your concern' })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmitPrivate?.(privateData as PrivateFeedback)
      // Reset form
      setPrivateData({
        concernType: 'other',
        description: '',
        isConfidential: true,
        followUpRequired: false,
      })
      setStep(1)
      setMode('anonymous')
    } catch (error) {
      console.error('Error submitting private feedback:', error)
      setErrors({ submit: 'Failed to submit feedback. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyPatientIdentity = async () => {
    // Simulate verification process
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsVerified(true)
    setIsSubmitting(false)
    setShowVerificationDialog(false)
  }

  const renderStarRating = (value: number, onChange: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label} *</Label>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={cn(
              "h-8 w-8 transition-colors",
              i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
            )}
          >
            <Star className="h-8 w-8" />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{value > 0 ? `${value}/5` : 'Not rated'}</span>
    </div>
  )

  const renderAnonymousReview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <UserX className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Anonymous Patient Review</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Share your experience while protecting your privacy
        </p>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
          <Lock className="h-4 w-4" />
          Your identity will be completely protected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderStarRating(
          anonymousData.dimensions?.overallRating || 0,
          (rating) => setAnonymousData(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions!, overallRating: rating }
          })),
          'Overall Experience'
        )}

        {renderStarRating(
          anonymousData.dimensions?.bedsideManner || 0,
          (rating) => setAnonymousData(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions!, bedsideManner: rating }
          })),
          'Bedside Manner'
        )}

        {renderStarRating(
          anonymousData.dimensions?.communication || 0,
          (rating) => setAnonymousData(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions!, communication: rating }
          })),
          'Communication'
        )}

        {renderStarRating(
          anonymousData.dimensions?.waitTime || 0,
          (rating) => setAnonymousData(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions!, waitTime: rating }
          })),
          'Wait Time'
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="anonymous-comment">Your Experience *</Label>
        <Textarea
          id="anonymous-comment"
          placeholder="Share your experience with Dr. Smith. What went well? What could be improved?"
          value={anonymousData.comment || ''}
          onChange={(e) => setAnonymousData(prev => ({ ...prev, comment: e.target.value }))}
          className="min-h-[120px]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Minimum 50 characters required</span>
          <span>{(anonymousData.comment || '').length}/2000</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous-public"
            checked={anonymousData.allowPublicDisplay !== false}
            onCheckedChange={(checked) => setAnonymousData(prev => ({
              ...prev,
              allowPublicDisplay: checked as boolean
            }))}
          />
          <Label htmlFor="anonymous-public" className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Allow this review to be displayed publicly
          </Label>
        </div>
        <p className="text-xs text-muted-foreground ml-6">
          Your review will be posted as "Anonymous Patient" to help other patients
        </p>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous-terms"
            checked={anonymousData.agreeToTerms || false}
            onCheckedChange={(checked) => setAnonymousData(prev => ({
              ...prev,
              agreeToTerms: checked as boolean
            }))}
          />
          <Label htmlFor="anonymous-terms" className="text-sm">
            I agree to the review terms and guidelines *
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous-consent"
            checked={anonymousData.consentGiven || false}
            onCheckedChange={(checked) => setAnonymousData(prev => ({
              ...prev,
              consentGiven: checked as boolean
            }))}
          />
          <Label htmlFor="anonymous-consent" className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            I consent to privacy-compliant processing of my feedback *
          </Label>
        </div>
      </div>

      {errors.submit && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          {errors.submit}
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setMode('private')}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Submit Private Feedback Instead
        </Button>
        <Button 
          onClick={handleAnonymousSubmission}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Anonymous Review'}
        </Button>
      </div>
    </div>
  )

  const renderPrivateFeedback = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Private Confidential Feedback</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Share sensitive concerns directly with our patient care team
        </p>
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
          <Shield className="h-4 w-4" />
          Confidential & Privileged Communication
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Concern Type</Label>
          <Select 
            value={privateData.concernType} 
            onValueChange={(value: any) => setPrivateData(prev => ({ ...prev, concernType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="billing">Billing/Insurance Issue</SelectItem>
              <SelectItem value="staff">Staff Behavior</SelectItem>
              <SelectItem value="communication">Communication Problem</SelectItem>
              <SelectItem value="scheduling">Scheduling Issues</SelectItem>
              <SelectItem value="other">Other Concern</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Preferred Contact Method (Optional)</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="How should we contact you?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="clinic_visit">Clinic Visit</SelectItem>
              <SelectItem value="no_contact">No Contact Needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="private-description">Describe Your Concern *</Label>
        <Textarea
          id="private-description"
          placeholder="Please provide details about your concern. Include dates, names, and specific issues if possible."
          value={privateData.description || ''}
          onChange={(e) => setPrivateData(prev => ({ ...prev, description: e.target.value }))}
          className="min-h-[120px]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Minimum 50 characters required</span>
          <span>{(privateData.description || '').length}/2000</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="private-confidential"
            checked={privateData.isConfidential !== false}
            onCheckedChange={(checked) => setPrivateData(prev => ({
              ...prev,
              isConfidential: checked as boolean
            }))}
          />
          <Label htmlFor="private-confidential" className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Mark as confidential - only share with authorized personnel
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="private-followup"
            checked={privateData.followUpRequired || false}
            onCheckedChange={(checked) => setPrivateData(prev => ({
              ...prev,
              followUpRequired: checked as boolean
            }))}
          />
          <Label htmlFor="private-followup" className="text-sm">
            I would like a response or follow-up regarding this concern
          </Label>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-medium text-yellow-800">Important Information</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This feedback will be handled confidentially by our patient care team</li>
              <li>• We will not share your concerns with the doctor unless necessary</li>
              <li>• All feedback is reviewed and investigated as appropriate</li>
              <li>• Response time: 2-5 business days</li>
            </ul>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          {errors.submit}
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setMode('anonymous')}
          className="flex-1"
        >
          <UserX className="h-4 w-4 mr-2" />
          Submit Anonymous Review Instead
        </Button>
        <Button 
          onClick={handlePrivateSubmission}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Private Feedback'}
        </Button>
      </div>
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy-Focused Review System
          </CardTitle>
          <CardDescription>
            Share your experience with Dr. {doctorName} while protecting your privacy
          </CardDescription>
          
          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button
              variant={mode === 'anonymous' ? 'default' : 'outline'}
              onClick={() => setMode('anonymous')}
              className="h-auto p-4 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  <span className="font-medium">Anonymous Review</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Public review as "Anonymous Patient"
                </p>
              </div>
            </Button>
            
            <Button
              variant={mode === 'private' ? 'default' : 'outline'}
              onClick={() => setMode('private')}
              className="h-auto p-4 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Private Feedback</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Confidential communication with care team
                </p>
              </div>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Progress value={66} className="h-2 mb-6" />
          <div className="text-xs text-muted-foreground mb-6">
            Step 1 of 1: Complete your feedback
          </div>

          {mode === 'anonymous' ? renderAnonymousReview() : renderPrivateFeedback()}
        </CardContent>
      </Card>

      {/* Identity Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Identity</DialogTitle>
            <DialogDescription>
              Help us ensure this is a legitimate patient review
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-last4">Last 4 digits of phone number</Label>
              <Input
                id="phone-last4"
                placeholder="1234"
                value={verificationData.phoneLast4 || ''}
                onChange={(e) => setVerificationData(prev => ({
                  ...prev,
                  phoneLast4: e.target.value
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Approximate appointment date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={verificationData.appointmentDate || ''}
                onChange={(e) => setVerificationData(prev => ({
                  ...prev,
                  appointmentDate: e.target.value
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-reason">Reason for anonymity</Label>
              <Select 
                value={verificationData.reason || ''}
                onValueChange={(value) => setVerificationData(prev => ({
                  ...prev,
                  reason: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privacy">Personal privacy concerns</SelectItem>
                  <SelectItem value="sensitive">Sensitive medical condition</SelectItem>
                  <SelectItem value="sensitive_location">Sensitive location</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={verifyPatientIdentity} disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
