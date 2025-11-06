// QuestionCard Component for Healthier SG Eligibility Assessment
// Renders individual questions with different input types and validation

'use client'

import React from 'react'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Question } from '../types'

interface QuestionCardProps {
  question: Question
  value: any
  onChange: (value: any) => void
  showValidationErrors?: boolean
  language?: 'en' | 'zh' | 'ms' | 'ta'
  className?: string
}

export function QuestionCard({
  question,
  value,
  onChange,
  showValidationErrors = false,
  language = 'en',
  className
}: QuestionCardProps) {
  // Generate form schema dynamically based on question
  const getFormSchema = () => {
    let schema: any = {}
    
    switch (question.inputType) {
      case 'number':
        schema = z.number({
          required_error: `${question.text} is required`,
        })
        if (question.validation?.minAge !== undefined) {
          schema = schema.min(question.validation.minAge, `Must be at least ${question.validation.minAge} years old`)
        }
        if (question.validation?.maxAge !== undefined) {
          schema = schema.max(question.validation.maxAge, `Must be ${question.validation.maxAge} years old or younger`)
        }
        break
      case 'select':
        schema = z.string({
          required_error: `${question.text} is required`,
        })
        break
      case 'boolean':
        schema = z.boolean({
          required_error: `${question.text} is required`,
        })
        break
      case 'multiselect':
        schema = z.array(z.string()).optional()
        break
      case 'text':
        schema = z.string({
          required_error: `${question.text} is required`,
        })
        if (question.id === 'postalCode') {
          schema = schema.regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit postal code')
        }
        break
      default:
        schema = z.any()
    }

    return z.object({ [question.id]: schema })
  }

  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      [question.id]: value,
    },
    mode: 'onChange',
  })

  const isValid = form.formState.isValid
  const isDirty = form.formState.isDirty
  const error = form.formState.errors[question.id]

  const handleChange = (newValue: any) => {
    onChange(newValue)
    form.setValue(question.id, newValue, { shouldValidate: true, shouldDirty: true })
  }

  const renderInput = () => {
    switch (question.inputType) {
      case 'number':
        return (
          <FormField
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
                    placeholder={getPlaceholder(question.id, language)}
                    className="text-base"
                  />
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                {showValidationErrors && error && (
                  <FormMessage className="text-destructive text-sm" />
                )}
                {isValid && isDirty && !error && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Valid</span>
                  </div>
                )}
              </FormItem>
            )}
          />
        )

      case 'select':
        return (
          <FormField
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Select 
                  onValueChange={handleChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder={getPlaceholder(question.id, language)} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.eligible === false && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Not Eligible
                            </Badge>
                          )}
                          {option.eligible === true && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Preferred
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                {showValidationErrors && error && (
                  <FormMessage className="text-destructive text-sm" />
                )}
                {isValid && isDirty && !error && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Selected</span>
                  </div>
                )}
              </FormItem>
            )}
          />
        )

      case 'boolean':
        return (
          <FormField
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => handleChange(value === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                    className="flex flex-col space-y-3"
                  >
                    {question.options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3">
                        <RadioGroupItem 
                          value={option.value} 
                          id={`${question.id}-${option.value}`}
                        />
                        <FormLabel 
                          htmlFor={`${question.id}-${option.value}`}
                          className="text-base cursor-pointer flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {option.eligible === false && (
                              <Badge variant="destructive" className="text-xs">
                                Not Eligible
                              </Badge>
                            )}
                            {option.eligible === true && (
                              <Badge variant="default" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </FormLabel>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                {showValidationErrors && error && (
                  <FormMessage className="text-destructive text-sm" />
                )}
                {isValid && isDirty && !error && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Answered</span>
                  </div>
                )}
              </FormItem>
            )}
          />
        )

      case 'multiselect':
        return (
          <FormField
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {question.options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3">
                        <Checkbox
                          id={`${question.id}-${option.value}`}
                          checked={field.value?.includes(option.value) || false}
                          onCheckedChange={(checked) => {
                            const updated = checked
                              ? [...(field.value || []), option.value]
                              : field.value?.filter((v: string) => v !== option.value) || []
                            handleChange(updated)
                          }}
                        />
                        <FormLabel 
                          htmlFor={`${question.id}-${option.value}`}
                          className="text-base cursor-pointer flex-1"
                        >
                          {option.label}
                        </FormLabel>
                      </div>
                    ))}
                  </div>
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                {showValidationErrors && error && (
                  <FormMessage className="text-destructive text-sm" />
                )}
                {field.value && field.value.length > 0 && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{field.value.length} selected</span>
                  </div>
                )}
              </FormItem>
            )}
          />
        )

      case 'text':
        return (
          <FormField
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={getPlaceholder(question.id, language)}
                    className="text-base"
                  />
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                {showValidationErrors && error && (
                  <FormMessage className="text-destructive text-sm" />
                )}
                {isValid && isDirty && !error && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Entered</span>
                  </div>
                )}
              </FormItem>
            )}
          />
        )

      case 'date':
        return (
          <FormField
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => handleChange(new Date(e.target.value))}
                    className="text-base"
                  />
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                {showValidationErrors && error && (
                  <FormMessage className="text-destructive text-sm" />
                )}
                {isValid && isDirty && !error && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Date selected</span>
                  </div>
                )}
              </FormItem>
            )}
          />
        )

      default:
        return (
          <FormField
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={getPlaceholder(question.id, language)}
                    className="text-base"
                  />
                </FormControl>
                {question.description && (
                  <FormDescription>{question.description}</FormDescription>
                )}
                {showValidationErrors && error && (
                  <FormMessage className="text-destructive text-sm" />
                )}
              </FormItem>
            )}
          />
        )
    }
  }

  return (
    <div className={`border rounded-lg p-4 space-y-4 ${className}`}>
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant={question.required ? 'destructive' : 'secondary'} className="text-xs">
              {question.type.replace('_', ' ')}
            </Badge>
            {question.required && (
              <Badge variant="outline" className="text-xs">
                Required
              </Badge>
            )}
          </div>
        </div>
        
        {/* Help Tooltip */}
        {question.description && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute right-0 top-6 w-64 p-3 bg-popover border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <p className="text-sm text-popover-foreground">{question.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {showValidationErrors && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {error.message || `${question.text} is required`}
          </AlertDescription>
        </Alert>
      )}

      {/* Question Input */}
      <Form {...form}>
        {renderInput()}
      </Form>

      {/* Eligibility Information */}
      {question.options && question.options.some(opt => opt.eligible !== undefined) && (
        <Alert className="mt-4">
          <HelpCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-1">
              <p className="font-medium">Eligibility Impact:</p>
              {question.options.filter(opt => opt.eligible === true).length > 0 && (
                <p className="text-green-600">
                  ✓ Recommended options: {question.options.filter(opt => opt.eligible === true).map(opt => opt.label).join(', ')}
                </p>
              )}
              {question.options.filter(opt => opt.eligible === false).length > 0 && (
                <p className="text-orange-600">
                  ⚠ Not recommended: {question.options.filter(opt => opt.eligible === false).map(opt => opt.label).join(', ')}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Helper function for placeholder text
function getPlaceholder(questionId: string, language: string): string {
  const placeholders = {
    en: {
      age: 'Enter your age (e.g., 45)',
      postalCode: 'Enter 6-digit postal code',
      default: 'Please provide your answer',
    },
    zh: {
      age: '请输入您的年龄 (例如: 45)',
      postalCode: '请输入6位邮政编码',
      default: '请提供您的答案',
    },
    ms: {
      age: 'Masukkan umur anda (cth: 45)',
      postalCode: 'Masukkan 6-digit kod pos',
      default: 'Sila berikan jawapan anda',
    },
    ta: {
      age: 'உங்கள் வயதை உள்ளிடவும் (எ.கா: 45)',
      postalCode: '6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்',
      default: 'உங்கள் பதிலை வழங்கவும்',
    }
  }
  
  const langPlaceholders = placeholders[language] || placeholders.en
  return langPlaceholders[questionId] || langPlaceholders.default
}