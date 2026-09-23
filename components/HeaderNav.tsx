'use client';

import React from 'react';
import { ShieldCheck, BarChart3, Search, FileText, Scale, RefreshCw } from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'screener' | 'discrepancy' | 'scanner' | 'docs';
  setActiveTab: (tab: 'screener' | 'discrepancy' | 'scanner' | 'docs') => void;
  candidateCount: number;
  liveVerifiedCount: number;
  discrepancyCount: number;
  isRefreshing?: boolean;
  lastRefreshedAt?: string | null;
  onRefresh?: () => void;
}

export function HeaderNav({
  activeTab,
  setActiveTab,
  candidateCount,
  liveVerifiedCount,
  discrepancyCount,
  isRefreshing = false,
  lastRefreshedAt = null,
  onRefresh
}: HeaderNavProps) {
  return (
    <header className="border-b border-gray-800 bg-[#0c121e]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
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
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                US Public Micro/Small-Cap 3(a)(10) Debt Settlement Screener ($100M Default Filter)
              </p>
            </div>
          </div>

          {/* Action Toolbar & Tab Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Refresh Control */}
            <div className="flex items-center gap-2 mr-2 bg-gray-900/90 border border-gray-800 px-2.5 py-1 rounded-lg">
              <div className="text-[11px] font-mono text-gray-400 hidden sm:block">
                {lastRefreshedAt ? (
                  <span>Refreshed: <span className="text-gray-200">{lastRefreshedAt}</span></span>
                ) : (
                  <span>Syncing live...</span>
                )}
              </div>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  title="Reload candidate universe live from server"
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{isRefreshing ? 'Syncing...' : 'Reload'}</span>
                </button>
              )}
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
      </div>
    </header>
  );
}
