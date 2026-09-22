'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface FormContainerProps {
  currentStep: number;
  steps: Array<{
    id: number;
    title: string;
    icon: any;
    description: string;
  }>;
  progress: number;
  renderStepContent: () => React.ReactNode;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  onStepClick?: (stepId: number) => void;
  onReset?: () => void;
}

export function FormContainer({
  currentStep,
  steps,
  progress,
  renderStepContent,
  onPrevStep,
  onNextStep,
  onSubmit,
  onStepClick,
  onReset
}: FormContainerProps) {
  return (
    <div style={{
      animation: 'formFadeIn 0.8s ease-out forwards'
    }}>
      <style>{`
        @keyframes mirror-sweep {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes formFadeIn {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .mirror-text {
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
          animation: mirror-sweep 8s linear infinite;
        }
        @media (max-width: 640px) {
          .form-title {
            white-space: normal !important;
            text-align: center;
          }
          .form-description {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.4;
          }
          .category-title {
            font-size: 18px !important;
          }
        }
        @media (min-width: 641px) {
          .form-description {
            -webkit-line-clamp: 1;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 mt-12 animate-fade-in" style={{ padding: '0 16px' }}>
          <h1 className="mirror-text form-title text-4xl font-bold mb-2" style={{
            fontSize: 'clamp(26px, 5vw, 36px)',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-1px',
            margin: '0 0 8px 0',
            whiteSpace: 'nowrap'
          }}>
            Payment Booking Form
          </h1>
          <p className="form-description text-muted-foreground text-lg" style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            textAlign: 'center',
            maxWidth: '100%',
            padding: '0 16px',
            margin: '8px auto 0'
          }}>
            Complete your payment booking in easy steps
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 animate-slide-in" style={{
          background: 'rgba(20, 20, 20, 0.0)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent className="p-6" style={{ background: 'transparent' }}>
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
                    style={{ cursor: onStepClick ? 'pointer' : 'default' }}
                    onClick={() => onStepClick && onStepClick(step.id)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-success text-white'
                          : isActive
                            ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                            : 'bg-muted text-muted-foreground'
                      } ${onStepClick ? 'hover:scale-110' : ''}`}
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
        <Card className="animate-fade-in mb-8" style={{
          background: 'rgba(20, 20, 20, 0.0)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardHeader style={{ background: 'transparent' }}>
            <CardTitle className="category-title flex items-center gap-3 text-2xl" style={{
              fontSize: 'clamp(18px, 4vw, 24px)'
            }}>
              {React.createElement(steps[currentStep - 1].icon, {
                className: "w-7 h-7 text-primary",
                style: { width: 'clamp(20px, 4vw, 28px)', height: 'clamp(20px, 4vw, 28px)' }
              })}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6" style={{ background: 'transparent' }}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/20" style={{ background: 'transparent' }}>
              {currentStep === 1 ? (
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  Reset
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={onPrevStep}
                  className="flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}

              {currentStep === steps.length ? (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={onSubmit}
                  className="flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  <CreditCard className="w-4 h-4" />
                  Submit Form
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={onNextStep}
                  className="flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                    border: 'none',
                    color: 'white'
                  }}
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
