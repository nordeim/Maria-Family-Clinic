import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { 
  Award, 
  Star,
  TrendingUp,
  Users,
  Shield,
  CheckCircle,
  Trophy,
  Target,
  Zap,
  BookOpen,
  GraduationCap,
  Building,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ArrowUp,
  Award as AwardIcon,
  Heart,
  Brain,
  Stethoscope
} from 'lucide-react';
import { cn } from '~/lib/utils';

export interface ServiceExpertiseIndicatorsProps {
  serviceId: string;
  clinics: Array<{
    id: string;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
    isVerified: boolean;
    accreditationStatus: string;
    specializationAreas: string[];
    expertise: {
      level: 'BASIC' | 'EXPERIENCED' | 'EXPERT' | 'SPECIALIZED' | 'ADVANCED';
      yearsOfExperience: number;
      caseCount: number;
      successRate?: number;
      certifications: string[];
      peerRecognition: string[];
      equipment: string[];
      certifications: Array<{
        name: string;
        issuer: string;
        year: number;
        validUntil?: Date;
      }>;
      doctors: Array<{
        id: string;
        name: string;
        specialization: string;
        experience: number;
        credentials: string[];
        rating?: number;
        reviewCount?: number;
      }>;
    };
    achievements: {
      awards: Array<{
        name: string;
        year: number;
        issuer: string;
        description: string;
      }>;
      accreditations: Array<{
        name: string;
        status: 'active' | 'pending' | 'expired';
        validUntil?: Date;
        issuingBody: string;
      }>;
      publications: Array<{
        title: string;
        journal: string;
        year: number;
        type: 'research' | 'case-study' | 'review';
      }>;
      partnerships: Array<{
        name: string;
        type: 'academic' | 'hospital' | 'research' | 'industry';
        description: string;
      }>;
    };
  }>;
  userLocation?: { latitude: number; longitude: number };
}

export interface ExpertiseScore {
  overall: number; // 0-100
  technical: number;
  experience: number;
  outcomes: number;
  patientSatisfaction: number;
  innovation: number;
}

export function ServiceExpertiseIndicators({
  serviceId,
  clinics,
  userLocation
}: ServiceExpertiseIndicatorsProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');

  // Calculate expertise scores for each clinic
  const calculateExpertiseScore = (clinic: any): ExpertiseScore => {
    const { expertise, achievements } = clinic;
    
    // Technical score based on certifications and equipment
    const technical = Math.min(
      (expertise.certifications.length * 10) + 
      (expertise.equipment.length * 5) + 
      (expertise.level === 'ADVANCED' ? 20 : 
       expertise.level === 'SPECIALIZED' ? 15 :
       expertise.level === 'EXPERT' ? 10 : 
       expertise.level === 'EXPERIENCED' ? 5 : 0),
      100
    );

    // Experience score based on years and case count
    const experience = Math.min(
      Math.min(expertise.yearsOfExperience / 2, 40) +
      Math.min(expertise.caseCount / 100, 40) +
      (expertise.doctors.length > 0 ? 20 : 0),
      100
    );

    // Outcomes based on success rate and achievements
    const outcomes = Math.min(
      (expertise.successRate || 80) +
      (achievements.awards.length * 5) +
      (achievements.publications.length * 3),
      100
    );

    // Patient satisfaction based on ratings and reviews
    const patientSatisfaction = Math.min(
      (clinic.rating || 0) * 20 +
      Math.log(clinic.reviewCount + 1) * 2,
      100
    );

    // Innovation based on publications and partnerships
    const innovation = Math.min(
      (achievements.publications.length * 8) +
      (achievements.partnerships.length * 6),
      100
    );

    return {
      overall: Math.round((technical + experience + outcomes + patientSatisfaction + innovation) / 5),
      technical: Math.round(technical),
      experience: Math.round(experience),
      outcomes: Math.round(outcomes),
      patientSatisfaction: Math.round(patientSatisfaction),
      innovation: Math.round(innovation)
    };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SPECIALIZED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXPERT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPERIENCED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ADVANCED':
        return <Trophy className="h-4 w-4" />;
      case 'SPECIALIZED':
        return <Target className="h-4 w-4" />;
      case 'EXPERT':
        return <Award className="h-4 w-4" />;
      case 'EXPERIENCED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const sortedClinics = clinics
    .map(clinic => ({
      ...clinic,
      expertiseScore: calculateExpertiseScore(clinic)
    }))
    .sort((a, b) => b.expertiseScore.overall - a.expertiseScore.overall);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(sortedClinics.reduce((sum, clinic) => sum + clinic.expertiseScore.overall, 0) / sortedClinics.length)}
                </div>
                <div className="text-sm opacity-90">Average Expertise Score</div>
              </div>
              <AwardIcon className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {sortedClinics.filter(c => c.expertise.level === 'ADVANCED' || c.expertise.level === 'SPECIALIZED').length}
                </div>
                <div className="text-sm opacity-90">Specialized Clinics</div>
              </div>
              <Target className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {sortedClinics.reduce((sum, clinic) => sum + clinic.expertise.caseCount, 0).toLocaleString()}
                </div>
                <div className="text-sm opacity-90">Total Cases Treated</div>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinic Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Expertise Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedClinics.slice(0, 10).map((clinic, index) => (
              <div
                key={clinic.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer",
                  selectedClinicId === clinic.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                )}
                onClick={() => setSelectedClinicId(clinic.id)}
              >
                {/* Ranking */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    index === 2 ? "bg-orange-600 text-white" :
                    "bg-gray-200 text-gray-700"
                  )}>
                    {index + 1}
                  </div>
                </div>

                {/* Clinic Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{clinic.name}</h3>
                    <Badge className={getLevelColor(clinic.expertise.level)}>
                      {getLevelIcon(clinic.expertise.level)}
                      <span className="ml-1">{clinic.expertise.level}</span>
                    </Badge>
                    {clinic.isVerified && (
                      <Badge variant="outline" className="text-green-700">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>{clinic.specializationAreas.slice(0, 2).join(', ')}</div>
                    <div>•</div>
                    <div>{clinic.expertise.yearsOfExperience} years exp.</div>
                    <div>•</div>
                    <div>{clinic.expertise.caseCount.toLocaleString()} cases</div>
                    {clinic.rating && (
                      <>
                        <div>•</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{clinic.rating.toFixed(1)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {clinic.expertiseScore.overall}
                  </div>
                  <div className="text-xs text-gray-500">Expertise Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailed = () => {
    const selectedClinic = sortedClinics.find(c => c.id === selectedClinicId) || sortedClinics[0];
    if (!selectedClinic) return null;

    return (
      <div className="space-y-6">
        {/* Clinic Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">{selectedClinic.name}</h2>
                  <Badge className={getLevelColor(selectedClinic.expertise.level)}>
                    {getLevelIcon(selectedClinic.expertise.level)}
                    <span className="ml-1">{selectedClinic.expertise.level}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedClinic.address}</span>
                  {selectedClinic.phone && (
                    <>
                      <span>•</span>
                      <Phone className="h-4 w-4" />
                      <span>{selectedClinic.phone}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedClinic.rating?.toFixed(1) || 'N/A'}</span>
                    <span>({selectedClinic.reviewCount || 0} reviews)</span>
                  </div>
                  <div>•</div>
                  <div>{selectedClinic.experienceYears} years experience</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {selectedClinic.expertiseScore.overall}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expertise Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Technical Expertise</span>
                    <span className="text-sm">{selectedClinic.expertiseScore.technical}/100</span>
                  </div>
                  <Progress value={selectedClinic.expertiseScore.technical} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Experience</span>
                    <span className="text-sm">{selectedClinic.expertiseScore.experience}/100</span>
                  </div>
                  <Progress value={selectedClinic.expertiseScore.experience} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Patient Satisfaction</span>
                    <span className="text-sm">{selectedClinic.expertiseScore.patientSatisfaction}/100</span>
                  </div>
                  <Progress value={selectedClinic.expertiseScore.patientSatisfaction} className="h-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Treatment Outcomes</span>
                    <span className="text-sm">{selectedClinic.expertiseScore.outcomes}/100</span>
                  </div>
                  <Progress value={selectedClinic.expertiseScore.outcomes} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Innovation</span>
                    <span className="text-sm">{selectedClinic.expertiseScore.innovation}/100</span>
                  </div>
                  <Progress value={selectedClinic.expertiseScore.innovation} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certifications & Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certifications & Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Professional Certifications</h4>
                <div className="space-y-1">
                  {selectedClinic.expertise.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{cert.name}</span>
                      <span className="text-gray-500">({cert.year})</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Medical Equipment</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedClinic.expertise.equipment.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Expertise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Medical Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedClinic.expertise.doctors.slice(0, 3).map((doctor, index) => (
                <div key={doctor.id} className="border-b pb-2 last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Dr. {doctor.name}</span>
                    <Badge variant="outline" className="text-xs">{doctor.experience}y exp.</Badge>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{doctor.specialization}</div>
                  <div className="flex flex-wrap gap-1">
                    {doctor.credentials.slice(0, 2).map((cred, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cred}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Awards & Recognition */}
        {selectedClinic.achievements.awards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Awards & Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedClinic.achievements.awards.map((award, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium text-sm">{award.name}</div>
                      <div className="text-xs text-gray-600">
                        {award.issuer} • {award.year}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderComparison = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expertise Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedClinics.slice(0, 5).map(clinic => (
              <div key={clinic.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{clinic.name}</h3>
                  <Badge className={getLevelColor(clinic.expertise.level)}>
                    {clinic.expertise.level}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{clinic.expertiseScore.technical}</div>
                    <div className="text-xs text-gray-600">Technical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{clinic.expertiseScore.experience}</div>
                    <div className="text-xs text-gray-600">Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{clinic.expertiseScore.outcomes}</div>
                    <div className="text-xs text-gray-600">Outcomes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{clinic.expertiseScore.patientSatisfaction}</div>
                    <div className="text-xs text-gray-600">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{clinic.expertiseScore.innovation}</div>
                    <div className="text-xs text-gray-600">Innovation</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6" />
              Service Expertise Indicators
            </CardTitle>
            <Badge variant="outline" className="text-blue-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              Live Rankings
            </Badge>
          </div>
          <p className="text-gray-600">
            Comprehensive expertise analysis and ranking of healthcare providers for this service.
          </p>
        </CardHeader>
      </Card>

      {/* View Selector */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="detailed" className="mt-0">
            {renderDetailed()}
          </TabsContent>

          <TabsContent value="comparison" className="mt-0">
            {renderComparison()}
          </TabsContent>
        </div>
      </Tabs>

      {/* Information */}
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          <strong>Expertise Scoring:</strong> Our comprehensive scoring system evaluates technical skills, 
          experience, treatment outcomes, patient satisfaction, and innovative practices to provide 
          you with the most qualified healthcare providers.
        </AlertDescription>
      </Alert>
    </div>
  );
}