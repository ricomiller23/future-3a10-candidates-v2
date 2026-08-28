'use client';

import React from 'react';
import { DataMode } from '@/lib/types/domain';
import { ShieldCheck, ShieldAlert, FileText, AlertTriangle, XCircle } from 'lucide-react';

interface DataModeBadgeProps {
  mode: DataMode;
  confidence?: number;
  size?: 'sm' | 'md';
}

export function DataModeBadge({ mode, confidence, size = 'sm' }: DataModeBadgeProps) {
  const configs: Record<DataMode, { label: string; bg: string; text: string; border: string; icon: any }> = {
    LIVE_VERIFIED: {
      label: 'Live Verified',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      icon: ShieldCheck
    },
    LIVE_PARTIAL: {
      label: 'Live Partial',
      bg: 'bg-blue-950/60',
      text: 'text-blue-300',
      border: 'border-blue-500/40',
      icon: FileText
    },
    CURATED_SNAPSHOT: {
      label: 'Curated Snapshot',
      bg: 'bg-purple-950/60',
      text: 'text-purple-300',
      border: 'border-purple-500/40',
      icon: FileText
    },
    STALE: {
      label: 'Stale (>180d)',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      icon: AlertTriangle
    },
    FAILED_VALIDATION: {
      label: 'Failed Validation',
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      icon: XCircle
    }
  };

  const cfg = configs[mode] || configs.CURATED_SNAPSHOT;
  const Icon = cfg.icon;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses}`}
      title={`Data Mode: ${cfg.label}${confidence != null ? ` (${confidence}% Confidence)` : ''}`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{cfg.label}</span>
      {confidence != null && (
        <span className="opacity-75 text-[10px] ml-0.5">({confidence}%)</span>
      )}
    </span>
  );
}
