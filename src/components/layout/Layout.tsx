'use client';
import React, { useRef } from 'react';
import { TwinklingStars } from '../TwinklingStars';
import { MeteorShower } from '../MeteorShower';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Expose scroll function to window
  React.useEffect(() => {
    (window as any).scrollToTop = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
  }, []);

  return (
    <div style={{ height: '100svh', backgroundColor: '#0B0F17', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-fade-in">
        <TwinklingStars />
        <MeteorShower />
        <div className="top-right-pattern"></div>
        <div className="bottom-left-pattern"></div>
      </div>

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

      <div ref={scrollContainerRef} className="h-full p-4 relative z-10 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
