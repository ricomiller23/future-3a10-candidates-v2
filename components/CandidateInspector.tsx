'use client';

import React from 'react';
import { CandidateRecord } from '@/lib/types/domain';
import { DataModeBadge } from './DataModeBadge';
import { X, ExternalLink, ShieldCheck, AlertTriangle, Scale, FileCode, CheckCircle2 } from 'lucide-react';

interface CandidateInspectorProps {
  candidate: CandidateRecord | null;
  onClose: () => void;
}

export function CandidateInspector({ candidate, onClose }: CandidateInspectorProps) {
  if (!candidate) return null;

  const snap = candidate.snapshot;
  const score = candidate.score;
  const val = candidate.validation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono text-white">{candidate.issuer.ticker}</h2>
                <span className="text-sm text-gray-300 font-medium">{candidate.issuer.companyName}</span>
                <DataModeBadge mode={candidate.dataMode} confidence={score?.confidence} size="md" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                SEC CIK: {candidate.issuer.cik} • Exchange: {candidate.issuer.exchange || 'NASDAQ'} • Sector: {candidate.issuer.sector}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Validation Status & Message Banner */}
          <div className={`p-4 rounded-xl border ${
            val.status === 'PASS' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
            val.status === 'WARN' ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' :
            'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2 font-semibold mb-1 text-sm">
              {val.status === 'PASS' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
              <span>Audit Validation Status: {val.status} ({val.confidence}% Score Confidence)</span>
            </div>
            {val.messages.length > 0 ? (
              <ul className="list-disc pl-5 space-y-0.5 mt-2">
                {val.messages.map((msg, i) => (
                  <li key={i}>{msg.message}</li>
                ))}
              </ul>
            ) : (
              <p>All core balance sheet metrics pass validation rules with zero discrepancy.</p>
            )}
          </div>

          {/* 3(a)(10) Score Component Breakdown */}
          {score && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                <span>3(a)(10) Feasibility Score Breakdown ({score.total} / 100)</span>
                <span className="text-xs text-emerald-400 font-mono">Confidence: {score.confidence}%</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4 text-center">
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-700">
                  <div className="text-gray-400 text-[10px]">Debt Stress</div>
                  <div className="text-sm font-bold text-white font-mono">{score.debtStress} / 25</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-700">
                  <div className="text-gray-400 text-[10px]">AP Burden</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">{score.apBurden} / 15</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-700">
                  <div className="text-gray-400 text-[10px]">Distress</div>
                  <div className="text-sm font-bold text-rose-400 font-mono">{score.distressUrgency} / 20</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-700">
                  <div className="text-gray-400 text-[10px]">Structure Fit</div>
                  <div className="text-sm font-bold text-blue-400 font-mono">{score.structureFit} / 15</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-700">
                  <div className="text-gray-400 text-[10px]">Venue Fit</div>
                  <div className="text-sm font-bold text-purple-400 font-mono">{score.venuePrecedentFit} / 10</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-700">
                  <div className="text-gray-400 text-[10px]">Data Quality</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{score.dataQuality} / 15</div>
                </div>
              </div>

              {score.reasons.length > 0 && (
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Positive Catalyst Drivers:</span>
                  <ul className="space-y-1">
                    {score.reasons.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Canonical Metrics & XBRL Concepts */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Canonical Financial Snapshot & Extracted XBRL Concepts</span>
              {snap.filingUrl && (
                <a
                  href={snap.filingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>View SEC Form {snap.filingType || '10-Q'} ({snap.asOfDate})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/60 space-y-2">
                <div className="flex justify-between border-b border-gray-700/60 pb-1.5 font-semibold text-gray-200">
                  <span>Metric Name</span>
                  <span>Canonical Normalized USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Accounts Payable (AP):</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {snap.canonicalAccountsPayable != null ? `$${(snap.canonicalAccountsPayable / 1e6).toFixed(3)}M` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Debt:</span>
                  <span className="font-mono text-gray-200">
                    {snap.canonicalCurrentDebt != null ? `$${(snap.canonicalCurrentDebt / 1e6).toFixed(3)}M` : '$0.00M'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Long-Term Debt:</span>
                  <span className="font-mono text-gray-200">
                    {snap.canonicalLongTermDebt != null ? `$${(snap.canonicalLongTermDebt / 1e6).toFixed(3)}M` : '$0.00M'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Convertible Debt:</span>
                  <span className="font-mono text-gray-200">
                    {snap.canonicalConvertibleDebt != null ? `$${(snap.canonicalConvertibleDebt / 1e6).toFixed(3)}M` : '$0.00M'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-700/60 pt-1.5 font-bold">
                  <span className="text-gray-200">Canonical Total Debt:</span>
                  <span className="font-mono text-emerald-400">
                    {snap.canonicalTotalDebt != null ? `$${(snap.canonicalTotalDebt / 1e6).toFixed(3)}M` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/60 space-y-2">
                <div className="flex justify-between border-b border-gray-700/60 pb-1.5 font-semibold text-gray-200">
                  <span>Liquidity & Capitalization</span>
                  <span>Value</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cash & Equivalents:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {snap.canonicalCash != null ? `$${(snap.canonicalCash / 1e6).toFixed(3)}M` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Liabilities:</span>
                  <span className="font-mono text-gray-200">
                    {snap.canonicalTotalLiabilities != null ? `$${(snap.canonicalTotalLiabilities / 1e6).toFixed(3)}M` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Market Capitalization:</span>
                  <span className="font-mono text-gray-200">
                    {snap.marketCap != null ? `$${(snap.marketCap / 1e6).toFixed(2)}M` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Debt-to-Market-Cap Ratio:</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {candidate.metrics.debtToMarketCap != null ? `${(candidate.metrics.debtToMarketCap * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-700/60 pt-1.5 font-bold">
                  <span className="text-gray-200">AP-to-Market-Cap Ratio:</span>
                  <span className="font-mono text-amber-300">
                    {candidate.metrics.apToMarketCap != null ? `${(candidate.metrics.apToMarketCap * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analyst Notes & Court Jurisdiction */}
          {candidate.analystNotes && (
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
              <h4 className="font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>Analyst Notes & Restructuring Jurisdiction:</span>
              </h4>
              <p className="text-gray-400 leading-relaxed">{candidate.analystNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
