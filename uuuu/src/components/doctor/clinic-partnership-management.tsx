import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import {
  Handshake,
  Star,
  TrendingUp,
  Users,
  Building,
  Award,
  Target,
  ArrowRight,
  Plus,
  Settings,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Globe,
  Network,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Crown,
  Heart,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  Search,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ClinicPartnershipProps {
  clinicId?: string
  className?: string
}

interface Partnership {
  id: string
  clinicId: string
  partnerClinicId: string
  clinicName: string
  partnerClinicName: string
  partnershipType: 'preferred' | 'exclusive' | 'cross-referral' | 'collaborative'
  partnershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum'
  status: 'active' | 'pending' | 'suspended' | 'terminated'
  
  // Partnership details
  establishedDate: Date
  lastInteraction: Date
  renewalDate?: Date
  partnershipAgreement?: string
  
  // Metrics
  referralCount: number
  referralSuccessRate: number
  patientSatisfaction: number
  collaborationScore: number
  
  // Services and specialties
  sharedSpecialties: string[]
  collaborativeServices: string[]
  referralNetworkSize: number
  
  // Communication
  primaryContact?: {
    name: string
    email: string
    phone: string
    role: string
  }
  
  // Benefits and privileges
  priorityBooking: boolean
  preferredRates: boolean
  sharedResources: boolean
  jointPrograms: boolean
  
  // Performance tracking
  monthlyReferrals: Array<{
    month: string
    referrals: number
    successful: number
  }>
}

interface CrossReferralNetwork {
  id: string
  networkName: string
  networkType: 'specialty' | 'geographic' | 'emergency' | 'research'
  participatingClinics: Array<{
    clinicId: string
    clinicName: string
    role: 'hub' | 'member' | 'specialist'
    contribution: string
  }>
  
  // Network metrics
  totalReferrals: number
  averageResponseTime: number
  successRate: number
  patientSatisfaction: number
  
  // Coordination
  sharedProtocols: string[]
  emergencyProtocols: string[]
  qualityStandards: string[]
  
  // Communication channels
  communicationChannels: Array<{
    type: 'email' | 'phone' | 'portal' | 'emergency'
    description: string
    responseTime: string
  }>
}

export function ClinicPartnershipManagement({ 
  clinicId, 
  className 
}: ClinicPartnershipProps) {
  const [partnerships, setPartnerships] = React.useState<Partnership[]>([])
  const [networks, setNetworks] = React.useState<CrossReferralNetwork[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedPartnership, setSelectedPartnership] = React.useState<Partnership | null>(null)
  const [activeTab, setActiveTab] = React.useState("overview")
  const [filterStatus, setFilterStatus] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Mock data - in real app this would come from API
  React.useEffect(() => {
    const fetchPartnershipData = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const mockPartnerships: Partnership[] = [
        {
          id: "part1",
          clinicId: "clinic1",
          partnerClinicId: "partner1",
          clinicName: "Central Family Clinic",
          partnerClinicName: "Specialist Medical Center",
          partnershipType: "exclusive",
          partnershipLevel: "platinum",
          status: "active",
          establishedDate: new Date("2023-06-15"),
          lastInteraction: new Date("2024-10-28"),
          renewalDate: new Date("2025-06-15"),
          referralCount: 156,
          referralSuccessRate: 92.3,
          patientSatisfaction: 4.8,
          collaborationScore: 96,
          sharedSpecialties: ["Cardiology", "Endocrinology", "Dermatology"],
          collaborativeServices: ["Shared Patient Care", "Joint Consultations", "Emergency Referrals"],
          referralNetworkSize: 8,
          primaryContact: {
            name: "Dr. Michael Wong",
            email: "michael.wong@specialistmc.sg",
            phone: "+65 6789 1234",
            role: "Partnership Coordinator"
          },
          priorityBooking: true,
          preferredRates: true,
          sharedResources: true,
          jointPrograms: true,
          monthlyReferrals: [
            { month: "Jan", referrals: 12, successful: 11 },
            { month: "Feb", referrals: 15, successful: 14 },
            { month: "Mar", referrals: 18, successful: 16 },
            { month: "Apr", referrals: 14, successful: 13 },
            { month: "May", referrals: 16, successful: 15 },
            { month: "Jun", referrals: 19, successful: 18 }
          ]
        },
        {
          id: "part2",
          clinicId: "clinic1",
          partnerClinicId: "partner2",
          clinicName: "Central Family Clinic",
          partnerClinicName: "Westside Pediatrics",
          partnershipType: "preferred",
          partnershipLevel: "gold",
          status: "active",
          establishedDate: new Date("2023-09-20"),
          lastInteraction: new Date("2024-10-25"),
          referralCount: 89,
          referralSuccessRate: 88.2,
          patientSatisfaction: 4.6,
          collaborationScore: 87,
          sharedSpecialties: ["Pediatrics", "Family Medicine"],
          collaborativeServices: ["Pediatric Referrals", "Family Health Programs"],
          referralNetworkSize: 5,
          primaryContact: {
            name: "Dr. Lisa Tan",
            email: "lisa.tan@westsidepd.sg",
            phone: "+65 6123 9876",
            role: "Referral Manager"
          },
          priorityBooking: true,
          preferredRates: false,
          sharedResources: true,
          jointPrograms: false,
          monthlyReferrals: [
            { month: "Jan", referrals: 8, successful: 7 },
            { month: "Feb", referrals: 6, successful: 6 },
            { month: "Mar", referrals: 9, successful: 8 },
            { month: "Apr", referrals: 11, successful: 10 },
            { month: "May", referrals: 7, successful: 6 },
            { month: "Jun", referrals: 10, successful: 9 }
          ]
        },
        {
          id: "part3",
          clinicId: "clinic1",
          partnerClinicId: "partner3",
          clinicName: "Central Family Clinic",
          partnerClinicName: "Emergency Care Network",
          partnershipType: "cross-referral",
          partnershipLevel: "silver",
          status: "pending",
          establishedDate: new Date("2024-10-01"),
          lastInteraction: new Date("2024-10-30"),
          referralCount: 0,
          referralSuccessRate: 0,
          patientSatisfaction: 0,
          collaborationScore: 0,
          sharedSpecialties: ["Emergency Medicine", "Critical Care"],
          collaborativeServices: ["Emergency Referrals", "24/7 Support"],
          referralNetworkSize: 12,
          priorityBooking: false,
          preferredRates: false,
          sharedResources: false,
          jointPrograms: false,
          monthlyReferrals: [
            { month: "Jan", referrals: 0, successful: 0 },
            { month: "Feb", referrals: 0, successful: 0 },
            { month: "Mar", referrals: 0, successful: 0 },
            { month: "Apr", referrals: 0, successful: 0 },
            { month: "May", referrals: 0, successful: 0 },
            { month: "Jun", referrals: 0, successful: 0 }
          ]
        }
      ]
      
      const mockNetworks: CrossReferralNetwork[] = [
        {
          id: "net1",
          networkName: "Central Singapore Medical Network",
          networkType: "geographic",
          participatingClinics: [
            {
              clinicId: "clinic1",
              clinicName: "Central Family Clinic",
              role: "hub",
              contribution: "Family Medicine Hub"
            },
            {
              clinicId: "partner1",
              clinicName: "Specialist Medical Center",
              role: "specialist",
              contribution: "Specialist Services"
            },
            {
              clinicId: "partner2",
              clinicName: "Westside Pediatrics",
              role: "member",
              contribution: "Pediatric Services"
            }
          ],
          totalReferrals: 245,
          averageResponseTime: 2.4,
          successRate: 91.2,
          patientSatisfaction: 4.7,
          sharedProtocols: [
            "Patient Handoff Protocol",
            "Information Sharing Standards",
            "Quality Assurance Guidelines"
          ],
          emergencyProtocols: [
            "Emergency Referral Protocol",
            "Critical Patient Transfer",
            "After-Hours Coverage"
          ],
          qualityStandards: [
            "Patient Safety Standards",
            "Communication Protocols",
            "Follow-up Procedures"
          ],
          communicationChannels: [
            {
              type: "portal",
              description: "Secure referral portal",
              responseTime: "< 2 hours"
            },
            {
              type: "phone",
              description: "Direct phone line",
              responseTime: "< 30 minutes"
            },
            {
              type: "emergency",
              description: "Emergency hotline",
              responseTime: "Immediate"
            }
          ]
        }
      ]
      
      setPartnerships(mockPartnerships)
      setNetworks(mockNetworks)
      setLoading(false)
    }

    fetchPartnershipData()
  }, [clinicId])

  const filteredPartnerships = React.useMemo(() => {
    return partnerships.filter(partnership => {
      const matchesSearch = partnership.partnerClinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           partnership.partnershipType.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === "all" || partnership.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [partnerships, searchQuery, filterStatus])

  const getPartnershipLevelIcon = (level: string) => {
    switch (level) {
      case 'platinum':
        return <Crown className="h-4 w-4 text-purple-600" />
      case 'gold':
        return <Award className="h-4 w-4 text-yellow-600" />
      case 'silver':
        return <Award className="h-4 w-4 text-gray-600" />
      case 'bronze':
        return <Award className="h-4 w-4 text-orange-600" />
      default:
        return <Award className="h-4 w-4 text-blue-600" />
    }
  }

  const getPartnershipTypeColor = (type: string) => {
    switch (type) {
      case 'exclusive':
        return 'default'
      case 'preferred':
        return 'secondary'
      case 'cross-referral':
        return 'outline'
      case 'collaborative':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'suspended':
        return 'text-orange-600'
      case 'terminated':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const renderPartnershipCard = (partnership: Partnership) => (
    <Card key={partnership.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-2">
            <CardTitle className="text-xl leading-tight">
              <div className="flex items-center gap-2">
                {partnership.partnerClinicName}
                {getPartnershipLevelIcon(partnership.partnershipLevel)}
              </div>
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant={getPartnershipTypeColor(partnership.partnershipType)}>
                {partnership.partnershipType.replace('-', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {partnership.partnershipLevel.toUpperCase()} PARTNER
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={getStatusColor(partnership.status)}>
              {partnership.status.toUpperCase()}
            </Badge>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Collaboration Score</div>
              <div className="font-bold text-lg">{partnership.collaborationScore}%</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Total Referrals</div>
            <div className="font-semibold">{partnership.referralCount}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Success Rate</div>
            <div className="font-semibold">{partnership.referralSuccessRate}%</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Patient Satisfaction</div>
            <div className="font-semibold flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {partnership.patientSatisfaction}/5.0
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Network Size</div>
            <div className="font-semibold">{partnership.referralNetworkSize} clinics</div>
          </div>
        </div>

        <Separator />

        {/* Partnership Benefits */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Handshake className="h-4 w-4 text-primary" />
            Partnership Benefits
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              {partnership.priorityBooking ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">Priority Booking</span>
            </div>
            
            <div className="flex items-center gap-2">
              {partnership.preferredRates ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">Preferred Rates</span>
            </div>
            
            <div className="flex items-center gap-2">
              {partnership.sharedResources ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">Shared Resources</span>
            </div>
            
            <div className="flex items-center gap-2">
              {partnership.jointPrograms ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">Joint Programs</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Shared Specialties */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Shared Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {partnership.sharedSpecialties.map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        {partnership.primaryContact && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Primary Contact</h4>
              <div className="space-y-1">
                <div className="text-sm font-medium">{partnership.primaryContact.name}</div>
                <div className="text-xs text-muted-foreground">{partnership.primaryContact.role}</div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {partnership.primaryContact.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {partnership.primaryContact.phone}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button size="sm" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedPartnership(partnership)}>
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderNetworkCard = (network: CrossReferralNetwork) => (
    <Card key={network.id}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          {network.networkName}
          <Badge variant="outline" className="ml-auto">
            {network.networkType.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{network.totalReferrals}</div>
            <div className="text-xs text-muted-foreground">Total Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{network.successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{network.averageResponseTime}h</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{network.patientSatisfaction}</div>
            <div className="text-xs text-muted-foreground">Patient Rating</div>
          </div>
        </div>

        <Separator />

        {/* Participating Clinics */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Building className="h-4 w-4" />
            Participating Clinics
          </h4>
          
          {network.participatingClinics.map((clinic, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{clinic.clinicName}</div>
                <div className="text-sm text-muted-foreground">{clinic.contribution}</div>
              </div>
              <Badge variant={
                clinic.role === 'hub' ? 'default' :
                clinic.role === 'specialist' ? 'secondary' : 'outline'
              }>
                {clinic.role.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        <Separator />

        {/* Communication Channels */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication Channels
          </h4>
          
          <div className="space-y-2">
            {network.communicationChannels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="text-sm font-medium">{channel.description}</div>
                  <div className="text-xs text-muted-foreground">{channel.type}</div>
                </div>
                <Badge variant="outline">{channel.responseTime}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            View Network Activity
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Network Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Partnership Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5" />
          Clinic Partnership & Referral Management
          <Badge variant="outline" className="ml-auto">
            {partnerships.length} partnerships
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Partnerships</TabsTrigger>
            <TabsTrigger value="networks">Referral Networks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <Handshake className="h-4 w-4" />
              <AlertDescription>
                Manage clinic partnerships, preferred doctor relationships, and referral networks. 
                Build collaborative healthcare networks for better patient care.
              </AlertDescription>
            </Alert>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partnerships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Partnership
              </Button>
            </div>

            {/* Partnership Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPartnerships.map(renderPartnershipCard)}
            </div>

            {filteredPartnerships.length === 0 && (
              <div className="text-center py-8">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No partnerships found matching your criteria
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Partnership
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="networks" className="space-y-4">
            <Alert>
              <Network className="h-4 w-4" />
              <AlertDescription>
                Cross-referral networks and collaborative healthcare partnerships 
                that enhance patient care through coordinated medical services.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-6">
              {networks.map(renderNetworkCard)}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertDescription>
                Partnership performance analytics and referral network metrics 
                to optimize collaborative healthcare delivery.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Partnership Performance Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Partnership Performance</h3>
                  <div className="space-y-3">
                    {partnerships
                      .filter(p => p.status === 'active')
                      .sort((a, b) => b.collaborationScore - a.collaborationScore)
                      .map(partnership => (
                        <div key={partnership.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{partnership.partnerClinicName}</span>
                            <span>{partnership.collaborationScore}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${partnership.collaborationScore}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Referral Trends */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Referral Trends</h3>
                  <div className="space-y-3">
                    {partnerships
                      .filter(p => p.status === 'active')
                      .slice(0, 5)
                      .map(partnership => (
                        <div key={partnership.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{partnership.partnerClinicName}</span>
                            <span>{partnership.referralCount} referrals</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Success Rate: {partnership.referralSuccessRate}%
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Network Overview */}
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Network Overview</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{networks.length}</div>
                      <div className="text-sm text-muted-foreground">Active Networks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {networks.reduce((total, network) => total + network.participatingClinics.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Participating Clinics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {networks.reduce((total, network) => total + network.totalReferrals, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Network Referrals</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Partnership Details Dialog */}
      <Dialog open={!!selectedPartnership} onOpenChange={() => setSelectedPartnership(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Partnership</DialogTitle>
            <DialogDescription>
              {selectedPartnership?.partnerClinicName} - {selectedPartnership?.partnershipType} partnership
            </DialogDescription>
          </DialogHeader>
          
          {selectedPartnership && (
            <div className="space-y-6">
              {/* Partnership Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Partnership Level</div>
                  <div className="flex items-center gap-2">
                    {getPartnershipLevelIcon(selectedPartnership.partnershipLevel)}
                    <span className="font-semibold">{selectedPartnership.partnershipLevel.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant="outline" className={getStatusColor(selectedPartnership.status)}>
                    {selectedPartnership.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h4 className="font-semibold">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm">Partnership renewal completed</div>
                      <div className="text-xs text-muted-foreground">2 days ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 border rounded">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm">Patient referral sent - Cardiology consultation</div>
                      <div className="text-xs text-muted-foreground">1 week ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Review
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Partner
                </Button>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Terminate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}