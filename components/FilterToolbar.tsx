'use client';

import React from 'react';
import { DataMode } from '@/lib/types/domain';
import { Search, Download, Filter, Sliders } from 'lucide-react';

interface FilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDataMode: DataMode | 'ALL';
  setSelectedDataMode: (mode: DataMode | 'ALL') => void;
  marketCapMax: number; // In millions ($0M - $500M)
  setMarketCapMax: (val: number) => void;
  onExportCsv: () => void;
}

export function FilterToolbar({
  searchQuery,
  setSearchQuery,
  selectedDataMode,
  setSelectedDataMode,
  marketCapMax,
  setMarketCapMax,
  onExportCsv
}: FilterToolbarProps) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 mb-6 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ticker (NDBI, NKLA...), company name, or OTC tier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Data Mode Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs text-gray-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            Mode:
          </span>
          {(['ALL', 'LIVE_VERIFIED', 'LIVE_PARTIAL', 'CURATED_SNAPSHOT', 'FAILED_VALIDATION'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedDataMode(mode)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all shrink-0 ${
                selectedDataMode === mode
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-200'
              }`}
            >
              {mode === 'ALL' ? 'All Modes' : mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Market Cap Slider ($0M - $500M) & Export Button */}
        <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-800 pt-3 lg:pt-0 lg:pl-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col min-w-[150px]">
              <div className="flex justify-between text-xs text-gray-300 font-medium mb-0.5">
                <span>Cap Range:</span>
                <span className="text-emerald-400 font-mono font-bold">$0M – ${marketCapMax}M</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                value={marketCapMax}
                onChange={e => setMarketCapMax(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
