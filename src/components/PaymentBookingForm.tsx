'use client';
import React, { useState, useEffect, useRef } from 'react';
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
import { PremiumConversionWidget } from './PremiumConversionWidget';
import { supabase } from '@/lib/supabase';
import { 
  createSession, 
  getSession, 
  updateSession, 
  clearSession, 
  hasSession,
  SessionData
} from '@/lib/sessionManager';

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
  // Derive initial state from URL so direct links like ?step=insurer-information
  // skip the welcome screen immediately without any flash
  const getInitialStep = () => {
    const stepParam = new URLSearchParams(window.location.search).get('step');
    if (stepParam) {
      const found = steps.find(s => s.slug === stepParam);
      if (found) return found.id;
    }
    return 1;
  };
  const getInitialShowWelcome = () => {
    const params = new URLSearchParams(window.location.search);
    // If URL has a step, find, or widget param, skip welcome
    return !params.has('step') && !params.has('find') && !params.has('widget');
  };

  const getInitialShowPremiumConversion = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('widget') === 'conversion';
  };

  // Derive which find=proposal part to show initially from URL
  const getInitialFindPart = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('find') === 'proposal') {
      return params.get('part') || 'business-type';
    }
    return null;
  };

  const initialFindPart = getInitialFindPart();
  const getInitialShowBusinessType = () => initialFindPart === 'business-type';
  const getInitialShowCompany = () => initialFindPart === 'company';
  const getInitialShowProposal = () => initialFindPart === 'proposal-no';

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [showWelcome, setShowWelcome] = useState(getInitialShowWelcome);
  const [showPremiumConversion, setShowPremiumConversion] = useState(getInitialShowPremiumConversion);
  const [hideGreeting, setHideGreeting] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showBusinessTypeSelect, setShowBusinessTypeSelect] = useState(getInitialShowBusinessType);
  const [showCompanySelect, setShowCompanySelect] = useState(getInitialShowCompany);
  const [showProposalWidget, setShowProposalWidget] = useState(getInitialShowProposal);
  const [disabledFields, setDisabledFields] = useState<string[]>([]);
  const [locationFetched, setLocationFetched] = useState(false);
  const [preservedSession, setPreservedSession] = useState<SessionData | null>(null);
  const isSessionHydrated = useRef(false);
  const skipNextSessionSync = useRef(false);

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
    discountOffer: '0',
    discountOfferType: 'none',
    updatedPremium: '',
    employeeName: '',
    team: '',
    previousCompany: '',
    businessType: '',
    assistantTeam: 'None',
    relationshipManager: '',
    agentCode: '',
    proposalNo: '',
    paymentProof: '',
    grade: '',
    leadSource: ''
  });

  // Sync URL → state: when user navigates directly to a /?find=proposal&part=X URL or ?widget=conversion
  useEffect(() => {
    const widgetParam = searchParams.get('widget');
    if (widgetParam === 'conversion') {
      setShowWelcome(false);
      setShowPremiumConversion(true);
      setShowBusinessTypeSelect(false);
      setShowCompanySelect(false);
      setShowProposalWidget(false);
      return;
    }

    const findParam = searchParams.get('find');
    const partParam = searchParams.get('part');
    if (findParam !== 'proposal') return;

    setShowWelcome(false);
    setShowPremiumConversion(false);

    if (partParam === 'business-type') {
      setShowBusinessTypeSelect(true);
      setShowCompanySelect(false);
      setShowProposalWidget(false);
    } else if (partParam === 'company') {
      setShowBusinessTypeSelect(false);
      setShowCompanySelect(true);
      setShowProposalWidget(false);
    } else if (partParam === 'proposal-no') {
      setShowBusinessTypeSelect(false);
      setShowCompanySelect(false);
      setShowProposalWidget(true);
    }
  }, [searchParams]);

  // Sync state → URL: update URL when widget state changes
  useEffect(() => {
    if (showPremiumConversion) {
      setSearchParams({ widget: 'conversion' });
    } else if (showBusinessTypeSelect) {
      setSearchParams({ find: 'proposal', part: 'business-type' });
    } else if (showCompanySelect) {
      setSearchParams({ find: 'proposal', part: 'company' });
    } else if (showProposalWidget) {
      setSearchParams({ find: 'proposal', part: 'proposal-no' });
    }
  }, [showPremiumConversion, showBusinessTypeSelect, showCompanySelect, showProposalWidget]);

  // Scroll to top when step changes (only on step changes, not field changes)
  useEffect(() => {
    if ((window as any).scrollToTop) {
      (window as any).scrollToTop();
    }
  }, [currentStep]);

  // Sync current step with URL parameter
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const step = steps.find(s => s.slug === stepParam);
      if (step && step.id !== currentStep) {
        setCurrentStep(step.id);
      }
      // If a step param exists, ensure welcome is hidden
      if (showWelcome) {
        setShowWelcome(false);
      }
    }
  }, [searchParams, steps, currentStep, showWelcome]);

  // Clear URL parameter when showing welcome screen
  useEffect(() => {
    if (showWelcome) {
      setSearchParams({});
    }
  }, [showWelcome]);

  const { toast } = useToast();

  // Load complete state from session or location state on component mount
  useEffect(() => {
    // First check if returning from confirmation page
    if (locationState?.returnFromConfirmation && locationState?.formData) {
      setFormData(locationState.formData);
      const returnStep = locationState.returnStep || 5;
      setCurrentStep(returnStep);
      setShowWelcome(false);
      setShowBusinessTypeSelect(false);
      setShowCompanySelect(false);
      setShowProposalWidget(false);
      // Create a new session for this resumed session
      createSession(locationState.formData);
      updateSession({
        currentStep: returnStep,
        currentStepSlug: steps[returnStep - 1]?.slug || '',
        showWelcome: false,
        showBusinessTypeSelect: false,
        showCompanySelect: false,
        showProposalWidget: false,
        formData: locationState.formData
      });
      setSearchParams({ step: steps[returnStep - 1]?.slug || 'financial-information' });
      return;
    }

    const isHomeScreen = !searchParams.has('step') && !searchParams.has('find') && !searchParams.has('widget');

    // Check if we have an existing session
    if (hasSession()) {
      const session = getSession();
      if (session) {
        // Only load if the form has some actual data (not all empty)
        const hasData = Object.values(session.formData).some(value => value !== '' && value !== 'India');
        if (hasData) {
          if (isHomeScreen) {
            setPreservedSession(session);
            setShowWelcome(true);
            return;
          }

          setFormData(session.formData);
          setCurrentStep(session.currentStep);
          setShowWelcome(session.showWelcome);
          setHideGreeting(session.hideGreeting);
          setShowButtons(session.showButtons);
          setShowBusinessTypeSelect(session.showBusinessTypeSelect);
          setShowCompanySelect(session.showCompanySelect);
          setShowProposalWidget(session.showProposalWidget);
          setDisabledFields(session.disabledFields || []);

          // Reset animation states when returning to welcome screen
          if (session.showWelcome) {
            setShowGreeting(false);
            setShowButtons(false);
          }

          // Set location cache status based on saved state
          if (session.locationFetched) {
            setLocationFetched(true);
          }

          // Sync URL with current step or keep find=proposal&part=X for intermediate states
          // Only set URL parameters if not on welcome screen
          if (!session.showWelcome) {
            if (session.showBusinessTypeSelect) {
              setSearchParams({ find: 'proposal', part: 'business-type' });
            } else if (session.showCompanySelect) {
              setSearchParams({ find: 'proposal', part: 'company' });
            } else if (session.showProposalWidget) {
              setSearchParams({ find: 'proposal', part: 'proposal-no' });
            } else if (session.currentStepSlug) {
              setSearchParams({ step: session.currentStepSlug });
            }
          } else {
            // Clear URL parameters when on welcome screen
            setSearchParams({});
          }
        } else {
          // Remove stale empty session; a fresh session starts at step 1.
          clearSession();
        }
      }
    } else {
      // A new session is initialized only when the user reaches step 1.
      if (searchParams.get('step') === 'insurer-information') {
        createSession(formData);
      }
    }

  }, [locationState]);

  // Update session whenever state changes
  useEffect(() => {
    if (preservedSession) return;

    if (skipNextSessionSync.current) {
      skipNextSessionSync.current = false;
      return;
    }

    if (!isSessionHydrated.current) {
      isSessionHydrated.current = true;
      return;
    }

    updateSession({
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
      locationFetched: formData.city !== '' && formData.district !== ''
    });
  }, [formData, currentStep, showWelcome, hideGreeting, showButtons, showBusinessTypeSelect, showCompanySelect, showProposalWidget, disabledFields, steps]);



  useEffect(() => {
    // Only run animation when transitioning to welcome screen
    if (!showWelcome) {
      // Reset animation states when leaving welcome screen
      setShowGreeting(false);
      setShowButtons(false);
      return;
    }

    // Reset animation states when entering welcome screen
    setShowGreeting(false);
    setShowButtons(false);

    // Show greeting after 2 seconds to let background load first
    const showTimer = setTimeout(() => {
      if (showWelcome) {
        setShowGreeting(true);
      }
    }, 2000);

    // Show buttons after greeting animation completes (2s after greeting for better visibility)
    const buttonsTimer = setTimeout(() => {
      if (showWelcome) {
        setShowButtons(true);
      }
    }, 4000); // 2000ms (greeting) + 2000ms (extra delay for better separation)

    return () => {
      clearTimeout(showTimer);
      clearTimeout(buttonsTimer);
    };
  }, [showWelcome]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleRestoreSession = () => {
    if (!preservedSession) return;

    const session = preservedSession;
    setFormData(session.formData);
    setCurrentStep(session.currentStep);
    setShowWelcome(false);
    setShowPremiumConversion(false);
    setHideGreeting(session.hideGreeting);
    setShowButtons(session.showButtons);
    setShowBusinessTypeSelect(session.showBusinessTypeSelect);
    setShowCompanySelect(session.showCompanySelect);
    setShowProposalWidget(session.showProposalWidget);
    setDisabledFields(session.disabledFields || []);
    setLocationFetched(session.locationFetched);
    setPreservedSession(null);

    updateSession({
      formData: session.formData,
      currentStep: session.currentStep,
      currentStepSlug: session.currentStepSlug,
      showWelcome: false,
      hideGreeting: session.hideGreeting,
      showButtons: session.showButtons,
      showBusinessTypeSelect: session.showBusinessTypeSelect,
      showCompanySelect: session.showCompanySelect,
      showProposalWidget: session.showProposalWidget,
      disabledFields: session.disabledFields || [],
      locationFetched: session.locationFetched,
    });

    if (session.showBusinessTypeSelect) {
      setSearchParams({ find: 'proposal', part: 'business-type' });
    } else if (session.showCompanySelect) {
      setSearchParams({ find: 'proposal', part: 'company' });
    } else if (session.showProposalWidget) {
      setSearchParams({ find: 'proposal', part: 'proposal-no' });
    } else {
      setSearchParams({ step: session.currentStepSlug || 'insurer-information' });
    }
  };

  const handleRemovePreservedSession = () => {
    skipNextSessionSync.current = true;
    clearSession();
    setPreservedSession(null);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      const nextStepId = currentStep + 1;
      setCurrentStep(nextStepId);
      setSearchParams({ step: steps[nextStepId - 1].slug });
      // Update session on step change
      updateSession({
        currentStep: nextStepId,
        currentStepSlug: steps[nextStepId - 1].slug
      });
    }
  };

  const startWizard = () => {
    updateSession({
      formData,
      showWelcome: false,
      showBusinessTypeSelect: true,
      hideGreeting: true,
      showButtons: false
    });
    
    // First hide buttons immediately
    setShowButtons(false);
    
    // After 0.8 seconds, hide greeting text
    setTimeout(() => {
      setHideGreeting(true);
      
      // After another 800ms, hide welcome screen and show business type select
      setTimeout(() => {
        setShowWelcome(false);
        setShowBusinessTypeSelect(true);
        setSearchParams({ find: 'proposal', part: 'business-type' });
        if ((window as any).scrollToTop) {
          (window as any).scrollToTop();
        }
      }, 800);
    }, 800);
  };

  const handleBusinessTypeSelect = (businessType: string) => {
    setFormData(prev => ({ ...prev, businessType }));
    setShowBusinessTypeSelect(false);
    setShowCompanySelect(true);
    setSearchParams({ find: 'proposal', part: 'company' });
    // Update session on business type selection
    updateSession({
      showBusinessTypeSelect: false,
      showCompanySelect: true,
      showWelcome: false,
      formData: { ...formData, businessType }
    });
  };

  const handleCompanySelect = (company: string) => {
    setFormData(prev => ({ ...prev, insuranceCompany: company }));
    setShowCompanySelect(false);

    // Show proposal widget only if Care Health Insurance is selected
    if (company === 'Care Health Insurance') {
      setShowProposalWidget(true);
      setSearchParams({ find: 'proposal', part: 'proposal-no' });
      // Update session
      updateSession({
        showCompanySelect: false,
        showProposalWidget: true,
        showWelcome: false,
        formData: { ...formData, insuranceCompany: company }
      });
    } else {
      // Non-Care company: go straight to step 1
      const nextFormData = { ...formData, insuranceCompany: company };
      if (!hasSession()) {
        createSession(nextFormData);
      }
      setSearchParams({ step: 'insurer-information' });
      // Update session
      updateSession({
        showCompanySelect: false,
        showProposalWidget: false,
        showWelcome: false,
        currentStep: 1,
        currentStepSlug: 'insurer-information',
        formData: nextFormData
      });
    }
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

    const finalFormData = { ...formData, ...updatedData };
    if (!hasSession()) {
      createSession(finalFormData);
    }
    setFormData(finalFormData);
    setDisabledFields(fieldsToDisable);
    setShowProposalWidget(false);
    setSearchParams({ step: 'insurer-information' }); // Set to first step when entering form
    
    // Update session on proposal selection
    updateSession({
      showProposalWidget: false,
      showWelcome: false,
      currentStep: 1,
      currentStepSlug: 'insurer-information',
      disabledFields: fieldsToDisable,
      formData: finalFormData
    });
  };

  const handleProposalCancel = () => {
    setShowProposalWidget(false);
    setFormData(prev => ({ ...prev, insuranceCompany: '' }));
    setShowCompanySelect(true);
    setSearchParams({ find: 'proposal', part: 'company' });
  };

  const handleCompanySelectCancel = () => {
    setShowCompanySelect(false);
    setFormData(prev => ({ ...prev, insuranceCompany: '' }));
    setShowBusinessTypeSelect(true);
    setSearchParams({ find: 'proposal', part: 'business-type' });
  };

  const handleBusinessTypeSelectCancel = () => {
    // Reset session when going back to welcome from proposal flow
    clearSession();
    
    const resetFormData = { ...formData, businessType: '' };
    createSession(resetFormData);
    
    // Update session to show welcome screen with fresh animation state
    updateSession({
      showWelcome: true,
      showBusinessTypeSelect: false,
      showCompanySelect: false,
      showProposalWidget: false,
      hideGreeting: false,
      showButtons: false,
      formData: resetFormData
    });
    
    setShowBusinessTypeSelect(false);
    setFormData(resetFormData);
    setShowWelcome(true);
    setHideGreeting(false);
    setShowButtons(false); // Start with buttons hidden to let animation run
    setSearchParams({}); // Clear URL parameter
  };

  const handleOpenPremiumConversion = () => {
    setShowWelcome(false);
    setShowPremiumConversion(true);
    setSearchParams({ widget: 'conversion' });
  };

  const handleClosePremiumConversion = () => {
    setShowPremiumConversion(false);
    setShowWelcome(true);
    setHideGreeting(false);
    setShowButtons(false);
    setSearchParams({});
  };

  const updateBooking = () => {
    // TODO: Implement update booking logic
    // For now, show the same animation as startWizard
    // First hide buttons immediately
    setShowButtons(false);
    
    // After 0.8 seconds, hide greeting text
    setTimeout(() => {
      setHideGreeting(true);
      
      // After another 800ms, hide welcome screen and show business type select
      setTimeout(() => {
        setShowWelcome(false);
        setShowBusinessTypeSelect(true);
        setSearchParams({ find: 'proposal', part: 'business-type' });
        if ((window as any).scrollToTop) {
          (window as any).scrollToTop();
        }
      }, 800);
    }, 800);
    
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
      // Update session on step change
      updateSession({
        currentStep: prevStepId,
        currentStepSlug: steps[prevStepId - 1].slug
      });
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setSearchParams({ step: steps[stepId - 1].slug });
    // Update session on step change
    updateSession({
      currentStep: stepId,
      currentStepSlug: steps[stepId - 1].slug
    });
  };

  const handleReset = () => {
    // Clear the current session and create a new one
    clearSession();
    
    const newFormData = {
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
      discountOffer: '0',
      discountOfferType: 'none',
      updatedPremium: '',
      employeeName: '',
      team: '',
      previousCompany: '',
      businessType: '',
      assistantTeam: 'None',
      relationshipManager: '',
      agentCode: '',
      proposalNo: '',
      paymentProof: '',
      grade: '',
      leadSource: ''
    };

    // Create new session with empty form data
    createSession(newFormData);

    // Clear form data
    setFormData(newFormData);

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
    // Keep a recoverable snapshot until confirmation succeeds.
    updateSession({
      formData,
      currentStep,
      currentStepSlug: steps[currentStep - 1]?.slug || 'business-information',
      showWelcome: false,
      showBusinessTypeSelect: false,
      showCompanySelect: false,
      showProposalWidget: false,
      locationFetched: formData.city !== '' && formData.district !== '',
    });
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
        return <FinancialInfoForm data={{ ...formData, paymentDate: formData.paymentDate }} updateData={updateFormData} disabledFields={disabledFields} />;
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
          onPremiumConversion={handleOpenPremiumConversion}
          sessionPreview={preservedSession?.formData}
          onRestoreSession={handleRestoreSession}
          onCreateNewSession={handleRemovePreservedSession}
        />
      ) : showPremiumConversion ? (
        <PremiumConversionWidget
          onCancel={handleClosePremiumConversion}
          paymentDate={formData.paymentDate}
          onApplyToBooking={(calcData) => {
            setFormData(prev => ({
              ...prev,
              premium: calcData.premium,
              netPremium: calcData.netPremium,
              tenure: calcData.tenure,
              discountOffer: calcData.discountOffer,
              discountOfferType: calcData.discountOfferType,
              updatedPremium: calcData.updatedPremium
            }));
            setShowPremiumConversion(false);
            startWizard();
          }}
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