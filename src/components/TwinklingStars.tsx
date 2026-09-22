'use client';
import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  twinkleDuration: number;
  twinkleDelay: number;
  moveDuration: number;
  moveDelay: number;
  moveX: number;
  moveY: number;
}

export function TwinklingStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starCount = 200;
    const newStars: Star[] = [];
    const colors = ['#ffffff', 'rgba(147, 51, 234, 0.8)', '#ffffff', 'rgba(147, 51, 234, 0.6)'];

    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.floor(Math.random() * 1) + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleDuration: Math.random() * 1 + 2,
        twinkleDelay: Math.random() * 1,
        moveDuration: Math.random() * 20 + 20,
        moveDelay: Math.random() * 10,
        moveX: (Math.random() - 0.5) * 100,
        moveY: (Math.random() - 0.5) * 100,
      });
    }
    setStars(newStars);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <style>{`
        @keyframes random-twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        ${stars.map(star => `
          @keyframes drift-${star.id} {
            0% { transform: translate(0px, 0px); }
            50% { transform: translate(${star.moveX}px, ${star.moveY}px); }
            100% { transform: translate(0px, 0px); }
          }
        `).join('\n')}
      `}</style>
      
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            top: `${star.y}%`,
            left: `${star.x}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            borderRadius: '50%',
            opacity: 0.3,
            animation: `random-twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite alternate, drift-${star.id} ${star.moveDuration}s ease-in-out ${star.moveDelay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
