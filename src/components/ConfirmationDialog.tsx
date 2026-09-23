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
  viewOnly?: boolean;
  invalidFields?: string[];
}

export function ConfirmationDialog({
  formData,
  onConfirm,
  onBack,
  agreedToTerms,
  onAgreeChange,
  isSubmitting = false,
  viewOnly = false,
  invalidFields = []
}: ConfirmationDialogProps) {
  const fieldClass = (field: string) => invalidFields.includes(field)
    ? 'bg-red-50 border border-red-200 p-2 rounded h-16 flex flex-col justify-center'
    : 'bg-gray-50 p-2 rounded h-16 flex flex-col justify-center';

  const errorClass = (field: string) => invalidFields.includes(field)
    ? 'invalid-field text-red-600 text-[11px] truncate'
    : 'text-black truncate';

  const errorText = (field: string) => invalidFields.includes(field)
    ? <span className="text-red-600 text-[10px]">Required field</span>
    : null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <style>{`.confirmation-widget .bg-gray-50:has(.invalid-field) { background: #fef2f2; border: 1px solid #fecaca; }`}</style>
      <div className="confirmation-widget bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">
            {viewOnly ? 'Booking Details' : 'Confirm Your Details'}
          </h2>
          {!viewOnly && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Details */}
        <div className="space-y-4 text-sm">
          {/* Personal Information */}
          <div>
            <h3 className="font-medium text-black mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="confirmation-field bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Name</span>
                <span className={errorClass('policyHolderName')}>{formData.policyHolderName || 'Missing'}</span>
                {errorText('policyHolderName')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Contact</span>
                <span className={errorClass('contactNo')}>{formData.contactNo || 'Missing'}</span>
                {errorText('contactNo')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Email</span>
                <span className={errorClass('email')}>{formData.email || 'Missing'}</span>
                {errorText('email')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Members</span>
                <span className={errorClass('numberOfMembers')}>{formData.numberOfMembers || 'Missing'}</span>
                {errorText('numberOfMembers')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Pincode</span>
                <span className={errorClass('pincode')}>{formData.pincode || 'Missing'}</span>
                {errorText('pincode')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">City</span>
                <span className={errorClass('city')}>{formData.city || 'Missing'}</span>
                {errorText('city')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">District</span>
                <span className={errorClass('district')}>{formData.district || 'Missing'}</span>
                {errorText('district')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">State</span>
                <span className={errorClass('state')}>{formData.state || 'Missing'}</span>
                {errorText('state')}
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
                <span className={errorClass('paymentDate')}>{formData.paymentDate || 'Missing'}</span>
                {errorText('paymentDate')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Payment Month</span>
                <span className={errorClass('paymentMonth')}>{formData.paymentMonth || 'Missing'}</span>
                {errorText('paymentMonth')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Effective Date</span>
                <span className={errorClass('effectiveDate')}>{formData.effectiveDate || 'Missing'}</span>
                {errorText('effectiveDate')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Renewal Date</span>
                <span className={errorClass('nextRenewalDate')}>{formData.nextRenewalDate || 'Missing'}</span>
                {errorText('nextRenewalDate')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Month</span>
                <span className="text-black truncate">{formData.month}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Payment Mode</span>
                <span className="text-black truncate">{formData.paymentMode || 'Direct Link'}</span>
              </div>
              {(formData.paymentMode === 'PayU Link' || formData.payuRefId) && (
                <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                  <span className="text-gray-500 text-xs block">PayU Ref ID</span>
                  <span className="text-black truncate">{formData.payuRefId || 'Missing'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Insurance Details */}
          <div>
            <h3 className="font-medium text-black mb-2">Insurance Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Company</span>
                <span className={errorClass('insuranceCompany')}>{formData.insuranceCompany || 'Missing'}</span>
                {errorText('insuranceCompany')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Plan</span>
                <span className={errorClass('planName')}>{formData.planName || 'Missing'}</span>
                {errorText('planName')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Policy Type</span>
                <span className={errorClass('policyType')}>{formData.policyType || 'Missing'}</span>
                {errorText('policyType')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Health Checkup</span>
                <span className={errorClass('healthCheckup')}>{formData.healthCheckup || 'Missing'}</span>
                {errorText('healthCheckup')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Extra Bonus</span>
                <span className={errorClass('extraBonus')}>{formData.extraBonus || 'Missing'}</span>
                {errorText('extraBonus')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Tenure</span>
                <span className={errorClass('tenure')}>{formData.tenure || 'Missing'}</span>
                {errorText('tenure')}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="font-medium text-black mb-2">Financial Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Base Premium</span>
                <span className={errorClass('premium')}>₹{formData.premium || 'Missing'}</span>
                {errorText('premium')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Net Premium</span>
                <span className={errorClass('netPremium')}>₹{formData.netPremium || 'Missing'}</span>
                {errorText('netPremium')}
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
                <span className={errorClass('updatedPremium')}>₹{formData.updatedPremium || 'Missing'}</span>
                {errorText('updatedPremium')}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="font-medium text-black mb-2">Business Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Employee</span>
                <span className={errorClass('employeeName')}>{formData.employeeName || 'Missing'}</span>
                {errorText('employeeName')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Team</span>
                <span className={errorClass('team')}>{formData.team || 'Missing'}</span>
                {errorText('team')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Previous Company</span>
                <span className={errorClass('previousCompany')}>{formData.previousCompany || 'Missing'}</span>
                {errorText('previousCompany')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Business Type</span>
                <span className={errorClass('businessType')}>{formData.businessType || 'Missing'}</span>
                {errorText('businessType')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Assistant Team</span>
                <span className="text-black truncate">{formData.assistantTeam}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Relationship Manager</span>
                <span className={errorClass('relationshipManager')}>{formData.relationshipManager || 'Missing'}</span>
                {errorText('relationshipManager')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Agent Code</span>
                <span className={errorClass('agentCode')}>{formData.agentCode || 'Missing'}</span>
                {errorText('agentCode')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Proposal No.</span>
                <span className={errorClass('proposalNo')}>{formData.proposalNo || 'Missing'}</span>
                {errorText('proposalNo')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Grade</span>
                <span className={errorClass('grade')}>{formData.grade || 'Missing'}</span>
                {errorText('grade')}
              </div>
              <div className="bg-gray-50 p-2 rounded h-16 flex flex-col justify-center">
                <span className="text-gray-500 text-xs block">Lead Source</span>
                <span className={errorClass('leadSource')}>{formData.leadSource || 'Missing'}</span>
                {errorText('leadSource')}
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
                  <>
                    <span className={errorClass('paymentProof')}>{formData.paymentProof ? 'Uploaded' : 'Not uploaded'}</span>
                    {errorText('paymentProof')}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox - Hide in view-only mode */}
        {!viewOnly && (
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
        )}

        {/* Action Buttons - Hide in view-only mode */}
        {!viewOnly && (
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
        )}
      </div>
    </div>
  );
}
