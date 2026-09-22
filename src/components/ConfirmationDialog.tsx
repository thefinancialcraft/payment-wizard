'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, CreditCard } from 'lucide-react';

interface ConfirmationDialogProps {
  formData: any;
  onConfirm: () => void;
  onBack: () => void;
  agreedToTerms: boolean;
  onAgreeChange: (checked: boolean) => void;
  isSubmitting?: boolean;
}

export function ConfirmationDialog({
  formData,
  onConfirm,
  onBack,
  agreedToTerms,
  onAgreeChange,
  isSubmitting = false
}: ConfirmationDialogProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="confirmation-widget bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Confirm Your Details</h2>
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Details */}
        <div className="space-y-4 text-sm">
          {/* Personal Information */}
          <div>
            <h3 className="font-medium text-black mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Name</span>
                <span className="text-black truncate">{formData.policyHolderName}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Contact</span>
                <span className="text-black truncate">{formData.contactNo}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Email</span>
                <span className="text-black truncate">{formData.email}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Members</span>
                <span className="text-black truncate">{formData.numberOfMembers}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Pincode</span>
                <span className="text-black truncate">{formData.pincode}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">City</span>
                <span className="text-black truncate">{formData.city}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">District</span>
                <span className="text-black truncate">{formData.district}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">State</span>
                <span className="text-black truncate">{formData.state}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Country</span>
                <span className="text-black truncate">{formData.country}</span>
              </div>
            </div>
          </div>

          {/* Payment & Dates */}
          <div>
            <h3 className="font-medium text-black mb-2">Payment & Dates</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Payment Date</span>
                <span className="text-black truncate">{formData.paymentDate}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Payment Month</span>
                <span className="text-black truncate">{formData.paymentMonth}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Effective Date</span>
                <span className="text-black truncate">{formData.effectiveDate}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Renewal Date</span>
                <span className="text-black truncate">{formData.nextRenewalDate}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Month</span>
                <span className="text-black truncate">{formData.month}</span>
              </div>
            </div>
          </div>

          {/* Insurance Details */}
          <div>
            <h3 className="font-medium text-black mb-2">Insurance Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Company</span>
                <span className="text-black truncate">{formData.insuranceCompany}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Plan</span>
                <span className="text-black truncate">{formData.planName}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Policy Type</span>
                <span className="text-black truncate">{formData.policyType}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Health Checkup</span>
                <span className="text-black truncate">{formData.healthCheckup}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Extra Bonus</span>
                <span className="text-black truncate">{formData.extraBonus}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Tenure</span>
                <span className="text-black truncate">{formData.tenure}</span>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="font-medium text-black mb-2">Financial Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Base Premium</span>
                <span className="text-black truncate">₹{formData.premium}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Net Premium</span>
                <span className="text-black truncate">₹{formData.netPremium}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Discount</span>
                <span className="text-black truncate">{formData.discountOffer}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Discount Type</span>
                <span className="text-black truncate">{formData.discountOfferType}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Final Premium</span>
                <span className="text-black truncate">₹{formData.updatedPremium}</span>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="font-medium text-black mb-2">Business Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Employee</span>
                <span className="text-black truncate">{formData.employeeName}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Team</span>
                <span className="text-black truncate">{formData.team}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Previous Company</span>
                <span className="text-black truncate">{formData.previousCompany}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Business Type</span>
                <span className="text-black truncate">{formData.businessType}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Assistant Team</span>
                <span className="text-black truncate">{formData.assistantTeam}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Relationship Manager</span>
                <span className="text-black truncate">{formData.relationshipManager}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Agent Code</span>
                <span className="text-black truncate">{formData.agentCode}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Proposal No.</span>
                <span className="text-black truncate">{formData.proposalNo}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Grade</span>
                <span className="text-black truncate">{formData.grade}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Lead Source</span>
                <span className="text-black truncate">{formData.leadSource}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Payment Proof</span>
                {formData.paymentProof && formData.paymentProof.startsWith('http') ? (
                  <a 
                    href={formData.paymentProof} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 text-xs hover:underline truncate"
                  >
                    View File
                  </a>
                ) : (
                  <span className="text-black truncate">{formData.paymentProof ? 'Uploaded' : 'Not uploaded'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded">
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreement"
              checked={agreedToTerms}
              onCheckedChange={onAgreeChange}
              className="mt-0.5"
            />
            <label
              htmlFor="agreement"
              className="text-xs text-gray-700 cursor-pointer leading-tight"
            >
              <span className="font-medium">I agree</span> that all the details filled by me are correct and I have verified them myself.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={onBack}
            className="flex items-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!agreedToTerms || isSubmitting}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Confirm & Submit
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
