import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'orange' | 'navy' | 'gold' | 'green' | 'blue';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'orange',
  trend,
  onClick
}) => {
  const schemeMap: Record<string, { bg: string; color: string; border: string }> = {
    orange: { bg: '#FFF2EA', color: '#F37023', border: 'rgba(243, 112, 35, 0.15)' },
    navy: { bg: '#EEF4FB', color: '#0B192C', border: 'rgba(11, 25, 44, 0.15)' },
    gold: { bg: '#FFF9E6', color: '#FFB200', border: 'rgba(255, 178, 0, 0.2)' },
    green: { bg: '#ECFDF5', color: '#10B981', border: 'rgba(16, 185, 129, 0.2)' },
    blue: { bg: '#EFF6FF', color: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' }
  };

  const schemeStyles = schemeMap[colorScheme] || schemeMap.orange;

  return (
    <div
      className={`card card-hover ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {subtitle}
          </div>
        )}
        {trend && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> {trend}
          </div>
        )}
      </div>

      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: schemeStyles.bg,
          color: schemeStyles.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${schemeStyles.border}`,
          flexShrink: 0
        }}
      >
        <Icon size={26} strokeWidth={2.2} />
      </div>
    </div>
  );
};
