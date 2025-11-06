import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MessageCircle,
  Phone,
  Mail,
  Video,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  HelpCircle,
  ExternalLink,
  Upload,
  X
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'

export interface SupportRequestProps {
  userId?: string
  registrationId?: string
  issueType?: string
  className?: string
}

interface SupportTicket {
  id: string
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: Date
  attachments: File[]
}

const SUPPORT_CATEGORIES = [
  { value: 'registration', label: 'Registration Issues' },
  { value: 'documents', label: 'Document Upload/Verification' },
  { value: 'identity', label: 'Identity Verification' },
  { value: 'technical', label: 'Technical Issues' },
  { value: 'eligibility', label: 'Eligibility Questions' },
  { value: 'privacy', label: 'Privacy & Data Protection' },
  { value: 'other', label: 'Other' },
]

const SUPPORT_CHANNELS = [
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Get instant help from our support team',
    icon: MessageCircle,
    available: true,
    hours: '24/7',
    responseTime: '2-5 minutes',
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Speak directly with a support specialist',
    icon: Phone,
    available: true,
    hours: 'Mon-Fri 8AM-8PM, Sat-Sun 9AM-5PM',
    responseTime: 'Immediate',
  },
  {
    id: 'video',
    title: 'Video Call',
    description: 'Face-to-face consultation for complex issues',
    icon: Video,
    available: true,
    hours: 'Mon-Fri 9AM-6PM',
    responseTime: '15-30 minutes',
  },
  {
    id: 'email',
    title: 'Email Support',
    description: 'Send detailed questions and get written responses',
    icon: Mail,
    available: true,
    hours: '24/7',
    responseTime: '24-48 hours',
  },
]

const FAQ_ITEMS = [
  {
    question: 'How long does the registration process take?',
    answer: 'The registration process typically takes 15-30 minutes. Document verification may take 1-2 business days.',
  },
  {
    question: 'What documents do I need to upload?',
    answer: 'You need to upload clear photos of the front and back of your NRIC/IC. Additional documents like insurance cards are optional.',
  },
  {
    question: 'Can I save my progress and continue later?',
    answer: 'Yes! Your progress is automatically saved. You can exit and return to complete your registration at any time.',
  },
  {
    question: 'What if my documents are rejected?',
    answer: 'If documents are rejected, you will receive specific feedback. You can re-upload clearer photos or contact support for assistance.',
  },
  {
    question: 'How do I know if I am eligible?',
    answer: 'Complete the eligibility assessment during registration. Generally, adults 40+ and those with chronic conditions are eligible.',
  },
]

export const SupportRequest: React.FC<SupportRequestProps> = ({
  userId,
  registrationId,
  issueType,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'ticket' | 'faq'>('channels')
  const [supportTicket, setSupportTicket] = useState<Partial<SupportTicket>>({
    subject: '',
    description: '',
    category: issueType || '',
    priority: 'medium',
    attachments: [],
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create support ticket
  const createTicketMutation = trpc.healthierSg.createSupportTicket.useMutation({
    onSuccess: (result) => {
      toast({
        title: "Support Ticket Created",
        description: `Your ticket #${result.ticketNumber} has been created. We'll respond within 24 hours.`,
      })
      setSupportTicket({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
        attachments: [],
      })
      setAttachments([])
      setActiveTab('channels')
    },
    onError: (error) => {
      toast({
        title: "Ticket Creation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Schedule callback
  const scheduleCallbackMutation = trpc.healthierSg.scheduleSupportCallback.useMutation({
    onSuccess: () => {
      toast({
        title: "Callback Scheduled",
        description: "Our team will call you within the requested timeframe.",
      })
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleInputChange = (field: keyof SupportTicket, value: any) => {
    setSupportTicket(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Maximum size is 5MB.`,
          variant: "destructive",
        })
        return false
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported format.`,
          variant: "destructive",
        })
        return false
      }
      
      return true
    })

    setAttachments(prev => [...prev, ...validFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitTicket = async () => {
    if (!supportTicket.subject?.trim() || !supportTicket.description?.trim()) {
      toast({
        title: "Incomplete Information",
        description: "Please provide both subject and description for your support request.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createTicketMutation.mutateAsync({
        subject: supportTicket.subject!,
        description: supportTicket.description!,
        category: supportTicket.category!,
        priority: supportTicket.priority!,
        registrationId: registrationId || '',
        attachments: attachments,
      })
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const initiateLiveChat = () => {
    // In a real implementation, this would open a chat widget
    toast({
      title: "Opening Live Chat",
      description: "Please wait while we connect you with a support agent...",
    })
  }

  const initiatePhoneCall = () => {
    // In a real implementation, this might initiate a VoIP call or show phone number
    window.open('tel:1800-4325843')
  }

  const initiateVideoCall = () => {
    toast({
      title: "Scheduling Video Call",
      description: "Our team will contact you within 15-30 minutes to schedule a video consultation.",
    })
  }

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Registration Support</h2>
        <p className="text-gray-600">
          Get help with your Healthier SG registration from our dedicated support team
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex border-b">
          {[
            { id: 'channels', label: 'Support Channels', icon: MessageCircle },
            { id: 'ticket', label: 'Submit Ticket', icon: FileText },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Support Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUPPORT_CHANNELS.map((channel) => {
              const Icon = channel.icon
              return (
                <Card key={channel.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      {channel.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{channel.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Hours: {channel.hours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Response: {channel.responseTime}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {channel.id === 'chat' && (
                        <Button onClick={initiateLiveChat} className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Start Chat
                        </Button>
                      )}
                      {channel.id === 'phone' && (
                        <Button onClick={initiatePhoneCall} className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Now
                        </Button>
                      )}
                      {channel.id === 'video' && (
                        <Button onClick={initiateVideoCall} className="flex-1">
                          <Video className="h-4 w-4 mr-2" />
                          Schedule Video Call
                        </Button>
                      )}
                      {channel.id === 'email' && (
                        <Button 
                          onClick={() => setActiveTab('ticket')}
                          variant="outline" 
                          className="flex-1"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Emergency Contact */}
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong>Urgent Issues?</strong> For urgent medical or technical issues affecting your registration, 
              call our emergency hotline at <strong>1800-HEALTHIER (1800-4325843)</strong> available 24/7.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Submit Ticket Tab */}
      {activeTab === 'ticket' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submit Support Ticket</CardTitle>
            <p className="text-sm text-gray-600">
              Create a detailed support request and our team will respond within 24 hours
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Issue Category</Label>
                <Select
                  value={supportTicket.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={supportTicket.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="medium">Medium - Affecting progress</SelectItem>
                    <SelectItem value="high">High - Blocking registration</SelectItem>
                    <SelectItem value="urgent">Urgent - System error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={supportTicket.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={supportTicket.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide detailed information about your issue, including any error messages or steps you've already tried..."
                rows={6}
              />
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-medium"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      browse files
                    </Button>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported: JPG, PNG, PDF, TXT • Max 5MB each
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files)
                    }
                  }}
                />
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({Math.round(file.size / 1024)}KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registration Info */}
            {registrationId && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <strong>Registration ID:</strong> {registrationId}
                  <br />
                  Our team will use this information to quickly locate your registration and assist you.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitTicket}
                disabled={isSubmitting || !supportTicket.subject?.trim() || !supportTicket.description?.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
            <p className="text-sm text-gray-600">
              Find quick answers to common registration questions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, index) => (
                <div key={index} className="border rounded-lg">
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto p-4 text-left"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600 mb-4">
                Can't find what you're looking for?
              </p>
              <Button onClick={() => setActiveTab('ticket')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}