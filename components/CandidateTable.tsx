'use client';

import React from 'react';
import { CandidateRecord } from '@/lib/types/domain';
import { DataModeBadge } from './DataModeBadge';
import { ExternalLink, Eye, RefreshCw, AlertTriangle } from 'lucide-react';

interface CandidateTableProps {
  candidates: CandidateRecord[];
  onInspect: (candidate: CandidateRecord) => void;
  onCompareDiscrepancy?: (ticker: string) => void;
}

export function CandidateTable({ candidates, onInspect, onCompareDiscrepancy }: CandidateTableProps) {
  if (candidates.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-200">No Candidates Match Active Filters</h3>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your market cap ceiling slider or mode filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-900/90 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
              <th className="py-3 px-4">Status & Issuer Identity</th>
              <th className="py-3 px-4">3(a)(10) Score</th>
              <th className="py-3 px-4">Market Cap</th>
              <th className="py-3 px-4">Canonical AP</th>
              <th className="py-3 px-4">Canonical Total Debt</th>
              <th className="py-3 px-4">Cash / Runway</th>
              <th className="py-3 px-4">Filing / OTC Source</th>
              <th className="py-3 px-4 text-right">Audit Tools</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {candidates.map(cand => {
              const snap = cand.snapshot;
              const score = cand.score;
              const ap = snap.canonicalAccountsPayable;
              const debt = snap.canonicalTotalDebt;
              const cash = snap.canonicalCash;
              const mcap = snap.marketCap;
              const debtToCap = cand.metrics.debtToMarketCap;

              return (
                <tr key={cand.issuer.ticker} className="hover:bg-gray-800/40 transition-colors">
                  {/* Status & Identity */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-sm text-white">{cand.issuer.ticker}</span>
                        <DataModeBadge mode={cand.dataMode} confidence={score?.confidence} size="sm" />
                      </div>
                      <span className="text-gray-300 truncate max-w-[200px] text-xs font-medium">
                        {cand.issuer.companyName}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                        <span>CIK: {cand.issuer.cik}</span>
                        <span>•</span>
                        <span className="text-gray-400">{cand.issuer.otcTier || cand.issuer.exchange || 'OTC Pink'}</span>
                      </div>
                    </div>
                  </td>

                  {/* 3(a)(10) Score & Confidence */}
                  <td className="py-3.5 px-4">
                    {score ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-extrabold font-mono ${
                            score.total >= 80 ? 'text-emerald-400' : score.total >= 65 ? 'text-amber-400' : 'text-gray-400'
                          }`}>
                            {score.total} <span className="text-xs font-normal text-gray-500">/ 100</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                            {score.total >= 80 ? 'Tier 1' : score.total >= 65 ? 'Tier 2' : 'Tier 3'}
                          </span>
                        </div>
                        {/* Score Confidence Bar */}
                        <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              score.confidence >= 80 ? 'bg-emerald-500' : score.confidence >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${score.confidence}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>

                  {/* Market Cap */}
                  <td className="py-3.5 px-4 font-mono text-gray-200 font-bold">
                    {mcap != null ? `$${(mcap / 1e6).toFixed(1)}M` : <span className="text-gray-500">N/A</span>}
                    {snap.sharePrice && (
                      <div className="text-[10px] text-gray-400 font-normal">@ ${snap.sharePrice < 0.01 ? snap.sharePrice.toFixed(4) : snap.sharePrice.toFixed(2)}</div>
                    )}
                  </td>

                  {/* Accounts Payable */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-amber-300">
                    {ap != null ? `$${(ap / 1e6).toFixed(2)}M` : <span className="text-gray-500">N/A</span>}
                  </td>

                  {/* Total Debt & Debt/Cap */}
                  <td className="py-3.5 px-4 font-mono text-gray-200">
                    <div>{debt != null ? `$${(debt / 1e6).toFixed(2)}M` : <span className="text-gray-500">N/A</span>}</div>
                    {debtToCap != null && (
                      <div className="text-[10px] text-rose-400 font-semibold">
                        {(debtToCap * 100).toFixed(0)}% of Cap
                      </div>
                    )}
                  </td>

                  {/* Cash */}
                  <td className="py-3.5 px-4 font-mono text-emerald-400">
                    {cash != null ? `$${(cash / 1e6).toFixed(2)}M` : <span className="text-gray-500">N/A</span>}
                  </td>

                  {/* Filing / OTC Link */}
                  <td className="py-3.5 px-4 text-xs">
                    {snap.filingUrl ? (
                      <a
                        href={snap.filingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline font-mono"
                      >
                        <span>{snap.filingType || 'Filing'} ({snap.asOfDate})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-500">No URL</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onInspect(cand)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {onCompareDiscrepancy && (
                        <button
                          onClick={() => onCompareDiscrepancy(cand.issuer.ticker)}
                          className="p-1.5 text-gray-400 hover:text-amber-300 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Compare legacy prototype numbers vs SEC 10-Q"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
