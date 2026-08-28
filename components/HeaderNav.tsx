'use client';

import React from 'react';
import { ShieldCheck, BarChart3, Search, FileText, Scale } from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'screener' | 'discrepancy' | 'scanner' | 'docs';
  setActiveTab: (tab: 'screener' | 'discrepancy' | 'scanner' | 'docs') => void;
  candidateCount: number;
  liveVerifiedCount: number;
  discrepancyCount: number;
}

export function HeaderNav({
  activeTab,
  setActiveTab,
  candidateCount,
  liveVerifiedCount,
  discrepancyCount
}: HeaderNavProps) {
  return (
    <header className="border-b border-gray-800 bg-[#0c121e]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  FUTURE 3a10candidates<span className="text-emerald-400">V2</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                  Audit-Ready
                </span>
              </div>
              <p className="text-xs text-gray-400">
                US Public Micro/Small-Cap 3(a)(10) Debt Settlement Screener ($100M Default Filter)
              </p>
            </div>
          </div>

          {/* Tab Navigation Buttons */}
          <nav className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('screener')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'screener'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Candidates ({candidateCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('discrepancy')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'discrepancy'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Discrepancy Auditor</span>
              {discrepancyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full">
                  {discrepancyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'scanner'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Live SEC Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'docs'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Spec & Specs</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
