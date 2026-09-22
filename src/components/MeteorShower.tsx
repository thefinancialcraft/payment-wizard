'use client';
import React from 'react';

export function MeteorShower() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
      {/* Meteor 1 (Main - Center) */}
      <div className="meteor-falling" style={{ position: 'absolute', top: '-15px', right: '25%', width: '3px', height: '100px', transformOrigin: 'bottom center', '--m-scale': 1, '--m-opacity': 0.6, '--m-duration': '4s', '--m-delay': '1s' } as React.CSSProperties}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
        <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
      </div>
      
      {/* Meteor 2 (Left) */}
      <div className="meteor-falling" style={{ position: 'absolute', top: '15px', right: '35%', width: '3px', height: '70px', transformOrigin: 'bottom center', '--m-scale': 0.7, '--m-opacity': 0.4, '--m-duration': '5s', '--m-delay': '2.5s' } as React.CSSProperties}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
        <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
      </div>

      {/* Meteor 3 (Right) */}
      <div className="meteor-falling" style={{ position: 'absolute', top: '-30px', right: '15%', width: '3px', height: '80px', transformOrigin: 'bottom center', '--m-scale': 0.8, '--m-opacity': 0.5, '--m-duration': '6s', '--m-delay': '4s' } as React.CSSProperties}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', borderRadius: '10px' }} />
        <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
      </div>
    </div>
  );
}