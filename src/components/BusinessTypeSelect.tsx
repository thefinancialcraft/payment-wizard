'use client';
import React, { useState, useEffect, useRef } from 'react';

interface BusinessTypeSelectProps {
  onSelect: (businessType: string) => void;
  onCancel: () => void;
}

export function BusinessTypeSelect({ onSelect, onCancel }: BusinessTypeSelectProps) {
  const businessTypes = [
    'Source In',
    'In House',
    'Source Out'
  ];

  const [selectedValue, setSelectedValue] = useState('In House');
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 44;

  useEffect(() => {
    if (containerRef.current) {
      const initialIndex = businessTypes.indexOf(selectedValue);
      if (initialIndex !== -1) {
        containerRef.current.scrollTop = initialIndex * itemHeight;
      }
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollY = containerRef.current.scrollTop;
    const index = Math.round(scrollY / itemHeight);

    if (businessTypes[index] && businessTypes[index] !== selectedValue) {
      setSelectedValue(businessTypes[index]);
    }
  };

  const handleContinue = () => {
    onSelect(selectedValue);
  };

  const handleItemClick = (item: string) => {
    const idx = businessTypes.indexOf(item);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: idx * itemHeight,
        behavior: 'smooth'
      });
    }
    onSelect(item);
  };

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
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .metallic-text {
            animation: metallic-shimmer 3s linear infinite;
          }
        `}</style>

        <div style={{
          animation: 'fade-in-up 0.5s ease 0s 1 normal none running',
          width: '100%',
          maxWidth: '300px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '40px' }}>
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
              Select Business Type
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: '180px',
                height: `${itemHeight * 3}px`,
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: `${itemHeight}px`,
                  transform: 'translateY(-50%)',
                  borderTop: '1px solid rgba(52, 187, 136, 0.3)',
                  borderBottom: '1px solid rgba(52, 187, 136, 0.3)',
                  backgroundColor: 'rgba(52, 187, 136, 0.05)',
                  pointerEvents: 'none',
                  borderRadius: '8px',
                  zIndex: 1
                }}></div>
                <div
                  ref={containerRef}
                  onScroll={handleScroll}
                  className="hide-scrollbar"
                  style={{
                    height: '100%',
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    position: 'relative',
                    zIndex: 2,
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)',
                    maskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)'
                  }}
                >
                  <div style={{ height: `${itemHeight}px` }}></div>
                  {businessTypes.map((item) => (
                    <div
                      key={item}
                      onClick={() => handleItemClick(item)}
                      style={{
                        height: `${itemHeight}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        scrollSnapAlign: 'center',
                        fontSize: item === selectedValue ? '22px' : '13px',
                        fontWeight: item === selectedValue ? '600' : '400',
                        color: item === selectedValue ? 'var(--color-green, #34BB88)' : 'rgba(255, 255, 255, 0.15)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      {item}
                    </div>
                  ))}
                  <div style={{ height: `${itemHeight}px` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
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
              onClick={handleContinue}
              style={{
                padding: '10px 24px',
                backgroundColor: 'rgba(52, 187, 136, 0.15)',
                color: 'var(--color-green, #34BB88)',
                border: '1px solid rgba(52, 187, 136, 0.3)',
                borderRadius: '30px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '13px',
                backdropFilter: 'blur(10px)'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
