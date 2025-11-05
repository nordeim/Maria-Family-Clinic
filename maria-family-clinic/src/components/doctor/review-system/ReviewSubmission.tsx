import * as React from "react"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Star,
  Upload,
  Camera,
  FileText,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  X,
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReviewSubmission, ReviewDimensions, TreatmentOutcome, PrivateFeedback } from "./types"

interface ReviewSubmissionProps {
  doctorId: string
  doctorName: string
  appointmentId?: string
  isVerifiedPatient?: boolean
  onSubmit: (submission: ReviewSubmission) => Promise<void>
  onCancel: () => void
  className?: string
}

interface RatingCategory {
  key: keyof ReviewDimensions
  label: string
  description: string
  icon: React.ReactNode
  isOptional?: boolean
}

export function ReviewSubmission({
  doctorId,
  doctorName,
  appointmentId,
  isVerifiedPatient = false,
  onSubmit,
  onCancel,
  className,
}: ReviewSubmissionProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<ReviewSubmission>>({
    doctorId,
    appointmentId,
    dimensions: {
      overallRating: 0,
      bedsideManner: 0,
      waitTime: 0,
      communication: 0,
      treatmentEffectiveness: 0,
      facilityEnvironment: 0,
      painManagement: 0,
      followUpCare: 0,
    },
    isAnonymous: false,
    allowPublicDisplay: true,
    agreeToTerms: false,
    consentGiven: false,
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const ratingCategories: RatingCategory[] = [
    {
      key: 'overallRating',
      label: 'Overall Experience',
      description: 'Your overall satisfaction with the doctor',
      icon: <Star className="h-4 w-4" />,
    },
    {
      key: 'bedsideManner',
      label: 'Bedside Manner',
      description: 'Doctor\'s empathy, compassion, and personal interaction',
      icon: <Heart className="h-4 w-4" />,
    },
    {
      key: 'communication',
      label: 'Communication',
      description: 'Clarity of explanations and listening skills',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      key: 'waitTime',
      label: 'Wait Time',
      description: 'Time spent waiting for your appointment',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: 'treatmentEffectiveness',
      label: 'Treatment Effectiveness',
      description: 'How well the treatment worked for you',
      icon: <ThumbsUp className="h-4 w-4" />,
      isOptional: true,
    },
    {
      key: 'facilityEnvironment',
      label: 'Facility & Environment',
      description: 'Cleanliness, comfort, and clinic atmosphere',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      key: 'painManagement',
      label: 'Pain Management',
      description: 'Doctor\'s approach to managing discomfort',
      icon: <Heart className="h-4 w-4" />,
      isOptional: true,
    },
    {
      key: 'followUpCare',
      label: 'Follow-up Care',
      description: 'Quality of post-treatment communication',
      icon: <CheckCircle className="h-4 w-4" />,
      isOptional: true,
    },
  ]

  const handleRatingChange = (category: keyof ReviewDimensions, rating: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [category]: rating,
      },
    }))
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      const { dimensions } = formData
      if (!dimensions?.overallRating || dimensions.overallRating === 0) {
        newErrors.overallRating = 'Overall rating is required'
      }
      if (!dimensions?.bedsideManner || dimensions.bedsideManner === 0) {
        newErrors.bedsideManner = 'Bedside manner rating is required'
      }
      if (!dimensions?.communication || dimensions.communication === 0) {
        newErrors.communication = 'Communication rating is required'
      }
    }

    if (stepNumber === 2) {
      if (!formData.comment?.trim()) {
        newErrors.comment = 'Review comment is required'
      } else if (formData.comment.length < 50) {
        newErrors.comment = 'Review comment must be at least 50 characters'
      } else if (formData.comment.length > 2000) {
        newErrors.comment = 'Review comment cannot exceed 2000 characters'
      }
    }

    if (stepNumber === 3) {
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions'
      }
      if (!formData.consentGiven) {
        newErrors.consentGiven = 'Privacy consent is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData as ReviewSubmission)
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarRating = (
    category: keyof ReviewDimensions,
    value: number,
    onChange: (rating: number) => void,
    size: 'sm' | 'md' = 'md'
  ) => {
    const starSize = size === 'md' ? "h-6 w-6" : "h-5 w-5"
    
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={cn(
              "transition-colors",
              starSize,
              i < value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            )}
          >
            <Star className={starSize} />
          </button>
        ))}
      </div>
    )
  }

  const renderRatingCategory = (category: RatingCategory) => {
    const rating = formData.dimensions?.[category.key] as number || 0
    
    return (
      <div key={category.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {category.icon}
            <Label className="font-medium">{category.label}</Label>
            {category.isOptional && (
              <Badge variant="secondary" className="text-xs">Optional</Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating > 0 ? `${rating}/5` : 'Not rated'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{category.description}</p>
        {renderStarRating(category.key, rating, (rating) => 
          handleRatingChange(category.key, rating)
        )}
        {errors[category.key] && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors[category.key]}
          </p>
        )}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Rate Your Experience</h3>
              <p className="text-sm text-muted-foreground">
                Help others by rating different aspects of your visit with Dr. {doctorName}
              </p>
              {isVerifiedPatient && (
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Verified Patient Review
                </div>
              )}
            </div>

            <div className="space-y-6">
              {ratingCategories.map(renderRatingCategory)}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Share Your Experience</h3>
              <p className="text-sm text-muted-foreground">
                Describe your visit to help other patients make informed decisions
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell other patients about your experience with Dr. {doctorName}. What did you like? What could be improved?"
                  className="min-h-[120px] resize-none"
                  value={formData.comment || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Minimum 50 characters required
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(formData.comment || '').length}/2000
                  </span>
                </div>
                {errors.comment && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.comment}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Treatment Outcome (Optional)</Label>
                <Select 
                  value={formData.outcome?.effectiveness || ''}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    outcome: {
                      ...prev.outcome!,
                      effectiveness: value as TreatmentOutcome['effectiveness']
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How effective was the treatment?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_effective">Very Effective</SelectItem>
                    <SelectItem value="effective">Effective</SelectItem>
                    <SelectItem value="somewhat_effective">Somewhat Effective</SelectItem>
                    <SelectItem value="not_effective">Not Effective</SelectItem>
                    <SelectItem value="worse">Made Condition Worse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wouldRecommend"
                    checked={formData.outcome?.wouldRecommend || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      outcome: {
                        ...prev.outcome!,
                        wouldRecommend: checked as boolean
                      }
                    }))}
                  />
                  <Label htmlFor="wouldRecommend" className="text-sm">
                    I would recommend this doctor to others
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wouldReturn"
                    checked={formData.outcome?.wouldReturn || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      outcome: {
                        ...prev.outcome!,
                        wouldReturn: checked as boolean
                      }
                    }))}
                  />
                  <Label htmlFor="wouldReturn" className="text-sm">
                    I would return to this doctor for future care
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Privacy & Submission</h3>
              <p className="text-sm text-muted-foreground">
                Choose how your review will be displayed and review our guidelines
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Display Name</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAnonymous"
                    checked={formData.isAnonymous || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      isAnonymous: checked as boolean
                    }))}
                  />
                  <Label htmlFor="isAnonymous" className="text-sm flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Post review anonymously
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Your name will be shown as "{formData.isAnonymous ? 'Anonymous Patient' : 'Verified Patient'}"
                </p>
              </div>

              <div className="space-y-3">
                <Label>Additional Feedback</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowPublicDisplay"
                    checked={formData.allowPublicDisplay !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      allowPublicDisplay: checked as boolean
                    }))}
                  />
                  <Label htmlFor="allowPublicDisplay" className="text-sm">
                    Allow this review to be displayed publicly
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Uncheck if you only want to provide private feedback
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Review Guidelines</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Base your review on your personal experience</li>
                  <li>• Be honest, constructive, and respectful</li>
                  <li>• Avoid sharing specific medical details</li>
                  <li>• Do not include contact information or advertising</li>
                  <li>• Reviews are subject to moderation and verification</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      agreeToTerms: checked as boolean
                    }))}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the review terms and conditions
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.agreeToTerms}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consentGiven"
                    checked={formData.consentGiven || false}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      consentGiven: checked as boolean
                    }))}
                  />
                  <Label htmlFor="consentGiven" className="text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    I consent to the processing of my review data in accordance with privacy regulations
                  </Label>
                </div>
                {errors.consentGiven && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.consentGiven}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepProgress = () => {
    return (step / 3) * 100
  }

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Write a Review for Dr. {doctorName}
          </CardTitle>
          <CardDescription>
            Help other patients by sharing your experience
          </CardDescription>
          <Progress value={getStepProgress()} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStepContent()}
      </CardContent>
    </Card>
  )
}
