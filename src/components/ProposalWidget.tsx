'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProposalWidgetProps {
  onSelect: (proposalData: any) => void;
  onCancel: () => void;
  businessType: string;
  insuranceCompany: string;
}

export function ProposalWidget({ onSelect, onCancel, businessType, insuranceCompany }: ProposalWidgetProps) {
  const [proposalNo, setProposalNo] = useState('');
  const [filteredProposals, setFilteredProposals] = useState<any[]>([]);
  const [isLoadingFaveoData, setIsLoadingFaveoData] = useState(false);
  const [showProposalDropdown, setShowProposalDropdown] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search proposals live from database when user types 3+ characters
  const handleProposalInputChange = async (value: string) => {
    setProposalNo(value);
    setProposalError(''); // Clear error on input

    if (value.length >= 3) {
      setIsLoadingFaveoData(true);
      try {
        const { data: records, error } = await supabase
          .from('faveo_data')
          .select('proposal_no, customer_name, payment_amount, proposal_status, no_of_lives, policy_start_date, plan, business_type, agent_name')
          .not('proposal_status', 'like', '%Mark for Cancellation Task%')
          .in('business_type', ['NEWBUSINESS', 'PORTABILITY'])
          .or(`proposal_no.ilike.%${value}%,customer_name.ilike.%${value}%`)
          .order('proposal_no')
          .limit(10);

        if (error) throw error;

        // Check which proposals already exist in payment_bookings
        const proposalNumbers = (records || []).map(r => r.proposal_no);
        let existingProposals: string[] = [];
        
        if (proposalNumbers.length > 0) {
          const { data: existingBookings } = await supabase
            .from('payment_bookings')
            .select('proposal_no')
            .in('proposal_no', proposalNumbers);
          
          existingProposals = (existingBookings || []).map(b => b.proposal_no);
        }

        // Add existing flag to each proposal
        const enrichedRecords = (records || []).map(record => ({
          ...record,
          alreadyBooked: existingProposals.includes(record.proposal_no)
        }));

        setFilteredProposals(enrichedRecords);
        setShowProposalDropdown(enrichedRecords.length > 0);
      } catch (error) {
        console.error('Error searching proposals:', error);
        setFilteredProposals([]);
        setShowProposalDropdown(false);
      } finally {
        setIsLoadingFaveoData(false);
      }
    } else {
      setFilteredProposals([]);
      setShowProposalDropdown(false);
    }
  };

  const handleProposalSelect = (proposalData: any) => {
    // Prevent selecting already booked proposals
    if (proposalData.alreadyBooked) {
      setProposalError('This proposal is already booked. Please select a different proposal.');
      return;
    }
    
    setProposalNo(proposalData.proposal_no);
    setProposalError(''); // Clear error when selecting from dropdown
    setShowProposalDropdown(false);
  };

  const handleSubmit = () => {
    if (shouldRequireProposal) {
      const isValid = proposalNo.trim() && filteredProposals.some(p => p.proposal_no.toLowerCase() === proposalNo.trim().toLowerCase());
      if (!isValid) {
        setProposalError('Please select a valid proposal from the dropdown');
        return;
      }
    }

    if (proposalNo.trim()) {
      // Find the selected proposal data from filtered results
      const selectedProposal = filteredProposals.find(p => p.proposal_no.toLowerCase() === proposalNo.trim().toLowerCase());
      
      // Check if the selected proposal is already booked
      if (selectedProposal?.alreadyBooked) {
        setProposalError('This proposal is already booked. Please select a different proposal.');
        return;
      }
      
      onSelect(selectedProposal || { proposalNo: proposalNo });
    }
  };

  // Check if both conditions are met
  const shouldRequireProposal = businessType === 'In House' && insuranceCompany === 'Care Health Insurance';
  const isProposalValid = proposalNo.trim() && filteredProposals.some(p => p.proposal_no.toLowerCase() === proposalNo.trim().toLowerCase());
  const selectedProposal = filteredProposals.find(p => p.proposal_no.toLowerCase() === proposalNo.trim().toLowerCase());
  const isProposalAlreadyBooked = selectedProposal?.alreadyBooked;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProposalDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProposalDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div style={{
        position: 'absolute',
        opacity: 1,
        transform: 'translateY(0px) scale(1)',
        transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        pointerEvents: 'auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <style>{`
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .minimal-input {
            background-color: transparent;
            border: none;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 24px;
            font-weight: 500;
            padding: 8px 4px;
            outline: none;
            text-align: center;
            transition: border-color 0.3s;
            width: 240px;
            display: block;
            margin: 0 auto 40px;
          }
          .minimal-input:focus {
            border-bottom-color: rgba(255, 255, 255, 0.5);
          }
          .minimal-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }
          .mirror-btn {
            background-color: rgba(52, 187, 136, 0.15);
            color: #34BB88;
            border: 1px solid rgba(52, 187, 136, 0.3);
            border-radius: 30px;
            backdrop-filter: blur(10px);
          }
        `}</style>

        <div style={{
          animation: 'fade-in-up 0.5s ease 0s 1 normal none running',
          width: '100%',
          maxWidth: '300px',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '15px',
            fontWeight: '400',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Enter Proposal No.
          </p>

          <div className="relative" ref={dropdownRef}>
            <input
              placeholder="e.g. ABC123456"
              className="minimal-input"
              type="text"
              value={proposalNo}
              onChange={(e) => handleProposalInputChange(e.target.value)}
            />
            {showProposalDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                background: 'rgba(20, 20, 20, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                zIndex: 50,
                maxHeight: '300px',
                overflowY: 'auto',
                width: '300px'
              }}>
                {isLoadingFaveoData ? (
                  <div style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    justifyContent: 'center'
                  }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading proposals...
                  </div>
                ) : filteredProposals.length > 0 ? (
                  filteredProposals.map((item) => (
                    <div
                      key={item.proposal_no}
                      onClick={() => handleProposalSelect(item)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'background 0.2s ease',
                        backgroundColor: item.alreadyBooked ? 'rgba(239, 68, 68, 0.2)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = item.alreadyBooked 
                          ? 'rgba(239, 68, 68, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = item.alreadyBooked 
                          ? 'rgba(239, 68, 68, 0.2)' 
                          : 'transparent';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: item.alreadyBooked ? '#fca5a5' : 'white'
                          }}>
                            {item.proposal_no}
                          </span>
                          {item.alreadyBooked && (
                            <span style={{
                              fontSize: '9px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              Already Booked
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontSize: '11px',
                          color: item.alreadyBooked ? 'rgba(252, 165, 165, 0.8)' : 'rgba(255, 255, 255, 0.6)'
                        }}>
                          {item.customer_name} - ₹{item.payment_amount}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '16px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textAlign: 'center'
                  }}>
                    No matching proposals found
                  </div>
                )}
              </div>
            )}
          </div>

          {proposalError && (
            <p style={{
              color: 'rgba(255, 100, 100, 0.8)',
              fontSize: '12px',
              fontWeight: '400',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              {proposalError}
            </p>
          )}

          {filteredProposals.some(p => p.alreadyBooked) && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '8px 12px',
              marginTop: '8px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#fca5a5',
                fontSize: '11px',
                fontWeight: '500',
                margin: '0'
              }}>
               You have selected a proposal that is already booked. Please choose a different proposal from the list.
              </p>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={shouldRequireProposal ? (!isProposalValid || !!proposalError || isProposalAlreadyBooked) : !proposalNo.trim()}
              className="mirror-btn"
              style={{
                padding: '10px 24px',
                backgroundColor: (shouldRequireProposal ? (isProposalValid && !proposalError && !isProposalAlreadyBooked) : proposalNo.trim())
                  ? 'rgba(52, 187, 136, 0.15)'
                  : 'rgba(52, 187, 136, 0.05)',
                color: '#34BB88',
                border: '1px solid rgba(52, 187, 136, 0.3)',
                borderRadius: '30px',
                fontWeight: '500',
                cursor: (shouldRequireProposal ? (isProposalValid && !proposalError && !isProposalAlreadyBooked) : proposalNo.trim()) ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                backdropFilter: 'blur(10px)',
                opacity: (shouldRequireProposal ? (isProposalValid && !proposalError && !isProposalAlreadyBooked) : proposalNo.trim()) ? 1 : 0.5
              }}
            >
              Next
            </button>
          </div>

          {shouldRequireProposal && (
            <p style={{
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: '400',
              marginTop: '36px',
              textAlign: 'center',
              lineHeight: '1.5',
              maxWidth: '280px',
              margin: '16px auto'
            }}>
              Your payment should be under payment entry task. If you are not able to find proposal no, update your team leader to fetch payment in extension from faveo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
