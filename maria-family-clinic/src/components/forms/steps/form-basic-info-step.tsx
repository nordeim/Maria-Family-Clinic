import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useContactForm, useFormPrefill } from '../contact-form-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Globe, 
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormBasicInfoStepProps {
  onNext: () => void;
  onPrev: () => void;
  compactMode?: boolean;
}

const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
] as const;

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'chinese', label: '中文 (Chinese)' },
  { value: 'malay', label: 'Bahasa Melayu (Malay)' },
  { value: 'tamil', label: 'தமிழ் (Tamil)' },
] as const;

export function FormBasicInfoStep({ onNext, onPrev, compactMode = false }: FormBasicInfoStepProps) {
  const { state } = useContactForm();
  const { prefillFromUrlParams, prefillFromUserProfile } = useFormPrefill();
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  
  const watchedValues = watch();

  useEffect(() => {
    // Auto-prefill from URL parameters
    prefillFromUrlParams();
  }, [prefillFromUrlParams]);

  useEffect(() => {
    // If we have a user ID, prefill from user profile
    const userId = 'current-user'; // In real app, this would come from auth context
    if (userId) {
      prefillFromUserProfile(userId);
    }
  }, [prefillFromUserProfile]);

  const handleContinue = () => {
    onNext();
  };

  const fields = [
    {
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      required: true,
      icon: User,
    },
    {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
      required: true,
      icon: User,
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'your.email@example.com',
      required: true,
      icon: Mail,
    },
    {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+65 9123 4567',
      required: true,
      icon: Phone,
    },
  ];

  if (compactMode) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            Please provide your contact details
          </p>
        </div>

        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+65 9123 4567"
              {...register('phone')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <Select 
                value={watchedValues.preferredContact || ''} 
                onValueChange={(value) => setValue('preferredContact', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How should we contact you?" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center space-x-2">
                        <method.icon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">Preferred Language</Label>
              <Select 
                value={watchedValues.preferredLanguage || 'english'} 
                onValueChange={(value) => setValue('preferredLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNewPatient"
                checked={watchedValues.isNewPatient !== false}
                onCheckedChange={(checked) => setValue('isNewPatient', checked === true)}
              />
              <Label htmlFor="isNewPatient" className="text-sm">
                This is my first visit to My Family Clinic
              </Label>
            </div>
          </div>
        </div>

        <Button onClick={handleContinue} className="w-full">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Contact Information
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Please provide your contact details so we can assist you properly. All fields marked with * are required.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription>
            Your basic contact and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>First Name *</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.firstName.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Last Name *</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.lastName.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address *</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number *</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+65 9123 4567"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone.message}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Communication Preferences</span>
          </CardTitle>
          <CardDescription>
            How would you like us to contact you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Preferred Contact Method</span>
              </Label>
              <Select 
                value={watchedValues.preferredContact || 'email'} 
                onValueChange={(value) => setValue('preferredContact', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How should we contact you?" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center space-x-2">
                        <method.icon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Preferred Language</span>
              </Label>
              <Select 
                value={watchedValues.preferredLanguage || 'english'} 
                onValueChange={(value) => setValue('preferredLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNewPatient"
                checked={watchedValues.isNewPatient !== false}
                onCheckedChange={(checked) => setValue('isNewPatient', checked === true)}
              />
              <Label htmlFor="isNewPatient" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                This is my first visit to My Family Clinic
              </Label>
            </div>

            {/* Patient status indicator */}
            {(watchedValues.isNewPatient === false || watchedValues.isNewPatient === undefined) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Returning Patient</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  We have your information on file from your previous visits.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleContinue} size="lg">
          Continue to Details
        </Button>
      </div>
    </div>
  );
}