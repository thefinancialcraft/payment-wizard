'use client';
import React, { FormEvent, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CheckBookingWidgetProps {
  onCancel: () => void;
  onCheckBooking: (bookingId: string) => Promise<void>;
}

export function CheckBookingWidget({ onCancel, onCheckBooking }: CheckBookingWidgetProps) {
  const [bookingId, setBookingId] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedBookingId = bookingId.trim();

    if (!trimmedBookingId) {
      setError('Please enter your booking ID.');
      return;
    }

    setError('');
    setIsChecking(true);
    try {
      await onCheckBooking(trimmedBookingId);
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : 'Booking ID was not found.');
      setIsChecking(false);
    }
  };

  return (
    <div className="check-booking-widget flex min-h-screen items-center justify-center px-4">
      <style>{`
        @keyframes check-booking-enter {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .check-booking-widget .check-booking-panel {
          animation: check-booking-enter 650ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .check-booking-widget .check-booking-panel { animation: none; }
        }
      `}</style>
      <div className="check-booking-panel w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.08] p-6 text-white shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
            <Search className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold">Check Booking</h2>
          <p className="mt-2 text-sm text-white/60">Enter your booking ID to view your booking details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="booking-id" className="mb-2 block text-sm font-medium text-white/80">
              Booking ID
            </label>
            <Input
              id="booking-id"
              value={bookingId}
              onChange={(event) => {
                setBookingId(event.target.value);
                if (error) setError('');
              }}
              placeholder="Enter booking ID"
              autoComplete="off"
              className="border-white/20 bg-black/20 text-white placeholder:text-white/35"
            />
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </div>
          <Button type="submit" disabled={isChecking} className="w-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60">
            {isChecking ? 'Checking...' : 'Check Booking'}
          </Button>
        </form>
      </div>
    </div>
  );
}