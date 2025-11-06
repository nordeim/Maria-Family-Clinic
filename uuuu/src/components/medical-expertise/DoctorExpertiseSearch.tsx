import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Stethoscope, 
  Award, 
  Globe, 
  Users, 
  MapPin, 
  Clock, 
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Brain,
  Heart,
  Activity,
  Shield,
  Phone,
  Download
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialties: string[];
  expertiseLevel: string;
  successRate: number;
  patientCount: number;
  yearsExperience: number;
  languages: string[];
  rating: number;
  internationalExperience: boolean;
  culturalCompetency: boolean;
  medicalTourismProfile?: any;
  expertiseProfile?: any;
  clinicAffiliations: any[];
}

interface DoctorExpertiseSearchProps {
  doctors?: Doctor[];
  onDoctorSelect?: (doctor: Doctor) => void;
  onSearchResults?: (results: Doctor[]) => void;
}

const DoctorExpertiseSearch: React.FC<DoctorExpertiseSearchProps> = ({
  doctors = [],
  onDoctorSelect,
  onSearchResults
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [expertiseLevel, setExpertiseLevel] = useState<string>("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");
  const [internationalExperience, setInternationalExperience] = useState<boolean | undefined>();
  const [culturalCompetency, setCulturalCompetency] = useState<boolean | undefined>();
  const [maxResults, setMaxResults] = useState(10);

  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for demonstration
  const mockDoctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      specialties: ["Cardiology", "Interventional Cardiology"],
      expertiseLevel: "EXPERT",
      successRate: 96,
      patientCount: 2500,
      yearsExperience: 15,
      languages: ["English", "Mandarin", "Malay"],
      rating: 4.9,
      internationalExperience: true,
      culturalCompetency: true,
      medicalTourismProfile: {
        acceptsInternationalInsurance: true,
        internationalPatientsServed: 200,
        patientSatisfactionScore: 4.8
      },
      clinicAffiliations: []
    },
    {
      id: "2", 
      name: "Dr. Ahmed Rahman",
      specialties: ["Dermatology", "Skin Cancer"],
      expertiseLevel: "ADVANCED",
      successRate: 92,
      patientCount: 1800,
      yearsExperience: 12,
      languages: ["English", "Arabic", "Malay"],
      rating: 4.7,
      internationalExperience: true,
      culturalCompetency: true,
      medicalTourismProfile: {
        acceptsInternationalInsurance: true,
        internationalPatientsServed: 150,
        patientSatisfactionScore: 4.6
      },
      clinicAffiliations: []
    },
    {
      id: "3",
      name: "Dr. Maria Santos",
      specialties: ["Orthopedics", "Sports Medicine"],
      expertiseLevel: "EXPERT", 
      successRate: 94,
      patientCount: 2200,
      yearsExperience: 18,
      languages: ["English", "Spanish", "Tagalog"],
      rating: 4.8,
      internationalExperience: false,
      culturalCompetency: true,
      clinicAffiliations: []
    }
  ];

  const mockSpecialties = [
    "General Practice", "Cardiology", "Dermatology", "Orthopedics", "Pediatrics", 
    "Women's Health", "Mental Health", "Neurology", "Ophthalmology", "ENT",
    "Endocrinology", "Gastroenterology", "Psychiatry", "Surgery"
  ];

  const mockConditions = [
    "Diabetes", "Hypertension", "Heart Disease", "Skin Cancer", "Depression",
    "Arthritis", "Asthma", "Migraine", "Obesity", "Anxiety"
  ];

  const mockLanguages = [
    "English", "Mandarin", "Malay", "Tamil", "Cantonese", 
    "Arabic", "Spanish", "French", "German", "Japanese"
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let results = mockDoctors;
    
    // Apply filters
    if (searchQuery) {
      results = results.filter(doctor => 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedSpecialties.length > 0) {
      results = results.filter(doctor =>
        doctor.specialties.some(s => selectedSpecialties.includes(s))
      );
    }
    
    if (expertiseLevel) {
      results = results.filter(doctor => doctor.expertiseLevel === expertiseLevel);
    }
    
    if (internationalExperience !== undefined) {
      results = results.filter(doctor => doctor.internationalExperience === internationalExperience);
    }
    
    if (culturalCompetency !== undefined) {
      results = results.filter(doctor => doctor.culturalCompetency === culturalCompetency);
    }
    
    setSearchResults(results);
    setIsSearching(false);
    
    if (onSearchResults) {
      onSearchResults(results);
    }
  };

  const getExpertiseLevelColor = (level: string) => {
    switch (level) {
      case "EXPERT": return "bg-purple-100 text-purple-800";
      case "ADVANCED": return "bg-blue-100 text-blue-800"; 
      case "INTERMEDIATE": return "bg-green-100 text-green-800";
      case "BASIC": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "Cardiology": <Heart className="w-4 h-4" />,
      "Dermatology": <Shield className="w-4 h-4" />,
      "Orthopedics": <Activity className="w-4 h-4" />,
      "Neurology": <Brain className="w-4 h-4" />,
      "Mental Health": <Users className="w-4 h-4" />,
      "General Practice": <Stethoscope className="w-4 h-4" />
    };
    return iconMap[specialty] || <Stethoscope className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Doctor Expertise Search
          </CardTitle>
          <CardDescription>
            Find specialists based on medical expertise, experience, and international qualifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="matching">Smart Matching</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              {/* Basic Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search by name or specialty</Label>
                  <Input
                    id="search"
                    placeholder="e.g., Dr. Smith, cardiology, skin cancer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Orchard, Tampines, Jurong"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <Select onValueChange={(value) => {
                    if (value && !selectedSpecialties.includes(value)) {
                      setSelectedSpecialties([...selectedSpecialties, value]);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSpecialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedSpecialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-4 w-4 p-0"
                            onClick={() => setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty))}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Expertise Level</Label>
                  <Select value={expertiseLevel} onValueChange={setExpertiseLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any language" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximum Results</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[maxResults]}
                        onValueChange={(value) => setMaxResults(value[0])}
                        max={50}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>5</span>
                        <span>{maxResults}</span>
                        <span>50</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Special Requirements</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="international"
                          checked={internationalExperience === true}
                          onChange={(e) => setInternationalExperience(e.target.checked ? true : undefined)}
                        />
                        <Label htmlFor="international" className="text-sm">
                          International experience
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="cultural"
                          checked={culturalCompetency === true}
                          onChange={(e) => setCulturalCompetency(e.target.checked ? true : undefined)}
                        />
                        <Label htmlFor="cultural" className="text-sm">
                          Cultural competency
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Specialists
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="matching" className="space-y-4">
              <div className="text-center py-8">
                <Target className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Intelligent Doctor Matching</h3>
                <p className="text-gray-600 mb-4">
                  Describe your condition or symptoms, and our AI will match you with the best specialists
                </p>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="condition">Describe your condition</Label>
                    <Input
                      id="condition"
                      placeholder="e.g., chest pain, skin rash, persistent headaches"
                    />
                  </div>
                  <div>
                    <Label htmlFor="symptoms">Symptoms (optional)</Label>
                    <Input
                      id="symptoms"
                      placeholder="e.g., shortness of breath, fatigue, nausea"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine (within weeks)</SelectItem>
                        <SelectItem value="urgent">Urgent (within days)</SelectItem>
                        <SelectItem value="emergency">Emergency (immediate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Get Smart Recommendations
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Verification Status</h3>
                <p className="text-gray-600 mb-4">
                  Track verification status of doctor credentials and specializations
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-gray-600">Pending Verification</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      <div className="text-2xl font-bold">89</div>
                      <div className="text-sm text-gray-600">Verified Doctors</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-sm text-gray-600">Verification Rate</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Search Results ({searchResults.length} specialists found)
            </h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>

          <div className="grid gap-4">
            {searchResults.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{doctor.name}</h4>
                        <Badge className={getExpertiseLevelColor(doctor.expertiseLevel)}>
                          {doctor.expertiseLevel}
                        </Badge>
                        {doctor.internationalExperience && (
                          <Badge variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            International
                          </Badge>
                        )}
                        {doctor.culturalCompetency && (
                          <Badge variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            Cultural Competency
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {doctor.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                            {getSpecialtyIcon(specialty)}
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Success Rate</div>
                          <div className="font-medium flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                            {doctor.successRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Experience</div>
                          <div className="font-medium flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-blue-500" />
                            {doctor.yearsExperience} years
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Patients Treated</div>
                          <div className="font-medium flex items-center">
                            <Users className="w-4 h-4 mr-1 text-purple-500" />
                            {doctor.patientCount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Rating</div>
                          <div className="font-medium flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                            {doctor.rating}/5.0
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>Languages: {doctor.languages.join(", ")}</span>
                        </div>
                        {doctor.medicalTourismProfile && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span>{doctor.medicalTourismProfile.internationalPatientsServed} international patients</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button onClick={() => onDoctorSelect?.(doctor)}>
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorExpertiseSearch;