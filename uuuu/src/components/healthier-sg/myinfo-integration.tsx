// SingPass MyInfo Integration Component
// Secure identity verification and pre-filling of demographic data

'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  User, 
  MapPin, 
  Calendar,
  Fingerprint,
  Loader,
  ExternalLink
} from 'lucide-react'

import { MyInfoData, MyInfoAuthConfig, MyInfoTokenResponse, MyInfoAuthConfigSchema } from './types'

interface MyInfoIntegrationProps {
  onDataReceived?: (data: MyInfoData) => void
  onError?: (error: string) => void
  onCancel?: () => void
  environment?: 'STAGING' | 'PRODUCTION'
  className?: string
}

export function MyInfoIntegration({
  onDataReceived,
  onError,
  onCancel,
  environment = 'STAGING',
  className
}: MyInfoIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Mock MyInfo authentication flow
  const handleMyInfoAuth = useCallback(async () => {
    setIsAuthenticating(true)
    setError(null)
    
    try {
      // In production, this would initiate the actual MyInfo flow
      // For demo purposes, we'll simulate the authentication
      
      // Simulate API call to get auth URL
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock MyInfo configuration
      const config: MyInfoAuthConfig = {
        environment,
        clientId: environment === 'PRODUCTION' ? 'MYINFO_CLIENT_ID' : 'MYINFO_STAGING_CLIENT_ID',
        redirectUri: `${window.location.origin}/healthier-sg/eligibility`,
        scope: ['name', 'dateofbirth', 'gender', 'nationality', 'regadd'],
      }
      
      // Generate mock auth URL (in reality, this would be from MyInfo)
      const mockAuthUrl = `https://${environment === 'PRODUCTION' ? 'api' : 'sandbox'}.myinfo.gov.sg/authorize?` +
        `client_id=${config.clientId}&` +
        `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
        `scope=${config.scope.join(' ')}&` +
        `response_type=code&` +
        `state=${encodeURIComponent(`eligibility-${Date.now()}`)}`
      
      setAuthUrl(mockAuthUrl)
      
      // Simulate redirect to MyInfo (in demo, we'll handle it differently)
      setTimeout(() => {
        simulateMyInfoResponse()
      }, 2000)
      
    } catch (err) {
      const errorMessage = 'Failed to initiate MyInfo authentication'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsAuthenticating(false)
    }
  }, [environment, onError])

  // Simulate MyInfo response (for demo purposes)
  const simulateMyInfoResponse = useCallback(() => {
    const mockData: MyInfoData = {
      uinFin: 'S1234567A',
      name: 'JOHN TAN SOON MENG',
      dateOfBirth: '1985-06-15',
      gender: 'M',
      nationality: 'Singaporean',
      residentialStatus: 'CITIZEN',
      address: {
        postalCode: '018989',
        streetName: 'MARINA BAY',
        blockHouseNumber: '18',
        buildingName: 'MARINA BAY SANDS',
      },
    }
    
    setIsLoading(true)
    
    // Simulate processing time
    setTimeout(() => {
      setIsLoading(false)
      onDataReceived?.(mockData)
    }, 2000)
  }, [onDataReceived])

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    setError(null)
    handleMyInfoAuth()
  }, [handleMyInfoAuth])

  // Handle manual entry
  const handleManualEntry = useCallback(() => {
    // In a real implementation, this would show a form for manual data entry
    const mockData: MyInfoData = {
      uinFin: 'S0000000A',
      name: 'USER',
      dateOfBirth: '1990-01-01',
      gender: 'F',
      nationality: 'Singaporean',
      residentialStatus: 'PR',
      address: {
        postalCode: '123456',
        streetName: 'Test Street',
        blockHouseNumber: '1',
      },
    }
    
    onDataReceived?.(mockData)
  }, [onDataReceived])

  // MyInfo status check
  const getMyInfoStatus = () => {
    if (isAuthenticating) return 'authenticating'
    if (isLoading) return 'loading'
    if (authUrl) return 'redirecting'
    if (error) return 'error'
    return 'ready'
  }

  const status = getMyInfoStatus()
  const canRetry = retryCount < 3 && status !== 'authenticating'

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle>Secure Identity Verification</CardTitle>
          <CardDescription>
            Use SingPass MyInfo to securely verify your identity and pre-fill your eligibility assessment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Security Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Secure</h4>
              <p className="text-xs text-muted-foreground">Government-verified identity</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Verified</h4>
              <p className="text-xs text-muted-foreground">Accurate demographic data</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Fingerprint className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Faster</h4>
              <p className="text-xs text-muted-foreground">Pre-filled forms</p>
            </div>
          </div>

          <Separator />

          {/* Authentication Flow */}
          <div className="space-y-4">
            {status === 'ready' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the button below to securely authenticate using SingPass MyInfo
                </p>
                <Button 
                  onClick={handleMyInfoAuth}
                  size="lg"
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Authenticate with SingPass
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <div className="text-xs text-muted-foreground">
                  You will be redirected to SingPass login page
                </div>
              </div>
            )}

            {status === 'authenticating' && (
              <div className="text-center space-y-4">
                <Loader className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-sm">Initiating secure authentication...</p>
                <div className="text-xs text-muted-foreground">
                  Connecting to SingPass MyInfo ({environment})
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-sm">Processing your information securely...</p>
                <div className="text-xs text-muted-foreground">
                  Validating and encrypting data
                </div>
              </div>
            )}

            {status === 'redirecting' && authUrl && (
              <div className="text-center space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Redirecting to SingPass login page...
                  </AlertDescription>
                </Alert>
                <div className="text-xs text-muted-foreground">
                  You will be redirected to complete authentication
                </div>
                <Button 
                  onClick={() => window.open(authUrl, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to SingPass
                </Button>
              </div>
            )}

            {status === 'error' && error && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                
                {canRetry && (
                  <div className="flex space-x-2">
                    <Button onClick={handleRetry} variant="outline" className="flex-1">
                      <Shield className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button onClick={handleManualEntry} variant="ghost" className="flex-1">
                      <User className="h-4 w-4 mr-2" />
                      Enter Manually
                    </Button>
                  </div>
                )}
                
                {!canRetry && (
                  <div className="space-y-2">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Maximum retries reached. Please try manual entry or contact support.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={handleManualEntry} variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Enter Information Manually
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Alternative Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Alternative Options</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={handleManualEntry}
                variant="ghost" 
                className="justify-start h-auto p-3"
              >
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">Enter information manually</div>
                    <div className="text-xs text-muted-foreground">
                      Fill in your details without SingPass verification
                    </div>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={onCancel}
                variant="ghost" 
                className="justify-start h-auto p-3 text-muted-foreground"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">Skip for now</div>
                    <div className="text-xs">
                      Continue without MyInfo verification
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Information Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Privacy & Security
            </h4>
            <ul className="text-xs space-y-1 text-blue-800">
              <li>• Your data is encrypted and stored securely</li>
              <li>• We only access the information necessary for eligibility</li>
              <li>• No data is shared with third parties without consent</li>
              <li>• You can delete your data at any time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// MyInfo Data Display Component
interface MyInfoDataDisplayProps {
  data: MyInfoData
  onEdit?: () => void
  className?: string
}

export function MyInfoDataDisplay({ data, onEdit, className }: MyInfoDataDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Identity Verified</CardTitle>
            <Badge variant="default">MyInfo</Badge>
          </div>
          {onEdit && (
            <Button onClick={onEdit} variant="outline" size="sm">
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <p className="font-medium">{data.name}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">{formatDate(data.dateOfBirth)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Gender</label>
            <p className="font-medium">{data.gender === 'M' ? 'Male' : 'Female'}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Citizenship Status</label>
            <Badge variant={data.residentialStatus === 'CITIZEN' ? 'default' : 'secondary'}>
              {data.residentialStatus === 'CITIZEN' ? 'Singapore Citizen' : 'Permanent Resident'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <p className="font-medium">
                {data.address.blockHouseNumber} {data.address.streetName}
              </p>
              {data.address.buildingName && (
                <p className="text-sm text-muted-foreground">{data.address.buildingName}</p>
              )}
              <p className="text-sm text-muted-foreground">Singapore {data.address.postalCode}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Verified through SingPass MyInfo on {new Date().toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}