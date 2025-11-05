'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Video, 
  Mic, 
  Send, 
  PhoneCall, 
  VideoIcon,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  Settings,
  User,
  MessageCircle,
  Smartphone,
  Facebook,
  Twitter,
  Instagram,
  PhoneIncoming,
  PhoneOutgoing
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Progress } from '../../components/ui/progress'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { 
  ChannelType, 
  MessageType, 
  MessageStatus, 
  ChatSessionStatus, 
  ConversationStatus,
  MessageSenderType,
  MessageSentiment 
} from '../../lib/types/multi-channel-contact'

interface MultiChannelContactSystemProps {
  customerId?: string
  customerName?: string
  clinicId?: string
  isAgent?: boolean
}

export const MultiChannelContactSystem: React.FC<MultiChannelContactSystemProps> = ({
  customerId,
  customerName = 'Customer',
  clinicId,
  isAgent = false
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>(ChannelType.CHAT)
  const [isConnected, setIsConnected] = useState<Record<ChannelType, boolean>>({
    [ChannelType.CHAT]: false,
    [ChannelType.PHONE]: false,
    [ChannelType.EMAIL]: false,
    [ChannelType.WHATSAPP]: false,
    [ChannelType.SMS]: false,
    [ChannelType.VIDEO_CALL]: false,
    [ChannelType.VOICE_MESSAGE]: false,
    [ChannelType.FACEBOOK]: false,
    [ChannelType.TWITTER]: false,
    [ChannelType.INSTAGRAM]: false,
    [ChannelType.LINKEDIN]: false,
    [ChannelType.WEB_FORM]: false,
    [ChannelType.TELEGRAM]: false,
    [ChannelType.SOCIAL_MEDIA]: false,
    [ChannelType.MOBILE_APP]: false,
    [ChannelType.PORTAL]: false,
    [ChannelType.API]: false
  })
  
  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  
  // Contact forms
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'NORMAL',
    channel: ChannelType.WEB_FORM
  })
  
  // Analytics
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetrics>({
    totalMessages: 0,
    activeConversations: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0
  })
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Initialize WebSocket connection
  useEffect(() => {
    initializeWebSocket()
    return () => {
      // Cleanup
    }
  }, [])

  const initializeWebSocket = useCallback(() => {
    // Simulate WebSocket connection
    setTimeout(() => {
      setIsConnected(prev => ({ ...prev, [ChannelType.CHAT]: true }))
    }, 1000)
  }, [])

  // Send message through WebSocket
  const sendMessage = useCallback((content: string, messageType: MessageType = MessageType.TEXT) => {
    if (!activeChatSession || !content.trim()) return

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId: activeChatSession.id,
      content,
      messageType,
      senderType: MessageSenderType.CUSTOMER,
      senderName: customerName,
      timestamp: new Date(),
      metadata: {
        channel: selectedChannel,
        voiceMessage: messageType === MessageType.AUDIO
      }
    }

    // Add to local state
    setActiveChatSession(prev => prev ? {
      ...prev,
      messageHistory: [...prev.messageHistory, message]
    } : null)

    // Simulate WebSocket send
    console.log('Sending message:', message)
  }, [activeChatSession, customerName, selectedChannel])

  // Handle form submission
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Create contact form submission
    const submission = {
      ...contactForm,
      timestamp: new Date(),
      id: `contact_${Date.now()}`
    }
    
    console.log('Contact form submitted:', submission)
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      priority: 'NORMAL',
      channel: ChannelType.WEB_FORM
    })
    
    // Show success message
    alert('Your message has been sent successfully! We will get back to you soon.')
  }, [contactForm])

  // Voice recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        setIsRecording(false)
        setRecordingTime(0)
        
        // Convert to message and send
        sendMessage('[Voice Message]', MessageType.AUDIO)
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Store timer reference for cleanup
      ;(mediaRecorder as any).timer = timer
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [sendMessage])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      clearInterval((mediaRecorderRef.current as any).timer)
    }
  }, [])

  // Video consultation request
  const requestVideoConsultation = useCallback((doctorId: string, serviceId: string) => {
    const consultationRequest = {
      id: `consultation_${Date.now()}`,
      doctorId,
      serviceId,
      patientId: customerId,
      timestamp: new Date(),
      platform: 'ZOOM',
      priority: 'URGENT'
    }
    
    console.log('Video consultation requested:', consultationRequest)
    alert('Video consultation request submitted. You will receive a meeting link shortly.')
  }, [customerId])

  // Channel-specific message generators
  const generateChannelMessage = useCallback((channel: ChannelType, content: string) => {
    const templates = {
      [ChannelType.EMAIL]: {
        subject: `Inquiry from ${customerName}`,
        content: `Dear My Family Clinic,\n\n${content}\n\nBest regards,\n${customerName}`
      },
      [ChannelType.SMS]: content.substring(0, 160), // SMS character limit
      [ChannelType.WHATSAPP]: `Hello! ${content}`,
      [ChannelType.FACEBOOK]: `@MyFamilyClinic ${content}`,
      [ChannelType.TWITTER]: `@MyFamilyClinic ${content}`,
      [ChannelType.CHAT]: content
    }
    
    return templates[channel] || content
  }, [customerName])

  // Get channel icon
  const getChannelIcon = useCallback((channel: ChannelType) => {
    const iconMap = {
      [ChannelType.CHAT]: MessageCircle,
      [ChannelType.PHONE]: Phone,
      [ChannelType.EMAIL]: Mail,
      [ChannelType.WHATSAPP]: Smartphone,
      [ChannelType.SMS]: MessageSquare,
      [ChannelType.VIDEO_CALL]: VideoIcon,
      [ChannelType.VOICE_MESSAGE]: Mic,
      [ChannelType.FACEBOOK]: Facebook,
      [ChannelType.TWITTER]: Twitter,
      [ChannelType.INSTAGRAM]: Instagram,
      [ChannelType.LINKEDIN]: Users,
      [ChannelType.TELEGRAM]: MessageCircle,
      [ChannelType.WEB_FORM]: MessageSquare,
      [ChannelType.SOCIAL_MEDIA]: TrendingUp,
      [ChannelType.MOBILE_APP]: Smartphone,
      [ChannelType.PORTAL]: MessageCircle,
      [ChannelType.API]: Settings
    }
    
    const Icon = iconMap[channel] || MessageSquare
    return <Icon className="w-4 h-4" />
  }, [])

  // Render chat interface
  const renderChatInterface = () => (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">Live Chat</h3>
          {activeChatSession && (
            <Badge variant={activeChatSession.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {activeChatSession.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {activeChatSession?.messageHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderType === MessageSenderType.CUSTOMER ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderType === MessageSenderType.CUSTOMER
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.senderName}
                </div>
                <div className="flex items-center space-x-2">
                  {message.messageType === MessageType.AUDIO && (
                    <Mic className="w-4 h-4" />
                  )}
                  <span>{message.content}</span>
                </div>
                <div className="text-xs mt-1 opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(chatMessage)
                setChatMessage('')
              }
            }}
            className="flex-1"
          />
          {voiceEnabled && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={() => {
              sendMessage(chatMessage)
              setChatMessage('')
            }}
            disabled={!chatMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isRecording && (
          <div className="mt-2 text-sm text-red-500 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </div>
  )

  // Render contact form
  const renderContactForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Contact Us</span>
        </CardTitle>
        <CardDescription>
          Get in touch with us through any of our communication channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Preferred Channel</Label>
              <Select 
                value={contactForm.channel} 
                onValueChange={(value) => setContactForm(prev => ({ ...prev, channel: value as ChannelType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ChannelType).map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(channel)}
                        <span>{channel.replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={contactForm.subject}
              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={contactForm.priority} 
              onValueChange={(value) => setContactForm(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  // Render social media monitoring
  const renderSocialMediaMonitoring = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Social Media Monitoring</span>
          </CardTitle>
          <CardDescription>
            Monitor mentions and respond across social platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { platform: 'Facebook', mentions: 12, sentiment: 'positive', status: 'active' },
              { platform: 'Twitter', mentions: 8, sentiment: 'neutral', status: 'active' },
              { platform: 'Instagram', mentions: 15, sentiment: 'positive', status: 'active' }
            ].map((social) => (
              <Card key={social.platform} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {social.platform === 'Facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                    {social.platform === 'Twitter' && <Twitter className="w-5 h-5 text-sky-500" />}
                    {social.platform === 'Instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                    <span className="font-medium">{social.platform}</span>
                  </div>
                  <Badge variant={social.status === 'active' ? 'default' : 'secondary'}>
                    {social.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Mentions</span>
                    <span className="font-medium">{social.mentions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sentiment</span>
                    <Badge 
                      variant={social.sentiment === 'positive' ? 'default' : 
                               social.sentiment === 'negative' ? 'destructive' : 'secondary'}
                    >
                      {social.sentiment}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render video consultation
  const renderVideoConsultation = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <VideoIcon className="w-5 h-5" />
          <span>Video Consultation</span>
        </CardTitle>
        <CardDescription>
          Request a video consultation with our medical professionals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Video consultations are available for non-emergency medical issues. 
              For emergencies, please call 995 immediately.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { doctor: 'Dr. Sarah Lim', specialty: 'General Practice', available: true },
              { doctor: 'Dr. James Wong', specialty: 'Cardiology', available: true },
              { doctor: 'Dr. Mary Tan', specialty: 'Pediatrics', available: false },
              { doctor: 'Dr. David Koh', specialty: 'Dermatology', available: true }
            ].map((doctor) => (
              <Card key={doctor.doctor} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{doctor.doctor}</div>
                    <div className="text-sm text-gray-500">{doctor.specialty}</div>
                  </div>
                  <Badge variant={doctor.available ? 'default' : 'secondary'}>
                    {doctor.available ? 'Available' : 'Busy'}
                  </Badge>
                </div>
                <Button 
                  className="w-full" 
                  disabled={!doctor.available}
                  onClick={() => requestVideoConsultation(doctor.doctor, 'general')}
                >
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Start Video Call
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Render channel status
  const renderChannelStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle>Channel Status</CardTitle>
        <CardDescription>Real-time status of all communication channels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(isConnected).map(([channel, connected]) => (
            <div key={channel} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getChannelIcon(channel as ChannelType)}
                <span className="capitalize">{channel.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Channel Contact System</h1>
          <p className="text-gray-500 mt-1">
            Unified communication platform for My Family Clinic
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="contact">Contact Form</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="video">Video Call</TabsTrigger>
          <TabsTrigger value="status">Channel Status</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelMetrics.activeConversations}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelMetrics.averageResponseTime}s</div>
                <p className="text-xs text-muted-foreground">
                  -10% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelMetrics.customerSatisfaction}%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelMetrics.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  +12% this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderContactForm()}
            {renderChannelStatus()}
          </div>
        </TabsContent>

        <TabsContent value="chat">
          {renderChatInterface()}
        </TabsContent>

        <TabsContent value="contact">
          {renderContactForm()}
        </TabsContent>

        <TabsContent value="social">
          {renderSocialMediaMonitoring()}
        </TabsContent>

        <TabsContent value="video">
          {renderVideoConsultation()}
        </TabsContent>

        <TabsContent value="status">
          {renderChannelStatus()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Supporting interfaces
interface ChatSession {
  id: string
  customerName: string
  status: ChatSessionStatus
  messageHistory: ChatMessage[]
  createdAt: Date
  lastActivity: Date
}

interface ChatMessage {
  id: string
  sessionId: string
  content: string
  messageType: MessageType
  senderType: MessageSenderType
  senderName: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface ChannelMetrics {
  totalMessages: number
  activeConversations: number
  averageResponseTime: number
  customerSatisfaction: number
}
