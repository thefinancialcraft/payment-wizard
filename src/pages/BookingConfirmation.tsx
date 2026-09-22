'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { useToast } from '@/hooks/use-toast';
import { TwinklingStars } from '@/components/TwinklingStars';
import { MeteorShower } from '@/components/MeteorShower';
import { supabase } from '@/lib/supabase';

interface FormData {
  policyHolderName: string;
  contactNo: string;
  email: string;
  numberOfMembers: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  paymentDate: string;
  month: string;
  effectiveDate: string;
  nextRenewalDate: string;
  paymentMonth: string;
  insuranceCompany: string;
  planName: string;
  policyType: string;
  healthCheckup: string;
  extraBonus: string;
  tenure: string;
  premium: string;
  netPremium: string;
  discountOffer: string;
  discountOfferType: string;
  updatedPremium: string;
  employeeName: string;
  team: string;
  previousCompany: string;
  businessType: string;
  assistantTeam: string;
  relationshipManager: string;
  agentCode: string;
  proposalNo: string;
  grade: string;
  leadSource: string;
  paymentProof: string;
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate 8-digit alphanumeric ID
  const generateBookingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Convert date from DD/MM/YYYY to YYYY-MM-DD format
  const formatDateForDB = (dateString: string): string | null => {
    if (!dateString) return null;
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    
    return null;
  };

  useEffect(() => {
    // Get form data from location state
    if (location.state?.formData) {
      setFormData(location.state.formData);
    } else {
      // If no state, redirect back to form
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleConfirm = async () => {
    if (!formData) return;

    setIsSubmitting(true);

    try {
      // Generate 8-digit alphanumeric booking ID
      const newBookingId = generateBookingId();

      // Insert data into Supabase (let Supabase auto-generate UUID)
      const { error } = await supabase.from('payment_bookings').insert({
        booking_code: newBookingId,
        policy_holder_name: formData.policyHolderName,
        contact_no: formData.contactNo,
        email: formData.email,
        number_of_members: formData.numberOfMembers,
        pincode: formData.pincode,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        payment_date: formatDateForDB(formData.paymentDate),
        payment_month: formData.paymentMonth || null,
        effective_date: formatDateForDB(formData.effectiveDate),
        next_renewal_date: formatDateForDB(formData.nextRenewalDate),
        month: formData.month || null,
        insurance_company: formData.insuranceCompany,
        plan_name: formData.planName,
        policy_type: formData.policyType,
        health_checkup: formData.healthCheckup,
        extra_bonus: formData.extraBonus,
        tenure: formData.tenure,
        premium: formData.premium,
        net_premium: formData.netPremium,
        discount_offer: formData.discountOffer,
        discount_offer_type: formData.discountOfferType,
        updated_premium: formData.updatedPremium,
        employee_name: formData.employeeName,
        team: formData.team,
        previous_company: formData.previousCompany,
        business_type: formData.businessType,
        assistant_team: formData.assistantTeam,
        relationship_manager: formData.relationshipManager,
        agent_code: formData.agentCode,
        proposal_no: formData.proposalNo,
        grade: formData.grade,
        lead_source: formData.leadSource,
        payment_proof: formData.paymentProof,
      });

      if (error) {
        throw error;
      }

      // Sync to Google Sheets directly via Google Apps Script
      try {
        const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

        const syncResponse = await fetch(googleScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Required for Google Apps Script
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_id: newBookingId,
            policy_holder_name: formData.policyHolderName,
            contact_no: formData.contactNo,
            email: formData.email,
            number_of_members: formData.numberOfMembers,
            pincode: formData.pincode,
            city: formData.city,
            district: formData.district,
            state: formData.state,
            country: formData.country,
            payment_date: formData.paymentDate, // Keep original format for Google Sheets
            payment_month: formData.paymentMonth,
            effective_date: formData.effectiveDate,
            next_renewal_date: formData.nextRenewalDate,
            month: formData.month,
            insurance_company: formData.insuranceCompany,
            plan_name: formData.planName,
            policy_type: formData.policyType,
            health_checkup: formData.healthCheckup,
            extra_bonus: formData.extraBonus,
            tenure: formData.tenure,
            premium: formData.premium,
            net_premium: formData.netPremium,
            discount_offer: formData.discountOffer,
            discount_offer_type: formData.discountOfferType,
            updated_premium: formData.updatedPremium,
            employee_name: formData.employeeName,
            team: formData.team,
            previous_company: formData.previousCompany,
            business_type: formData.businessType,
            assistant_team: formData.assistantTeam,
            relationship_manager: formData.relationshipManager,
            agent_code: formData.agentCode,
            proposal_no: formData.proposalNo,
            grade: formData.grade,
            lead_source: formData.leadSource,
            payment_proof: formData.paymentProof,
            created_at: new Date().toISOString(),
          })
        });

        // Note: With no-cors, we can't read the response, but the request will still be sent
        console.log('Google Sheets sync request sent');
      } catch (syncError) {
        console.error('Error syncing to Google Sheets:', syncError);
        // Don't fail the whole process if sync fails
      }

      // Clear session storage
      sessionStorage.removeItem('paymentBookingState');
      sessionStorage.removeItem('paymentBookingTimestamp');

      // Set booking ID and show success modal
      setBookingId(newBookingId);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: `${error instanceof Error ? error.message : 'Failed to submit form. Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Navigate back with form data and current step state
    navigate('/', {
      state: {
        formData: formData,
        returnFromConfirmation: true
      }
    });
  };

  if (!formData) {
    return (
      <div style={{ height: '100svh', backgroundColor: '#0B0F17', position: 'relative', overflow: 'hidden' }}>
        <TwinklingStars />
        <MeteorShower />
        <div className="top-right-pattern"></div>
        <div className="bottom-left-pattern"></div>
        <div className="flex items-center justify-center min-h-screen p-4">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    if (!formData) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Confirmation - ${bookingId}</title>
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                font-family: Arial, sans-serif;
                padding: 0;
                margin: 0;
                line-height: 1.6;
                font-size: 12px;
              }
              .container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #9333ea;
                padding-bottom: 20px;
              }
              .header h1 {
                color: #0B0F17;
                margin: 0;
                font-size: 24px;
              }
              .booking-id {
                font-size: 18px;
                font-weight: bold;
                color: #9333ea;
                margin: 10px 0;
              }
              .section {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: #f9f9f9;
              }
              .section h3 {
                color: #333;
                margin: 0 0 15px 0;
                font-size: 16px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
              }
              .field {
                display: flex;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
              }
              .field:last-child {
                border-bottom: none;
              }
              .field-label {
                font-weight: bold;
                width: 180px;
                color: #666;
                flex-shrink: 0;
              }
              .field-value {
                color: #000;
                flex: 1;
                word-break: break-word;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 10px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Confirmation</h1>
                <div class="booking-id">Booking ID: ${bookingId}</div>
                <div style="font-size: 12px; color: #666;">Date: ${new Date().toLocaleDateString()}</div>
              </div>

              <div class="section">
                <h3>Personal Information</h3>
                <div class="field">
                  <div class="field-label">Policy Holder Name:</div>
                  <div class="field-value">${formData.policyHolderName || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Contact Number:</div>
                  <div class="field-value">${formData.contactNo || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email:</div>
                  <div class="field-value">${formData.email || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Number of Members:</div>
                  <div class="field-value">${formData.numberOfMembers || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Pincode:</div>
                  <div class="field-value">${formData.pincode || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">City:</div>
                  <div class="field-value">${formData.city || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">District:</div>
                  <div class="field-value">${formData.district || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">State:</div>
                  <div class="field-value">${formData.state || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Country:</div>
                  <div class="field-value">${formData.country || '-'}</div>
                </div>
              </div>

              <div class="section">
                <h3>Payment & Dates</h3>
                <div class="field">
                  <div class="field-label">Payment Date:</div>
                  <div class="field-value">${formData.paymentDate || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Payment Month:</div>
                  <div class="field-value">${formData.paymentMonth || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Effective Date:</div>
                  <div class="field-value">${formData.effectiveDate || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Next Renewal Date:</div>
                  <div class="field-value">${formData.nextRenewalDate || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Month:</div>
                  <div class="field-value">${formData.month || '-'}</div>
                </div>
              </div>

              <div class="section">
                <h3>Insurance Details</h3>
                <div class="field">
                  <div class="field-label">Insurance Company:</div>
                  <div class="field-value">${formData.insuranceCompany || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Plan Name:</div>
                  <div class="field-value">${formData.planName || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Policy Type:</div>
                  <div class="field-value">${formData.policyType || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Health Checkup:</div>
                  <div class="field-value">${formData.healthCheckup || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Extra Bonus:</div>
                  <div class="field-value">${formData.extraBonus || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Tenure:</div>
                  <div class="field-value">${formData.tenure || '-'}</div>
                </div>
              </div>

              <div class="section">
                <h3>Financial Information</h3>
                <div class="field">
                  <div class="field-label">Base Premium:</div>
                  <div class="field-value">₹${formData.premium || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Net Premium:</div>
                  <div class="field-value">₹${formData.netPremium || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Discount Offer:</div>
                  <div class="field-value">${formData.discountOffer || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Discount Type:</div>
                  <div class="field-value">${formData.discountOfferType || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Updated Premium:</div>
                  <div class="field-value">₹${formData.updatedPremium || '-'}</div>
                </div>
              </div>

              <div class="section">
                <h3>Business Information</h3>
                <div class="field">
                  <div class="field-label">Employee Name:</div>
                  <div class="field-value">${formData.employeeName || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Team:</div>
                  <div class="field-value">${formData.team || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Previous Company:</div>
                  <div class="field-value">${formData.previousCompany || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Business Type:</div>
                  <div class="field-value">${formData.businessType || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Assistant Team:</div>
                  <div class="field-value">${formData.assistantTeam || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Relationship Manager:</div>
                  <div class="field-value">${formData.relationshipManager || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Agent Code:</div>
                  <div class="field-value">${formData.agentCode || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Proposal No:</div>
                  <div class="field-value">${formData.proposalNo || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Grade:</div>
                  <div class="field-value">${formData.grade || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Lead Source:</div>
                  <div class="field-value">${formData.leadSource || '-'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Payment Proof:</div>
                  <div class="field-value">${formData.paymentProof ? '<a href="' + formData.paymentProof + '" target="_blank">View File</a>' : '-'}</div>
                </div>
              </div>

              <div class="footer">
                <p>This is an automatically generated booking confirmation.</p>
                <p>Booking URL: ${window.location.origin}/booking-confirmation/${bookingId}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCreateNew = () => {
    navigate('/');
  };

  return (
    <div style={{ height: '100svh', backgroundColor: '#0B0F17', position: 'relative', overflow: 'hidden' }}>
      <TwinklingStars />
      <MeteorShower />
      <div className="top-right-pattern"></div>
      <div className="bottom-left-pattern"></div>

      <style>{`
        @keyframes bg-fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .bg-fade-in {
          animation: bg-fade-in 1.5s ease-out forwards;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(128, 128, 128, 0.3) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.3);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.6);
        }
      `}</style>

      {showSuccessModal ? (
        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Created Successfully</h2>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Booking URL:</p>
              <p className="text-sm text-gray-900 break-all mb-4">
                {window.location.origin}/booking-confirmation/{bookingId}
              </p>
              <p className="text-sm text-gray-600 mb-2">Booking ID:</p>
              <p className="text-2xl font-bold text-purple-600">{bookingId}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePrint}
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Print Confirmation
              </button>
              <button
                onClick={handleCreateNew}
                className="w-full bg-white text-purple-600 border-2 border-purple-600 py-3 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                Create New Booking
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full p-4 relative z-10 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-center min-h-full">
            <ConfirmationDialog
              formData={formData}
              agreedToTerms={agreedToTerms}
              onAgreeChange={setAgreedToTerms}
              onConfirm={handleConfirm}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
