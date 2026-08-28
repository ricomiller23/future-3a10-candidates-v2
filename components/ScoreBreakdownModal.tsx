'use client';

import React from 'react';
import { X, Scale, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScoreBreakdownModal({ isOpen, onClose }: ScoreBreakdownModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">3(a)(10) Feasibility Score Model Specification</h3>
              <p className="text-xs text-gray-400">Transparent 6-Component Weighted Formula & Confidence Rating</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-300">
          <p className="leading-relaxed">
            The 3(a)(10) Feasibility Score evaluates an issuer&apos;s legal eligibility and financial restructuring suitability for section 3(a)(10) court-approved claim settlements. The score ranges from <span className="text-emerald-400 font-bold">0 to 100 points</span>, calculated dynamically across six weighted components:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-white font-bold text-sm mb-1 text-emerald-400">1. Debt Stress (25 pts)</div>
              <div className="text-gray-400 text-[11px]">Debt-to-Market-Cap ratio (&ge; 1.5x: 15 pts) + Liabilities-to-Cash ratio (&ge; 10x: 10 pts).</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-white font-bold text-sm mb-1 text-amber-400">2. AP Burden (15 pts)</div>
              <div className="text-gray-400 text-[11px]">Accounts Payable to Market Cap (&ge; 50%: 10 pts) + Raw AP volume (&ge; $5M: 5 pts).</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-white font-bold text-sm mb-1 text-rose-400">3. Distress & Urgency (20 pts)</div>
              <div className="text-gray-400 text-[11px]">Auditor Going Concern qualification (10 pts) + Active defaulted notes / litigation (10 pts).</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-white font-bold text-sm mb-1 text-blue-400">4. Structure Fit (15 pts)</div>
              <div className="text-gray-400 text-[11px]">Convertible debt stack present (8 pts) + Microcap share price (&lt; $2.00: 7 pts).</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-white font-bold text-sm mb-1 text-purple-400">5. Venue Precedent (10 pts)</div>
              <div className="text-gray-400 text-[11px]">State court jurisdiction precedent (FL 12th Circuit, CA Superior Court, NV District Court).</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-white font-bold text-sm mb-1 text-emerald-400">6. Data Quality (15 pts)</div>
              <div className="text-gray-400 text-[11px]">Live SEC verified (15 pts), Live Partial (10 pts), Curated Snapshot (6 pts).</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Score Confidence Rating (0–100%)</span>
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Every score carries a confidence metric. If required financial inputs (such as Accounts Payable or Total Debt) are absent or extracted from partial reports, score confidence is automatically degraded. Low-confidence scores (&lt;50%) are flagged and excluded from high-conviction default rankings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
