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
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0F2C59 0%, #0097D7 100%)',
            border: '2px solid #F5A623',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F5A623',
            fontWeight: 900,
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(15, 44, 89, 0.3)',
            padding: '4px',
            boxSizing: 'border-box'
          }}
        >
          <img
            src={logoSvg}
            alt="Swarrnim"
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
      <img
        src={logoSvg}
        alt="Swarrnim Startup & Innovation University"
        style={{
          height: '52px',
          objectFit: 'contain',
          filter: lightMode ? 'none' : 'brightness(1.05)'
        }}
      />
    </div>
  );
};
