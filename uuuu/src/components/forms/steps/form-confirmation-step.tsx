import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Copy, 
  Download, 
  Mail, 
  Phone, 
  Calendar, 
  Share2,
  Home,
  Clock,
  FileText,
  Star,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormConfirmationStepProps {
  result: {
    referenceNumber: string;
    message: string;
    estimatedResponse: string;
  };
  onStartNew: () => void;
  className?: string;
}

export function FormConfirmationStep({ result, onStartNew, className }: FormConfirmationStepProps) {
  const referenceNumber = result.referenceNumber;
  const estimatedResponse = result.estimatedResponse;

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(referenceNumber);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy reference number:', error);
    }
  };

  const handleDownloadReceipt = () => {
    // Generate and download a receipt/confirmation document
    const receiptData = {
      referenceNumber,
      submittedAt: new Date().toISOString(),
      estimatedResponse,
      message: result.message,
    };
    
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-form-${referenceNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Contact Form Submission',
          text: `My Family Clinic contact form submitted. Reference: ${referenceNumber}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copying link
      handleCopyReference();
    }
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <Card className="border-0 shadow-lg">
        {/* Success Header */}
        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 py-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800 mb-2">
            Form Submitted Successfully!
          </CardTitle>
          <CardDescription className="text-green-700 text-base">
            Thank you for contacting My Family Clinic. We have received your submission and will respond within the specified timeframe.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Reference Number */}
          <div className="text-center space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your Reference Number</p>
              <div className="flex items-center justify-center space-x-3">
                <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                  {referenceNumber}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyReference}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Please save this reference number for your records
            </p>
          </div>

          <Separator />

          {/* Response Information */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Expected Response Time</h3>
                <p className="text-sm text-muted-foreground">{estimatedResponse}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                  We will contact you using your preferred method: email or phone
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-gray-900">What happens next?</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.message}
            </p>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">Important Notes</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Please check your email/spam folder for our response</li>
                  <li>• If you need to modify your submission, please contact us with your reference number</li>
                  <li>• For urgent medical matters, please call us directly</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Need immediate assistance?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>+65 6123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>help@myfamilyclinic.sg</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleDownloadReceipt}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button
              onClick={onStartNew}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Submit Another Form
            </Button>
          </div>

          {/* Rating Request */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-gray-300" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              How was your experience with our contact form?
            </p>
            <Button variant="link" size="sm" className="mt-1">
              Rate your experience
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}