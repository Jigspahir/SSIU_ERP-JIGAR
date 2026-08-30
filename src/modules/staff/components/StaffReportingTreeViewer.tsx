/**
 * SSIU ERP — Supervisor & Reporting Hierarchy Tree Component
 * File: src/modules/staff/components/StaffReportingTreeViewer.tsx
 */

import React, { useState } from 'react';
import { Network, ChevronRight, ChevronDown, User, Award, Users, BookOpen } from 'lucide-react';
import { SupervisorHierarchyNodeDTO } from '../types';
import { Badge } from '../../../components/common/Badge';

interface StaffReportingTreeViewerProps {
  hierarchy: SupervisorHierarchyNodeDTO[];
}

const TreeNodeItem: React.FC<{ node: SupervisorHierarchyNodeDTO; depth?: number }> = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState<boolean>(depth < 2);
  const hasChildren = Boolean(node.children && node.children.length > 0);

  return (
    <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0, borderLeft: depth > 0 ? '2px dashed var(--border-color)' : 'none', paddingLeft: depth > 0 ? '1rem' : 0, marginTop: '0.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: depth === 0 ? 'var(--bg-light)' : '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: depth === 0 ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
            >
              {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          )}

          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: depth === 0 ? 'var(--brand-navy)' : depth === 1 ? 'var(--brand-orange)' : '#6366F1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            {depth === 0 ? 'HOI' : depth === 1 ? 'HOD' : 'FAC'}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-navy)' }}>{node.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {node.designation} &bull; {node.department}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant={node.role === 'PRINCIPAL' ? 'navy' : node.role === 'HOD' ? 'orange' : 'success'}>
            {node.role}
          </Badge>
          {node.assignedMenteesCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} /> {node.assignedMenteesCount} Mentees
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={12} /> {node.weeklyWorkloadHours} hrs/wk
          </span>
        </div>
      </div>

      {hasChildren && expanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {node.children!.map(child => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const StaffReportingTreeViewer: React.FC<StaffReportingTreeViewerProps> = ({ hierarchy }) => {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Network size={18} color="var(--brand-orange)" /> Institutional Faculty Reporting &amp; Mentorship Tree
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Hierarchical escalation and supervisory flow: Dean / Principal &rarr; Department HOD &rarr; Faculty &rarr; Assigned Mentees.
          </p>
        </div>
        <Badge variant="navy">Acyclic Hierarchy Active</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {hierarchy.map(rootNode => (
          <TreeNodeItem key={rootNode.id} node={rootNode} />
        ))}
      </div>
    </div>
  );
};
