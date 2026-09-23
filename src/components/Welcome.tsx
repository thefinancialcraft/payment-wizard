'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface SessionPreview {
  policyHolderName?: string;
  paymentDate?: string;
  premium?: string;
}

interface WelcomeProps {
  showGreeting: boolean;
  hideGreeting: boolean;
  showButtons: boolean;
  onStart: () => void;
  onUpdateBooking: () => void;
  onPremiumConversion: () => void;
  sessionPreview?: SessionPreview | null;
  onRestoreSession?: () => void;
  onCreateNewSession?: () => void;
}

export function Welcome({ showGreeting, hideGreeting, showButtons, onStart, onUpdateBooking, onPremiumConversion, sessionPreview, onRestoreSession, onCreateNewSession }: WelcomeProps) {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ padding: '0 16px' }}>
      <div className="text-center animate-fade-in-up" style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '600px',
        padding: '0',
       
      }}>
        {/* Greeting Block */}
        <div style={{
          opacity: showGreeting && !hideGreeting ? 1 : 0,
          transform: showGreeting && !hideGreeting ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          pointerEvents: showGreeting && !hideGreeting ? 'auto' : 'none'
        }}>
          <style>{`
            @keyframes fade-in-up {
              0% {
                opacity: 0;
                transform: translateY(40px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in-up {
              animation: fade-in-up 1.2s ease-out forwards;
            }
            @keyframes mirror-sweep {
              0% { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
            .mirror-text {
              background: linear-gradient(
                110deg,
                #ffffff 35%,
                rgba(255, 255, 255, 0.4) 45%,
                rgba(255, 255, 255, 0.9) 50%,
                rgba(255, 255, 255, 0.4) 55%,
                #ffffff 65%
              );
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: mirror-sweep 12s linear infinite;
            }
            .mirror-text-purple {
              background: linear-gradient(
                110deg,
                #9333ea 35%,
                rgba(147, 51, 234, 0.4) 45%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(147, 51, 234, 0.4) 55%,
                #9333ea 65%
              );
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: mirror-sweep 12s linear infinite;
            }
            @keyframes shimmer {
              0% {
                background-position: -200% center;
              }
              100% {
                background-position: 200% center;
              }
            }
            .glass-shimmer {
              position: relative;
              overflow: hidden;
            }
            .glass-shimmer::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.6) 40%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(255, 255, 255, 0.6) 60%,
                transparent 100%
              );
              background-size: 200% 100%;
              animation: shimmer 3s ease-in-out infinite;
              opacity: 0;
              transition: opacity 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.4);
              box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.1);
            }
            .glass-shimmer:hover::before {
              opacity: 1;
            }
            @media (max-width: 640px) {
              .welcome-title {
                white-space: normal !important;
                text-align: center;
              }
              .welcome-title span {
                display: block;
                margin-top: 4px;
                font-size: 1.4em;
              }
              .welcome-description {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                line-height: 1.4;
              }
            }
            @media (min-width: 641px) {
              .welcome-description {
                -webkit-line-clamp: 1;
              }
            }
            }
          `}</style>

          <h1 className="mirror-text welcome-title" style={{
            fontSize: 'clamp(26px, 5vw, 38px)',
            fontWeight: '500',
            lineHeight: '1.2',
            letterSpacing: '-1px',
            margin: '0 0 8px 0',
            whiteSpace: 'nowrap'
          }}>
            Welcome to{' '}
            <span className="mirror-text-purple" style={{ fontWeight: '700' }}>
              Payment Wizard
            </span>
          </h1>
          <p className="welcome-description" style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 'clamp(13px, 2.5vw, 13px)',
            textAlign: 'center',
            maxWidth: '100%',
            padding: '0 16px',
            margin: '8px auto 0'
          }}>
            Complete your insurance payment booking in simple, easy steps
          </p>
        </div>

        {sessionPreview && onRestoreSession && onCreateNewSession && (
          <div
            className="mt-5 w-full max-w-[540px] rounded-xl border border-cyan-400/20 bg-white/[0.06] p-4 text-left backdrop-blur-md"
            style={{
              opacity: showGreeting && !hideGreeting ? 1 : 0,
              transform: showGreeting && !hideGreeting ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
              pointerEvents: showGreeting && !hideGreeting ? 'auto' : 'none'
            }}
          >
            <p className="text-sm font-semibold text-white">Resume your saved booking?</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-white/70 sm:grid-cols-3">
              <div><span className="block text-white/40">Proposer</span>{sessionPreview.policyHolderName || 'Not entered'}</div>
              <div><span className="block text-white/40">Payment Date</span>{sessionPreview.paymentDate || 'Not entered'}</div>
              <div><span className="block text-white/40">Premium</span>{sessionPreview.premium ? `₹${sessionPreview.premium}` : 'Not entered'}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={onRestoreSession} className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400">Restore Session</Button>
              <Button onClick={onCreateNewSession} variant="outline" className="flex-1 border-red-400/30 text-red-300 hover:bg-red-400/10">Remove</Button>
            </div>
          </div>
        )}

        {/* Action Buttons - Show after greeting animation */}
        <div style={{
          opacity: showButtons && !hideGreeting ? 1 : 0,
          transition: 'opacity 0.6s ease-in',
          pointerEvents: showButtons && !hideGreeting ? 'auto' : 'none',
          marginTop: '24px',
          width: '100%',
          maxWidth: '540px',
          padding: '0 16px'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}>
            <Button
              onClick={onUpdateBooking}
              variant="outline"
              className="glass-shimmer"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 16px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                flex: '1',
                minWidth: '130px'
              }}
            >
              Update Booking
            </Button>
            <Button
              onClick={onPremiumConversion}
              variant="outline"
              className="glass-shimmer hover:opacity-90"
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                padding: '8px 16px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                flex: '1',
                minWidth: '150px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
             
              Premium Conversion
            </Button>
            <Button
              onClick={onStart}
              variant="default"
              className="glass-shimmer"
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                flex: '1',
                minWidth: '130px'
              }}
            >
              Create New One
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
