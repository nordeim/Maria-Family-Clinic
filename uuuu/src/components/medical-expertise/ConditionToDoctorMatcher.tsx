import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Stethoscope, 
  Target, 
  Brain, 
  Heart,
  Activity,
  Shield,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Phone,
  Mail,
  FileText,
  Star,
  MapPin,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Medal,
  BookOpen,
  HeartHandshake
} from "lucide-react";

interface Condition {
  name: string;
  specialty: string;
  successRate: number;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'SAME_DAY';
  complexity: 'BASIC' | 'MODERATE' | 'COMPLEX' | 'SPECIALIZED';
}

const ConditionToDoctorMatcher: React.FC = () => {
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<Condition['urgency']>('ROUTINE');
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Common conditions with specialty mappings
  const conditionDatabase: Record<string, Condition> = {
    "Chest Pain": {
      name: "Chest Pain",
      specialty: "Cardiology",
      successRate: 92,
      urgency: "URGENT",
      complexity: "COMPLEX"
    },
    "Skin Rash": {
      name: "Skin Rash",
      specialty: "Dermatology", 
      successRate: 88,
      urgency: "ROUTINE",
      complexity: "BASIC"
    },
    "Back Pain": {
      name: "Back Pain",
      specialty: "Orthopedics",
      successRate: 85,
      urgency: "ROUTINE", 
      complexity: "MODERATE"
    },
    "Depression": {
      name: "Depression",
      specialty: "Psychiatry",
      successRate: 75,
      urgency: "ROUTINE",
      complexity: "MODERATE"
    },
    "Shortness of Breath": {
      name: "Shortness of Breath",
      specialty: "Pulmonology",
      successRate: 90,
      urgency: "URGENT",
      complexity: "COMPLEX"
    },
    "Headache": {
      name: "Headache",
      specialty: "Neurology",
      successRate: 80,
      urgency: "ROUTINE",
      complexity: "MODERATE"
    },
    "Abdominal Pain": {
      name: "Abdominal Pain", 
      specialty: "Gastroenterology",
      successRate: 87,
      urgency: "URGENT",
      complexity: "MODERATE"
    },
    "Vision Problems": {
      name: "Vision Problems",
      specialty: "Ophthalmology",
      successRate: 95,
      urgency: "ROUTINE",
      complexity: "BASIC"
    },
    "Hearing Loss": {
      name: "Hearing Loss",
      specialty: "ENT",
      successRate: 88,
      urgency: "ROUTINE", 
      complexity: "MODERATE"
    },
    "Joint Pain": {
      name: "Joint Pain",
      specialty: "Rheumatology",
      successRate: 82,
      urgency: "ROUTINE",
      complexity: "MODERATE"
    }
  };

  const commonSymptoms = [
    "Fatigue", "Fever", "Pain", "Swelling", "Shortness of breath", "Cough",
    "Nausea", "Vomiting", "Diarrhea", "Headache", "Dizziness", "Chest pain",
    "Abdominal pain", "Back pain", "Joint pain", "Skin changes", "Vision changes",
    "Hearing loss", "Memory problems", "Sleep issues", "Anxiety", "Depression"
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const findBestMatches = async () => {
    setIsMatching(true);
    
    // Simulate AI matching process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results with scoring
    const mockResults = [
      {
        doctorId: "1",
        name: "Dr. Sarah Chen",
        specialty: "Cardiology",
        expertiseLevel: "EXPERT",
        successRate: 96,
        patientCount: 2500,
        yearsExperience: 15,
        languages: ["English", "Mandarin", "Malay"],
        rating: 4.9,
        matchScore: 95,
        matchReasons: [
          "Expertise in cardiovascular conditions",
          "15+ years experience in chest pain management", 
          "High success rate (96%)",
          "International experience with complex cases",
          "Available for urgent consultations"
        ],
        estimatedWaitTime: "2-3 days",
        consultationFee: "SGD $180",
        nextAvailable: "Tomorrow 2:00 PM",
        clinicLocation: "Orchard Medical Centre",
        specializations: ["Interventional Cardiology", "Heart Failure", "Preventive Cardiology"],
        culturalCompetency: true,
        internationalExperience: true,
        acceptsInsurance: true
      },
      {
        doctorId: "2", 
        name: "Dr. Michael Wong",
        specialty: "Cardiology",
        expertiseLevel: "ADVANCED",
        successRate: 92,
        patientCount: 1800,
        yearsExperience: 12,
        languages: ["English", "Mandarin"],
        rating: 4.7,
        matchScore: 88,
        matchReasons: [
          "Specialized in chest pain evaluation",
          "12 years cardiology experience",
          "Strong patient satisfaction ratings",
          "Prompt availability for urgent cases"
        ],
        estimatedWaitTime: "1-2 days",
        consultationFee: "SGD $160", 
        nextAvailable: "Today 4:30 PM",
        clinicLocation: "Mount Elizabeth Hospital",
        specializations: ["Cardiac Imaging", "Preventive Cardiology"],
        culturalCompetency: true,
        internationalExperience: false,
        acceptsInsurance: true
      }
    ];
    
    setMatchingResults(mockResults);
    setIsMatching(false);
  };

  const getUrgencyColor = (urgency: Condition['urgency']) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800';
      case 'URGENT': return 'bg-orange-100 text-orange-800'; 
      case 'SAME_DAY': return 'bg-yellow-100 text-yellow-800';
      case 'ROUTINE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: Condition['complexity']) => {
    switch (complexity) {
      case 'SPECIALIZED': return 'bg-purple-100 text-purple-800';
      case 'COMPLEX': return 'bg-red-100 text-red-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'BASIC': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Condition-to-Doctor Smart Matching
          </CardTitle>
          <CardDescription>
            Describe your condition and symptoms to get matched with the best medical specialists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="condition-input" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="condition-input">Condition Input</TabsTrigger>
              <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="condition-input" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What is your main concern or condition?</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                  >
                    <option value="">Select a condition...</option>
                    {Object.keys(conditionDatabase).map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                  <Input 
                    placeholder="Or describe your condition in your own words..."
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>How urgent is your situation?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['ROUTINE', 'SAME_DAY', 'URGENT', 'EMERGENCY'].map((level) => (
                      <Button
                        key={level}
                        variant={urgency === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUrgency(level as Condition['urgency'])}
                        className={urgency === level ? getUrgencyColor(level as Condition['urgency']) : ""}
                      >
                        {level.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedCondition && conditionDatabase[selectedCondition] && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <h4 className="font-medium">Condition Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <span className="text-sm text-gray-600">Recommended Specialty:</span>
                        <div className="font-medium">{conditionDatabase[selectedCondition].specialty}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Expected Success Rate:</span>
                        <div className="font-medium">{conditionDatabase[selectedCondition].successRate}%</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Typical Complexity:</span>
                        <Badge className={getComplexityColor(conditionDatabase[selectedCondition].complexity)}>
                          {conditionDatabase[selectedCondition].complexity}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Urgency Level:</span>
                        <Badge className={getUrgencyColor(conditionDatabase[selectedCondition].urgency)}>
                          {conditionDatabase[selectedCondition].urgency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="symptoms" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Select your symptoms:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {commonSymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant={symptoms.includes(symptom) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSymptomToggle(symptom)}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {symptoms.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected symptoms:</Label>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary">
                          {symptom}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-4 w-4 p-0"
                            onClick={() => handleSymptomToggle(symptom)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Special Requirements (optional):</Label>
                    <div className="space-y-2 mt-2">
                      {[
                        { id: 'insurance', label: 'Insurance coverage required', icon: Shield },
                        { id: 'language', label: 'Specific language preference', icon: Users },
                        { id: 'international', label: 'International experience preferred', icon: Globe },
                        { id: 'cultural', label: 'Cultural competency important', icon: HeartHandshake },
                        { id: 'female', label: 'Female doctor preferred', icon: User },
                        { id: 'evening', label: 'Evening appointments needed', icon: Clock }
                      ].map((req) => (
                        <div key={req.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={req.id}
                            checked={specialRequirements.includes(req.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSpecialRequirements([...specialRequirements, req.id]);
                              } else {
                                setSpecialRequirements(specialRequirements.filter(r => r !== req.id));
                              }
                            }}
                          />
                          <Label htmlFor={req.id} className="flex items-center gap-2">
                            <req.icon className="w-4 h-4" />
                            {req.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Matching Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Condition:</strong> {selectedCondition || 'Not specified'}</div>
                      <div><strong>Urgency:</strong> {urgency}</div>
                      <div><strong>Symptoms:</strong> {symptoms.length} selected</div>
                      <div><strong>Requirements:</strong> {specialRequirements.length} special requirements</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="text-center py-8">
                {matchingResults.length === 0 ? (
                  <div>
                    <Brain className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Ready to Find Your Perfect Match?</h3>
                    <p className="text-gray-600 mb-4">
                      Our AI system will analyze your condition and match you with the best specialists
                    </p>
                    <Button 
                      onClick={findBestMatches}
                      disabled={!selectedCondition || isMatching}
                      className="w-full md:w-auto"
                    >
                      {isMatching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          AI is analyzing...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Find My Specialists
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                      <h3 className="text-lg font-medium">Found {matchingResults.length} Specialist Matches</h3>
                      <p className="text-gray-600">Specialists ranked by match score and expertise</p>
                    </div>

                    <div className="grid gap-4">
                      {matchingResults.map((doctor, index) => (
                        <Card key={doctor.doctorId} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-lg font-semibold">
                                    #{index + 1} Match
                                  </Badge>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {doctor.matchScore}% Match
                                  </Badge>
                                  <Badge className="bg-purple-100 text-purple-800">
                                    {doctor.expertiseLevel}
                                  </Badge>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-xl">{doctor.name}</h4>
                                  <p className="text-gray-600">{doctor.specialty}</p>
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

                                <div className="space-y-2">
                                  <h5 className="font-medium">Why you're matched with this specialist:</h5>
                                  <ul className="text-sm space-y-1">
                                    {doctor.matchReasons.map((reason: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                                        {reason}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {doctor.specializations.map((spec: string) => (
                                    <Badge key={spec} variant="secondary">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>Next: {doctor.nextAvailable}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span>Wait: {doctor.estimatedWaitTime}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span>{doctor.clinicLocation}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>Languages: {doctor.languages.join(", ")}</span>
                                  </div>
                                  {doctor.internationalExperience && (
                                    <Badge variant="outline">
                                      <Globe className="w-3 h-3 mr-1" />
                                      International Experience
                                    </Badge>
                                  )}
                                  {doctor.culturalCompetency && (
                                    <Badge variant="outline">
                                      <HeartHandshake className="w-3 h-3 mr-1" />
                                      Cultural Competency
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 ml-4">
                                <Button className="w-full">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Book Appointment
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call Clinic
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Message
                                </Button>
                                <Button variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setMatchingResults([]);
                          setSelectedCondition("");
                          setSymptoms([]);
                          setSpecialRequirements([]);
                        }}
                      >
                        Start New Search
                      </Button>
                      <Button 
                        onClick={findBestMatches}
                        disabled={isMatching}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Refine Search
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConditionToDoctorMatcher;