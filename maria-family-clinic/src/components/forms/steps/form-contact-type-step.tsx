import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ContactType, CONTACT_TYPES } from '@/lib/validations/contact-form';
import { useContactForm } from '../contact-form-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  CreditCard, 
  ThumbsUp,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormContactTypeStepProps {
  onNext: () => void;
  compactMode?: boolean;
}

const CONTACT_TYPE_CONFIG = {
  appointment: {
    icon: Calendar,
    color: 'bg-blue-100 text-blue-600 border-blue-200',
    features: [
      'Schedule consultation',
      'Follow-up visits',
      'Emergency appointments',
      'Health screenings'
    ]
  },
  general: {
    icon: MessageCircle,
    color: 'bg-green-100 text-green-600 border-green-200',
    features: [
      'Service information',
      'General questions',
      'Clinic information',
      'General support'
    ]
  },
  medical: {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-600 border-red-200',
    features: [
      'Medical questions',
      'Treatment inquiries',
      'Medication advice',
      'Symptom evaluation'
    ]
  },
  billing: {
    icon: CreditCard,
    color: 'bg-orange-100 text-orange-600 border-orange-200',
    features: [
      'Payment questions',
      'Insurance inquiries',
      'Invoice issues',
      'MediSave/Medisave'
    ]
  },
  feedback: {
    icon: ThumbsUp,
    color: 'bg-purple-100 text-purple-600 border-purple-200',
    features: [
      'Service feedback',
      'Suggestions',
      'Compliments',
      'Complaints'
    ]
  }
} as const;

export function FormContactTypeStep({ onNext, compactMode = false }: FormContactTypeStepProps) {
  const { setFormType } = useContactForm();
  const { watch, setValue } = useFormContext();
  
  const selectedType = watch('contactType');

  const handleTypeSelect = (type: ContactType) => {
    setValue('contactType', type, { shouldValidate: true });
    setFormType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onNext();
    }
  };

  if (compactMode) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">What type of inquiry do you have?</h3>
          <p className="text-sm text-muted-foreground">
            Select the option that best describes your needs
          </p>
        </div>

        <RadioGroup 
          value={selectedType || ''} 
          onValueChange={handleTypeSelect}
          className="space-y-3"
        >
          {Object.entries(CONTACT_TYPE_CONFIG).map(([type, config]) => {
            const IconComponent = config.icon;
            const contactType = type as ContactType;
            const typeInfo = CONTACT_TYPES[contactType];
            
            return (
              <div key={type}>
                <RadioGroupItem
                  value={type}
                  id={type}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={type}
                  className={cn(
                    'flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                    'hover:border-blue-300 hover:bg-blue-50/50',
                    selectedType === type && 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20',
                    'peer-focus-within:ring-2 peer-focus-within:ring-blue-500/20'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    config.color
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{typeInfo.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {typeInfo.description}
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <Button
          onClick={handleContinue}
          disabled={!selectedType}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          What type of inquiry do you have?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the option that best describes your needs. This will help us provide you with the most appropriate assistance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(CONTACT_TYPE_CONFIG).map(([type, config]) => {
          const IconComponent = config.icon;
          const contactType = type as ContactType;
          const typeInfo = CONTACT_TYPES[contactType];
          const isSelected = selectedType === contactType;
          
          return (
            <Card
              key={type}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                'border-2 hover:border-blue-300',
                isSelected && 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20',
                'focus-within:ring-2 focus-within:ring-blue-500/20'
              )}
              onClick={() => handleTypeSelect(contactType)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                    config.color
                  )}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight">
                      {typeInfo.label}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      {typeInfo.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{typeInfo.maxSteps} steps</span>
                  </div>
                  
                  <ul className="space-y-1">
                    {config.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {isSelected && (
                    <div className="pt-2 border-t">
                      <Badge variant="default" className="w-full justify-center">
                        Selected
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Emergency Notice */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800">Medical Emergency?</p>
            <p className="text-red-700 mt-1">
              If you're experiencing a medical emergency, please call 995 immediately or visit your nearest emergency department. Do not use this contact form for urgent medical situations.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedType}
          size="lg"
          className="min-w-[200px]"
        >
          Continue
          {selectedType && (
            <span className="ml-2">
              → {CONTACT_TYPES[selectedType].label}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}