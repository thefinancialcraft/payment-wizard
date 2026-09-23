'use client';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

export interface UpdateBookingData {
  bookingId: string;
  proposalNo: string;
  proposerName: string;
  basePremium: string;
}

interface UpdateBookingWidgetProps {
  booking: UpdateBookingData;
  onCancel: () => void;
  onUpdate: (proposalNo: string) => Promise<void>;
}

export function UpdateBookingWidget({ booking, onCancel, onUpdate }: UpdateBookingWidgetProps) {
  const [proposalNo, setProposalNo] = useState('');
  const [isProposalSelected, setIsProposalSelected] = useState(false);
  const [invalidProposalNo, setInvalidProposalNo] = useState('');
  const [filteredProposals, setFilteredProposals] = useState<any[]>([]);
  const [showProposalDropdown, setShowProposalDropdown] = useState(false);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const proposalDropdownRef = useRef<HTMLDivElement>(null);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (proposalDropdownRef.current && !proposalDropdownRef.current.contains(event.target as Node)) {
        setShowProposalDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleProposalInputChange = async (value: string) => {
    setProposalNo(value);
    setIsProposalSelected(false);
    setInvalidProposalNo('');
    if (error) setError('');

    if (value.trim().length < 4) {
      setFilteredProposals([]);
      setShowProposalDropdown(false);
      return;
    }

    const searchTerm = value.trim().replace(/[%,()]/g, '');
    if (!searchTerm) {
      setFilteredProposals([]);
      setShowProposalDropdown(false);
      return;
    }

    const requestId = ++searchRequestRef.current;
    setIsLoadingProposals(true);
    setShowProposalDropdown(true);

    const { data, error: fetchError } = await supabase
      .from('faveo_data')
      .select('proposal_no, customer_name, payment_amount, proposal_status')
      .not('proposal_status', 'like', '%Mark for Cancellation Task%')
      .or(`proposal_no.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`)
      .order('proposal_no')
      .limit(5);

    if (requestId !== searchRequestRef.current) return;

    setFilteredProposals(fetchError ? [] : data || []);
    setIsLoadingProposals(false);
  };

  const handleProposalSelect = (value: string) => {
    setProposalNo(value);
    setIsProposalSelected(true);
    setInvalidProposalNo('');
    setShowProposalDropdown(false);
    if (error) setError('');
  };

  const normalizeMatchValue = (value: unknown) => String(value ?? '').trim().toLowerCase();

  const handleProposalRowSelect = (item: any) => {
    const proposerMatches = normalizeMatchValue(item.customer_name) === normalizeMatchValue(booking.proposerName);
    const premiumMatches = normalizeMatchValue(item.payment_amount) === normalizeMatchValue(booking.basePremium);

    if (!proposerMatches || !premiumMatches) {
      setIsProposalSelected(false);
      setInvalidProposalNo(item.proposal_no);
      setError('Proposer Name and Base Premium do not match this booking.');
      return;
    }

    handleProposalSelect(item.proposal_no);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedProposalNo = proposalNo.trim();

    if (!trimmedProposalNo) {
      setError('Please enter the new proposal number.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onUpdate(trimmedProposalNo);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update this booking.');
      setIsSaving(false);
    }
  };

  return (
    <div className="update-booking-widget flex min-h-screen items-center justify-center px-4">
      <style>{`
        @keyframes update-booking-enter {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .update-booking-widget .update-booking-panel {
          animation: update-booking-enter 650ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @keyframes invalid-proposal-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
        }
        .update-booking-widget .invalid-proposal-row {
          animation: invalid-proposal-shake 420ms ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .update-booking-widget .update-booking-panel,
          .update-booking-widget .invalid-proposal-row { animation: none; }
        }
      `}</style>
      <div className="update-booking-panel w-full max-w-lg rounded-2xl border border-white/15 bg-white/[0.08] p-6 text-white shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h2 className="text-2xl font-semibold">Update Booking</h2>
        <p className="mt-2 text-sm text-white/60">Booking ID: {booking.bookingId}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <span className="block text-xs text-white/45">Old Proposal No.</span>
            <span className="mt-1 block truncate text-sm font-medium">{booking.proposalNo || '-'}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <span className="block text-xs text-white/45">Proposer Name</span>
            <span className="mt-1 block truncate text-sm font-medium">{booking.proposerName || '-'}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <span className="block text-xs text-white/45">Base Premium</span>
            <span className="mt-1 block truncate text-sm font-medium">{booking.basePremium ? `₹${booking.basePremium}` : '-'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div ref={proposalDropdownRef} className="relative">
            <label htmlFor="new-proposal-no" className="mb-2 block text-sm font-medium text-white/80">
              Enter New Proposal No.
            </label>
            <Input
              id="new-proposal-no"
              value={proposalNo}
              onClick={() => setShowProposalDropdown(false)}
              onChange={(event) => handleProposalInputChange(event.target.value)}
              placeholder="Enter new proposal number"
              autoComplete="off"
              className="border-white/20 bg-black/20 text-white placeholder:text-white/35"
            />
            {showProposalDropdown && (
              <div className="absolute left-[-8px] right-[-8px] z-50 mt-1 rounded-md border border-white/15 bg-slate-900 p-1 shadow-lg">
                {isLoadingProposals ? (
                  <div className="p-3 text-sm text-white/55">Loading proposals...</div>
                ) : filteredProposals.length > 0 ? (
                  filteredProposals.map((item) => (
                    <button
                      type="button"
                      key={item.proposal_no}
                      onClick={() => handleProposalRowSelect(item)}
                      className={`block w-full border-b p-3 text-left last:border-0 ${
                        invalidProposalNo === item.proposal_no
                          ? 'invalid-proposal-row border-red-400/80 bg-red-500/15 hover:bg-red-500/20'
                          : 'border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="block text-sm font-medium text-white">{item.proposal_no}</span>
                      <span className="block text-xs text-white/55">
                        {item.customer_name || 'Unknown proposer'}{item.payment_amount ? ` - ₹${item.payment_amount}` : ''}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-white/55">No matching proposals found</div>
                )}
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </div>
          <Button type="submit" disabled={isSaving || !isProposalSelected} className="w-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-35">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Updating...' : isProposalSelected ? 'Update Booking' : 'Select Proposal First'}
          </Button>
        </form>
      </div>
    </div>
  );
}
