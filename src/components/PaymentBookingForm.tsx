'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { User, Shield, IndianRupee, Building, Calendar } from 'lucide-react';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { PaymentDatesForm } from './forms/PaymentDatesForm';
import { InsuranceDetailsForm } from './forms/InsuranceDetailsForm';
import { FinancialInfoForm } from './forms/FinancialInfoForm';
import { BusinessInfoForm } from './forms/BusinessInfoForm';
import { useToast } from '@/hooks/use-toast';
import { Layout } from './layout/Layout';
import { Welcome } from './Welcome';
import { FormContainer } from './FormContainer';
import { BusinessTypeSelect } from './BusinessTypeSelect';
import { InsuranceCompanySelect } from './InsuranceCompanySelect';
import { ProposalWidget } from './ProposalWidget';
import { supabase } from '@/lib/supabase';

interface PaymentBookingFormProps {
  locationState?: any;
}

interface FormData {
  // Personal Information
  policyHolderName: string;
  contactNo: string;
  email: string;
  numberOfMembers: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;

  // Payment & Dates
  paymentDate: string;
  month: string;
  effectiveDate: string;
  nextRenewalDate: string;
  paymentMonth: string;

  // Insurance Details
  insuranceCompany: string;
  planName: string;
  policyType: string;
  healthCheckup: string;
  extraBonus: string;

  // Financial Information
  premium: string;
  netPremium: string;
  discountOffer: string;
  discountOfferType: string;
  updatedPremium: string;
  tenure: string;

  // Business Information
  employeeName: string;
  team: string;
  previousCompany: string;
  businessType: string;
  assistantTeam: string;
  relationshipManager: string;
  agentCode: string;
  proposalNo: string;
  paymentProof: string;
  grade: string;
  leadSource: string;
}

export function PaymentBookingForm({ locationState }: PaymentBookingFormProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const steps = [
    {
      id: 1,
      title: 'Insurer Information',
      icon: User,
      description: 'Basic contact details',
      slug: 'insurer-information'
    },
    {
      id: 2,
      title: 'Payment & Dates',
      icon: Calendar,
      description: 'Payment and renewal dates',
      slug: 'payment-dates'
    },
    {
      id: 3,
      title: 'Insurance Details',
      icon: Shield,
      description: 'Policy and plan information',
      slug: 'insurance-details'
    },
    {
      id: 4,
      title: 'Financial Information',
      icon: IndianRupee,
      description: 'Premium and pricing details',
      slug: 'financial-information'
    },
    {
      id: 5,
      title: 'Business Information',
      icon: Building,
      description: 'Company and team details',
      slug: 'business-information'
    }
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hideGreeting, setHideGreeting] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showBusinessTypeSelect, setShowBusinessTypeSelect] = useState(false);
  const [showCompanySelect, setShowCompanySelect] = useState(false);
  const [showProposalWidget, setShowProposalWidget] = useState(false);
  const [disabledFields, setDisabledFields] = useState<string[]>([]);
  const [locationFetched, setLocationFetched] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    policyHolderName: '',
    contactNo: '',
    email: '',
    numberOfMembers: '',
    pincode: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    paymentDate: '',
    month: '',
    effectiveDate: '',
    nextRenewalDate: '',
    paymentMonth: '',
    insuranceCompany: '',
    planName: '',
    policyType: '',
    healthCheckup: '',
    extraBonus: '',
    tenure: '1 Year',
    premium: '',
    netPremium: '',
    discountOffer: '',
    discountOfferType: 'none',
    updatedPremium: '',
    employeeName: '',
    team: '',
    previousCompany: '',
    businessType: '',
    assistantTeam: '',
    relationshipManager: '',
    agentCode: '',
    proposalNo: '',
    paymentProof: '',
    grade: '',
    leadSource: ''
  });

  // Handle URL parameter 'find' to show intermediate widgets
  useEffect(() => {
    const findParam = searchParams.get('find');
    if (findParam === 'proposal') {
      // Check which widget should be shown based on form data
      if (!formData.businessType) {
        setShowBusinessTypeSelect(true);
        setShowWelcome(false);
      } else if (!formData.insuranceCompany) {
        setShowCompanySelect(true);
        setShowWelcome(false);
      } else if (formData.insuranceCompany === 'Care Health Insurance' && !formData.proposalNo) {
        setShowProposalWidget(true);
        setShowWelcome(false);
      } else {
        // If all data is present, go to first step
        setCurrentStep(1);
        setSearchParams({ step: 'insurer-information' });
        setShowWelcome(false);
      }
    }
  }, [searchParams, formData]);

  // Update URL when intermediate widgets are shown
  useEffect(() => {
    if (showBusinessTypeSelect || showCompanySelect || showProposalWidget) {
      setSearchParams({ find: 'proposal' });
    }
  }, [showBusinessTypeSelect, showCompanySelect, showProposalWidget]);

  // Scroll to top when step changes (only on step changes, not field changes)
  useEffect(() => {
    if ((window as any).scrollToTop) {
      (window as any).scrollToTop();
    }
  }, [currentStep]);

  // Sync current step with URL parameter (only if not on welcome screen)
  useEffect(() => {
    if (!showWelcome) {
      const stepParam = searchParams.get('step');
      if (stepParam) {
        const step = steps.find(s => s.slug === stepParam);
        if (step && step.id !== currentStep) {
          setCurrentStep(step.id);
        }
      }
    }
  }, [searchParams, steps, showWelcome, currentStep]);

  // Clear URL parameter when showing welcome screen
  useEffect(() => {
    if (showWelcome) {
      setSearchParams({});
    }
  }, [showWelcome]);

  const { toast } = useToast();

  // Load complete state from session storage or location state on component mount
  useEffect(() => {
    // First check if returning from confirmation page
    if (locationState?.returnFromConfirmation && locationState?.formData) {
      setFormData(locationState.formData);
      setCurrentStep(5); // Set to last step
      setShowWelcome(false);
      setShowBusinessTypeSelect(false);
      setShowCompanySelect(false);
      setShowProposalWidget(false);
      return;
    }

    // Check if this is a fresh start after reset
    const timestamp = sessionStorage.getItem('paymentBookingTimestamp');
    if (timestamp) {
      // Clear timestamp and don't load old state
      sessionStorage.removeItem('paymentBookingTimestamp');
      return;
    }

    // Otherwise load complete state from session storage
    const savedState = sessionStorage.getItem('paymentBookingState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Only load if the form has some actual data (not all empty)
        const hasData = Object.values(parsedState.formData).some(value => value !== '' && value !== 'India');
        if (hasData) {
          setFormData(parsedState.formData);
          setCurrentStep(parsedState.currentStep);
          setShowWelcome(parsedState.showWelcome);
          setHideGreeting(parsedState.hideGreeting);
          setShowButtons(parsedState.showButtons);
          setShowBusinessTypeSelect(parsedState.showBusinessTypeSelect);
          setShowCompanySelect(parsedState.showCompanySelect);
          setShowProposalWidget(parsedState.showProposalWidget);
          setDisabledFields(parsedState.disabledFields || []);

          // Set location cache status based on saved state
          if (parsedState.locationFetched) {
            setLocationFetched(true);
          }

          // Sync URL with current step or keep find-proposal for intermediate states
          if (parsedState.showBusinessTypeSelect || parsedState.showCompanySelect || parsedState.showProposalWidget) {
            setSearchParams({ find: 'proposal' });
          } else if (parsedState.currentStepSlug) {
            setSearchParams({ step: parsedState.currentStepSlug });
          }
        } else {
          // Clear empty state
          sessionStorage.removeItem('paymentBookingState');
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        sessionStorage.removeItem('paymentBookingState');
      }
    }
  }, [locationState]);

  // Save complete state to session storage whenever state changes
  useEffect(() => {
    const stateToSave = {
      formData,
      currentStep,
      currentStepSlug: steps[currentStep - 1]?.slug || '',
      showWelcome,
      hideGreeting,
      showButtons,
      showBusinessTypeSelect,
      showCompanySelect,
      showProposalWidget,
      disabledFields,
      locationFetched: formData.city !== '' && formData.district !== '' // Save location fetched status
    };
    sessionStorage.setItem('paymentBookingState', JSON.stringify(stateToSave));
  }, [formData, currentStep, showWelcome, hideGreeting, showButtons, showBusinessTypeSelect, showCompanySelect, showProposalWidget, disabledFields, steps, searchParams]);



  useEffect(() => {
    // Show greeting after 2 seconds to let background load first
    const showTimer = setTimeout(() => {
      if (showWelcome) {
        setShowGreeting(true);
      }
    }, 2000);

    // Show buttons after greeting animation completes (1.2s after greeting)
    const buttonsTimer = setTimeout(() => {
      if (showWelcome) {
        setShowButtons(true);
      }
    }, 3200); // 2000ms (greeting) + 1200ms (animation)

    return () => {
      clearTimeout(showTimer);
      clearTimeout(buttonsTimer);
    };
  }, [showWelcome]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      const nextStepId = currentStep + 1;
      setCurrentStep(nextStepId);
      setSearchParams({ step: steps[nextStepId - 1].slug });
    }
  };

  const startWizard = () => {
    setHideGreeting(true);
    setShowButtons(false);
    setTimeout(() => {
      setShowWelcome(false);
      setShowBusinessTypeSelect(true);
      setSearchParams({ find: 'proposal' });
      if ((window as any).scrollToTop) {
        (window as any).scrollToTop();
      }
    }, 800);
  };

  const handleBusinessTypeSelect = (businessType: string) => {
    setFormData(prev => ({ ...prev, businessType }));
    setShowBusinessTypeSelect(false);
    setShowCompanySelect(true);
    setSearchParams({ find: 'proposal' }); // Set find-proposal for intermediate steps
  };

  const handleCompanySelect = (company: string) => {
    setFormData(prev => ({ ...prev, insuranceCompany: company }));
    setShowCompanySelect(false);

    // Show proposal widget if Care Health Insurance is selected
    if (company === 'Care Health Insurance') {
      setShowProposalWidget(true);
    }
    setSearchParams({ find: 'proposal' }); // Keep find-proposal for intermediate steps
  };

  const handleProposalSelect = async (proposalData: any) => {
    const fieldsToDisable: string[] = [];

    const updatedData: any = {
      proposalNo: proposalData.proposal_no || '',
      policyHolderName: proposalData.customer_name || formData.policyHolderName,
      numberOfMembers: proposalData.no_of_lives ? String(proposalData.no_of_lives) : formData.numberOfMembers,
      effectiveDate: proposalData.policy_start_date || formData.effectiveDate,
      planName: proposalData.plan || formData.planName,
      policyType: proposalData.business_type || formData.policyType,
      premium: proposalData.payment_amount || formData.premium,
      relationshipManager: proposalData.agent_name || formData.relationshipManager
    };

    // Calculate next renewal date from pre-filled effective date
    if (proposalData.policy_start_date) {
      try {
        const effectiveDate = new Date(proposalData.policy_start_date);
        effectiveDate.setFullYear(effectiveDate.getFullYear() + 1);
        const formattedNextRenewalDate = effectiveDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '/');
        updatedData.nextRenewalDate = formattedNextRenewalDate;
      } catch (error) {
        console.error('Error calculating next renewal date:', error);
      }
    }

    // Fetch agent code if relationship manager is provided from proposal
    if (proposalData.agent_name) {
      try {
        // Try exact match first
        let { data: agentRecord } = await supabase
          .from('agent_codes')
          .select('agent_id, agent_name')
          .eq('agent_name', proposalData.agent_name)
          .single();

        // If exact match fails, try case-insensitive match with cleaned name
        if (!agentRecord) {
          // Clean the proposal agent name: remove dots, trim spaces, lowercase
          const cleanedName = proposalData.agent_name.replace(/\./g, '').trim().toLowerCase();

          // Fetch all agents and match locally
          const { data: allAgents } = await supabase
            .from('agent_codes')
            .select('agent_id, agent_name');

          if (allAgents) {
            // Find matching agent by cleaning both names
            const matchedAgent = allAgents.find(agent => {
              const cleanedAgentName = agent.agent_name.replace(/\./g, '').trim().toLowerCase();
              return cleanedAgentName === cleanedName;
            });

            if (matchedAgent) {
              agentRecord = matchedAgent;
            }
          }
        }

        if (agentRecord) {
          updatedData.agentCode = agentRecord.agent_id;
          // Use the matched agent_name from database (cleaned version)
          updatedData.relationshipManager = agentRecord.agent_name;
        }
      } catch (error) {
        console.error('Error fetching agent code:', error);
      }
    }

    // Mark fields as disabled if they have data from proposal
    if (proposalData.customer_name) fieldsToDisable.push('policyHolderName');
    if (proposalData.no_of_lives) fieldsToDisable.push('numberOfMembers');
    if (proposalData.policy_start_date) {
      fieldsToDisable.push('effectiveDate');
      fieldsToDisable.push('nextRenewalDate'); // Also disable since it's calculated from effective date
    }
    if (proposalData.plan) fieldsToDisable.push('planName');
    if (proposalData.business_type) fieldsToDisable.push('policyType');
    if (proposalData.payment_amount) fieldsToDisable.push('premium');
    if (proposalData.agent_name) fieldsToDisable.push('relationshipManager');

    setFormData(prev => ({ ...prev, ...updatedData }));
    setDisabledFields(fieldsToDisable);
    setShowProposalWidget(false);
    setSearchParams({ step: 'insurer-information' }); // Set to first step when entering form
  };

  const handleProposalCancel = () => {
    setShowProposalWidget(false);
    setFormData(prev => ({ ...prev, insuranceCompany: '' }));
    setShowCompanySelect(true);
    setSearchParams({ find: 'proposal' }); // Keep find-proposal URL
  };

  const handleCompanySelectCancel = () => {
    setShowCompanySelect(false);
    setFormData(prev => ({ ...prev, insuranceCompany: '' }));
    setShowBusinessTypeSelect(true);
    setSearchParams({ find: 'proposal' }); // Keep find-proposal URL
  };

  const handleBusinessTypeSelectCancel = () => {
    setShowBusinessTypeSelect(false);
    setFormData(prev => ({ ...prev, businessType: '' }));
    setShowWelcome(true);
    setHideGreeting(false);
    setShowButtons(true);
    setSearchParams({}); // Clear URL parameter
  };

  const updateBooking = () => {
    // TODO: Implement update booking logic
    toast({
      title: "Update Booking",
      description: "Update booking feature will be implemented soon.",
    });
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prevStepId = currentStep - 1;
      setCurrentStep(prevStepId);
      setSearchParams({ step: steps[prevStepId - 1].slug });
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setSearchParams({ step: steps[stepId - 1].slug });
  };

  const handleReset = () => {
    // Clear form data
    setFormData({
      policyHolderName: '',
      contactNo: '',
      email: '',
      numberOfMembers: '',
      pincode: '',
      city: '',
      district: '',
      state: '',
      country: 'India',
      paymentDate: '',
      month: '',
      effectiveDate: '',
      nextRenewalDate: '',
      paymentMonth: '',
      insuranceCompany: '',
      planName: '',
      policyType: '',
      healthCheckup: '',
      extraBonus: '',
      tenure: '1 Year',
      premium: '',
      netPremium: '',
      discountOffer: '',
      discountOfferType: 'none',
      updatedPremium: '',
      employeeName: '',
      team: '',
      previousCompany: '',
      businessType: '',
      assistantTeam: '',
      relationshipManager: '',
      agentCode: '',
      proposalNo: '',
      paymentProof: '',
      grade: '',
      leadSource: ''
    });

    // Clear complete session storage (start new session)
    sessionStorage.removeItem('paymentBookingState');

    // Force a fresh state by adding a timestamp to prevent reload issues
    sessionStorage.setItem('paymentBookingTimestamp', Date.now().toString());

    // Reset UI state
    setCurrentStep(1);
    setShowWelcome(true);
    setHideGreeting(false);
    setShowButtons(false);
    setShowBusinessTypeSelect(false);
    setShowCompanySelect(false);
    setShowProposalWidget(false);
    setDisabledFields([]);

    // Clear location cache
    setLocationFetched(false);

    // Clear URL parameter
    setSearchParams({});
  };

  const handleSubmit = () => {
    // Clear location cache on submit
    setLocationFetched(false);
    navigate('/booking-confirmation', { state: { formData } });
  };

  const progress = (currentStep / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm data={formData} updateData={updateFormData} disabledFields={disabledFields} locationFetched={locationFetched} setLocationFetched={setLocationFetched} />;
      case 2:
        return <PaymentDatesForm data={formData} updateData={updateFormData} disabledFields={disabledFields} />;
      case 3:
        return <InsuranceDetailsForm data={formData} updateData={updateFormData} disabledFields={disabledFields} />;
      case 4:
        return <FinancialInfoForm data={formData} updateData={updateFormData} disabledFields={disabledFields} />;
      case 5:
        return <BusinessInfoForm data={formData} updateData={updateFormData} paymentMonth={formData.paymentMonth} insuranceCompany={formData.insuranceCompany} disabledFields={disabledFields} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      {showWelcome ? (
        <Welcome
          showGreeting={showGreeting}
          hideGreeting={hideGreeting}
          showButtons={showButtons}
          onStart={startWizard}
          onUpdateBooking={updateBooking}
        />
      ) : showBusinessTypeSelect ? (
        <BusinessTypeSelect onSelect={handleBusinessTypeSelect} onCancel={handleBusinessTypeSelectCancel} />
      ) : showCompanySelect ? (
        <InsuranceCompanySelect onSelect={handleCompanySelect} onCancel={handleCompanySelectCancel} />
      ) : showProposalWidget ? (
        <ProposalWidget
          onSelect={handleProposalSelect}
          onCancel={handleProposalCancel}
          businessType={formData.businessType}
          insuranceCompany={formData.insuranceCompany}
        />
      ) : (
        <FormContainer
          currentStep={currentStep}
          steps={steps}
          progress={progress}
          renderStepContent={renderStepContent}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmit={handleSubmit}
          onStepClick={handleStepClick}
          onReset={handleReset}
        />
      )}
    </Layout>
  );
}