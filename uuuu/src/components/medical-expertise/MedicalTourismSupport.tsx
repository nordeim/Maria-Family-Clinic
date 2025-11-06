import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  Plane, 
  Shield, 
  Users, 
  CreditCard, 
  MapPin,
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  BookOpen,
  HeartHandshake,
  Languages,
  PlaneTakeoff,
  Camera,
  FileText,
  Car,
  Home,
  Banknote,
  Heart,
  Star,
  User,
  Building,
  Calendar,
  Flag,
  Compass
} from "lucide-react";

const MedicalTourismSupport: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [travelNeeds, setTravelNeeds] = useState<string[]>([]);
  const [insuranceInfo, setInsuranceInfo] = useState<string>("");
  const [languagePreference, setLanguagePreference] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "MY", name: "Malaysia", flag: "🇲🇾" },
    { code: "PH", name: "Philippines", flag: "🇵🇭" },
    { code: "TH", name: "Thailand", flag: "🇹🇭" },
    { code: "VN", name: "Vietnam", flag: "🇻🇳" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
    { code: "KR", name: "South Korea", flag: "🇰🇷" },
    { code: "SG", name: "Singapore", flag: "🇸🇬" }
  ];

  const medicalServices = [
    {
      name: "Cardiac Surgery",
      specialties: ["Interventional Cardiology", "Cardiothoracic Surgery", "Vascular Surgery"],
      successRate: "96%",
      duration: "7-14 days",
      estimatedCost: "$50,000 - $150,000",
      englishSupport: true
    },
    {
      name: "Orthopedic Surgery", 
      specialties: ["Joint Replacement", "Spine Surgery", "Sports Medicine"],
      successRate: "95%",
      duration: "5-10 days",
      estimatedCost: "$30,000 - $80,000",
      englishSupport: true
    },
    {
      name: "Cancer Treatment",
      specialties: ["Medical Oncology", "Radiation Oncology", "Surgical Oncology"],
      successRate: "85%",
      duration: "21-180 days",
      estimatedCost: "$100,000 - $300,000", 
      englishSupport: true
    },
    {
      name: "Cosmetic Surgery",
      specialties: ["Plastic Surgery", "Dermatologic Surgery"],
      successRate: "98%",
      duration: "3-7 days",
      estimatedCost: "$15,000 - $100,000",
      englishSupport: true
    },
    {
      name: "Fertility Treatment",
      specialties: ["Reproductive Endocrinology", "IVF"],
      successRate: "75%",
      duration: "14-30 days",
      estimatedCost: "$20,000 - $60,000",
      englishSupport: true
    },
    {
      name: "Eye Surgery",
      specialties: ["Cataract Surgery", "Retinal Surgery", "Refractive Surgery"],
      successRate: "99%",
      duration: "1-3 days",
      estimatedCost: "$5,000 - $25,000",
      englishSupport: true
    }
  ];

  const travelServices = [
    { id: "visa", label: "Visa assistance", icon: FileText },
    { id: "accommodation", label: "Accommodation booking", icon: Home },
    { id: "transport", label: "Transportation services", icon: Car },
    { id: "concierge", label: "Medical concierge", icon: Users },
    { id: "escort", label: "Medical escort", icon: Heart },
    { id: "interpreter", label: "Interpreter services", icon: Languages }
  ];

  const handleServiceToggle = (service: string) => {
    setTravelNeeds(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setLanguagePreference(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const submitMedicalTourismRequest = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    // Handle form submission
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Medical Tourism & International Healthcare Support
          </CardTitle>
          <CardDescription>
            Comprehensive support for international patients seeking healthcare in Singapore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specialists">International Doctors</TabsTrigger>
              <TabsTrigger value="services">Medical Services</TabsTrigger>
              <TabsTrigger value="support">Travel Support</TabsTrigger>
              <TabsTrigger value="insurance">Insurance & Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Globe className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                    <div className="text-2xl font-bold">25+</div>
                    <div className="text-sm text-gray-600">Countries Served</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm text-gray-600">International Patients</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Award className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-gray-600">Patient Satisfaction</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Why Choose Singapore Healthcare?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">World-Class Medical Standards</h4>
                      <p className="text-sm text-gray-600">Joint Commission International (JCI) accredited hospitals with internationally trained doctors</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Multilingual Healthcare Providers</h4>
                      <p className="text-sm text-gray-600">Doctors who speak English, Mandarin, Malay, Tamil, and other international languages</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Seamless Medical Tourism Experience</h4>
                      <p className="text-sm text-gray-600">End-to-end support from visa to follow-up care with dedicated coordinators</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Advanced Medical Technology</h4>
                      <p className="text-sm text-gray-600">State-of-the-art facilities and latest medical technologies available</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specialists" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Country of Origin</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      <option value="">Select country...</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Language Preference</Label>
                    <div className="space-y-2 mt-2">
                      {["English", "Mandarin", "Malay", "Arabic", "Hindi"].map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={lang}
                            checked={languagePreference.includes(lang)}
                            onChange={() => handleLanguageToggle(lang)}
                          />
                          <Label htmlFor={lang}>{lang}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {medicalServices.slice(0, 3).map((service, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <h4 className="font-semibold text-lg">{service.name}</h4>
                            <div className="flex flex-wrap gap-2">
                              {service.specialties.map((spec) => (
                                <Badge key={spec} variant="secondary">{spec}</Badge>
                              ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Success Rate:</span>
                                <div className="font-medium text-green-600">{service.successRate}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Duration:</span>
                                <div className="font-medium">{service.duration}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Cost Range:</span>
                                <div className="font-medium">{service.estimatedCost}</div>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button>
                              <Star className="w-4 h-4 mr-2" />
                              View Specialists
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid gap-4">
                {medicalServices.map((service, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{service.name}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            English Support Available
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {service.specialties.map((spec) => (
                            <Badge key={spec} variant="secondary">{spec}</Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
                            <div className="text-lg font-semibold">{service.successRate}</div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                          </div>
                          <div className="text-center">
                            <Clock className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                            <div className="text-lg font-semibold">{service.duration}</div>
                            <div className="text-sm text-gray-600">Duration</div>
                          </div>
                          <div className="text-center">
                            <Banknote className="w-6 h-6 mx-auto text-purple-500 mb-1" />
                            <div className="text-lg font-semibold">${service.estimatedCost.split(' - ')[0].replace('$', '').replace(',', '')}K</div>
                            <div className="text-sm text-gray-600">Starting Cost</div>
                          </div>
                          <div className="text-center">
                            <Users className="w-6 h-6 mx-auto text-orange-500 mb-1" />
                            <div className="text-lg font-semibold">24/7</div>
                            <div className="text-sm text-gray-600">Support</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Consultation
                          </Button>
                          <Button variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Complete Travel & Medical Support</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {travelServices.map((service) => {
                      const Icon = service.icon;
                      return (
                        <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="pt-6 text-center">
                            <Icon className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                            <h4 className="font-medium">{service.label}</h4>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PlaneTakeoff className="w-5 h-5" />
                        Pre-Arrival Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Medical record translation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Doctor appointment scheduling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Treatment plan preparation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Insurance verification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Travel documentation assistance</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5" />
                        On-Ground Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Airport pickup and transfer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Hospital navigation assistance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Interpreter services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Family accommodation coordination</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Emergency contact support</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Insurance & Payment Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Shield className="w-12 h-12 mx-auto text-green-500 mb-4" />
                        <h4 className="font-medium">International Insurance</h4>
                        <p className="text-sm text-gray-600 mt-2">Direct billing with major international insurance providers</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <CreditCard className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                        <h4 className="font-medium">Payment Plans</h4>
                        <p className="text-sm text-gray-600 mt-2">Flexible payment options including installments</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Banknote className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                        <h4 className="font-medium">Self-Pay Discounts</h4>
                        <p className="text-sm text-gray-600 mt-2">Special rates for self-paying international patients</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Insurance Verification Request</CardTitle>
                    <CardDescription>
                      Submit your insurance information for verification and coverage assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="insurance-company">Insurance Company</Label>
                        <Input id="insurance-company" placeholder="Enter insurance company name" />
                      </div>
                      <div>
                        <Label htmlFor="policy-number">Policy Number</Label>
                        <Input id="policy-number" placeholder="Enter policy number" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="group-number">Group Number (if applicable)</Label>
                        <Input id="group-number" placeholder="Enter group number" />
                      </div>
                      <div>
                        <Label htmlFor="coverage-type">Coverage Type</Label>
                        <select className="w-full p-2 border rounded-md" id="coverage-type">
                          <option value="">Select coverage type...</option>
                          <option value="inpatient">Inpatient Only</option>
                          <option value="outpatient">Outpatient Only</option>
                          <option value="comprehensive">Comprehensive</option>
                          <option value="emergency">Emergency Only</option>
                        </select>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Insurance Coverage
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Medical Tourism Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Medical Tourism Consultation</CardTitle>
          <CardDescription>
            Tell us about your healthcare needs and we'll connect you with the right specialists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-name">Full Name</Label>
              <Input id="patient-name" placeholder="Enter your full name" />
            </div>
            <div>
              <Label htmlFor="contact-email">Email Address</Label>
              <Input id="contact-email" type="email" placeholder="Enter your email" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-country">Country</Label>
              <select className="w-full p-2 border rounded-md" id="patient-country">
                <option value="">Select your country...</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="preferred-date">Preferred Treatment Date</Label>
              <Input id="preferred-date" type="date" />
            </div>
          </div>
          <div>
            <Label htmlFor="medical-condition">Medical Condition/Service Needed</Label>
            <Input id="medical-condition" placeholder="e.g., Heart surgery, Knee replacement, etc." />
          </div>
          <div>
            <Label>Additional Services Needed</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {travelServices.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    checked={travelNeeds.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                  />
                  <Label htmlFor={`service-${service.id}`} className="text-sm">
                    {service.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Button 
            onClick={submitMedicalTourismRequest}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting Request...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Submit Medical Tourism Request
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalTourismSupport;