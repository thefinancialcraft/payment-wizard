'use client';
import React from 'react';
import { Card } from '@/components/ui/card';

interface InsuranceCompanySelectProps {
  onSelect: (company: string) => void;
  onCancel: () => void;
}

export function InsuranceCompanySelect({ onSelect, onCancel }: InsuranceCompanySelectProps) {
  const companies = [
    {
      id: 'care',
      name: 'Care Health Insurance',
      image: '/care.jfif'
    },
    {
      id: 'niva',
      name: 'Niva Bupa Health Insurance',
      image: '/niva.jpg'
    },
    {
      id: 'star',
      name: 'Star Health Insurance',
      image: '/star.png'
    },
    {
      id: 'other',
      name: 'Other Insurance',
      image: '/others.jpg'
    }
  ];



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
          @keyframes metallic-shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          .company-card {
            transition: all 0.3s ease;
          }
          .company-card:hover {
            transform: scale(1.08);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          .metallic-text {
            animation: metallic-shimmer 3s linear infinite;
          }
        `}</style>

        <div style={{
          animation: 'fade-in-up 0.5s ease 0s 1 normal none running',
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h2 className="metallic-text" style={{
            fontSize: '22px',
            fontWeight: '500',
            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 25%, #ffffff 50%, #d0d0d0 75%, #ffffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '24px',
            letterSpacing: '-0.5px',
            fontFamily: 'Lufga, sans-serif',
            textAlign: 'center'
          }}>
            Select Insurance Company
          </h2>

          <div style={{
            display: 'flex',
            gap: '40px',
            maxWidth: '800px',
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => onSelect(company.name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '120px'
                }}
              >
                <Card
                  className="company-card"
                  style={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}
                >
                  <img
                    src={company.image}
                    alt={company.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Card>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '400',
                  color: 'white',
                  textAlign: 'center',
                  margin: '0'
                }}>
                  {company.name}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onCancel}
            style={{
              marginTop: '32px',
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
        </div>
      </div>
    </div>
  );
}
