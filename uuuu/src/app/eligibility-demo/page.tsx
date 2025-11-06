import { EligibilityAssessment } from "@/components/healthier-sg/eligibility-assessment"

export default function EligibilityDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Healthier SG Eligibility Checker Demo
          </h1>
          <p className="text-gray-600">
            Test the interactive eligibility assessment system for Singapore's Healthier SG program.
          </p>
        </div>
        
        <EligibilityAssessment />
      </div>
    </div>
  )
}