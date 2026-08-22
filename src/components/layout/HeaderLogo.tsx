import React from 'react';
import logoSvg from '../../assets/SSIUlogo.png';

interface HeaderLogoProps {
  collapsed?: boolean;
  lightMode?: boolean;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ collapsed = false, lightMode = false }) => {
  if (collapsed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} title="Swarrnim Startup & Innovation University">
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0B192C 0%, #183B70 100%)',
            border: '1.5px solid var(--brand-orange, #F37023)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            boxSizing: 'border-box'
          }}
        >
          <img
            src={logoSvg}
            alt="SSIU"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.2rem 0', minWidth: 0, overflow: 'hidden' }}>
      <img
        src={logoSvg}
        alt="Swarrnim Startup & Innovation University"
        style={{
          height: '42px',
          width: 'auto',
          objectFit: 'contain',
          filter: lightMode ? 'none' : 'brightness(1.05)',
          flexShrink: 0
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.6px', textTransform: 'uppercase', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          SWARRNIM
        </div>
        <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--brand-gold, #F5A623)', letterSpacing: '0.4px', textTransform: 'uppercase', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          STARTUP & INNOVATION UNIVERSITY
        </div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.2px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          SSIU ERP • University Management
        </div>
      </div>
    </div>
  );
};
