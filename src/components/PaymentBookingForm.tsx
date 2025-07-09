import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  CreditCard, 
  Shield, 
  DollarSign, 
  Building, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { PaymentDatesForm } from './forms/PaymentDatesForm';
import { InsuranceDetailsForm } from './forms/InsuranceDetailsForm';
import { FinancialInfoForm } from './forms/FinancialInfoForm';
import { BusinessInfoForm } from './forms/BusinessInfoForm';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  // Personal Information
  policyHolderName: string;
  contactNo: string;
  email: string;
  numberOfMembers: string;

  // Payment & Dates
  paymentDate: string;
  month: string;
  effectiveDate: string;
  nextRenewalDate: string;

  // Insurance Details
  insuranceCompany: string;
  planName: string;
  policyType: string;
  healthCheckup: string;

  // Financial Information
  premium: string;
  netPremium: string;
  discountOffer: string;
  updatedPremium: string;
  tenure: string;

  // Business Information
  employeeName: string;
  team: string;
  previousCompany: string;
  applicationNo: string;
  businessType: string;
  assistantTeam: string;
  relationshipManager: string;
  proposalNo: string;
  paymentProof: string;
  paymentProofType: 'file' | 'details';
}

const steps = [
  {
    id: 1,
    title: 'Personal Information',
    icon: User,
    description: 'Basic contact details'
  },
  {
    id: 2,
    title: 'Payment & Dates',
    icon: Calendar,
    description: 'Payment and renewal dates'
  },
  {
    id: 3,
    title: 'Insurance Details',
    icon: Shield,
    description: 'Policy and plan information'
  },
  {
    id: 4,
    title: 'Financial Information',
    icon: DollarSign,
    description: 'Premium and pricing details'
  },
  {
    id: 5,
    title: 'Business Information',
    icon: Building,
    description: 'Company and team details'
  }
];

export function PaymentBookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    policyHolderName: '',
    contactNo: '',
    email: '',
    numberOfMembers: '',
    paymentDate: '',
    month: '',
    effectiveDate: '',
    nextRenewalDate: '',
    insuranceCompany: '',
    planName: '',
    policyType: '',
    healthCheckup: '',
    premium: '',
    netPremium: '',
    discountOffer: '',
    updatedPremium: '',
    tenure: '',
    employeeName: '',
    team: '',
    previousCompany: '',
    applicationNo: '',
    businessType: '',
    assistantTeam: '',
    relationshipManager: '',
    proposalNo: '',
    paymentProof: '',
    paymentProofType: 'file'
  });
  const { toast } = useToast();

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Form Submitted Successfully!",
      description: "Your payment booking form has been submitted for processing.",
    });
    console.log('Form Data:', formData);
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm data={formData} updateData={updateFormData} />;
      case 2:
        return <PaymentDatesForm data={formData} updateData={updateFormData} />;
      case 3:
        return <InsuranceDetailsForm data={formData} updateData={updateFormData} />;
      case 4:
        return <FinancialInfoForm data={formData} updateData={updateFormData} />;
      case 5:
        return <BusinessInfoForm data={formData} updateData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Payment Booking Form
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete your insurance payment booking in easy steps
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 bg-gradient-card border-border/20 animate-slide-in">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div 
                    key={step.id} 
                    className={`flex flex-col items-center text-center flex-1 ${
                      index < steps.length - 1 ? 'border-r border-border/20' : ''
                    }`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-success text-white' 
                          : isActive 
                            ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card className="bg-gradient-card border-border/20 shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              {React.createElement(steps[currentStep - 1].icon, { 
                className: "w-7 h-7 text-primary" 
              })}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/20">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {currentStep === steps.length ? (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleSubmit}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Submit Form
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}