'use client';

import React, { useEffect, useState } from 'react';
import { DiscrepancyReportRecord } from '@/lib/types/domain';
import { ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

export function DiscrepancyAuditor() {
  const [reports, setReports] = useState<DiscrepancyReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscrepancies();
  }, []);

  const fetchDiscrepancies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-discrepancies');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to load discrepancy audit reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-400">Loading side-by-side discrepancy audit matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-5 text-amber-200 text-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1">
          <ShieldAlert className="w-5 h-5" />
          <span>Discrepancy Auditor — Legacy Prototype vs. Audited SEC 10-Q Figures</span>
        </div>
        <p className="text-amber-200/80 leading-relaxed">
          This dashboard surfaces exact numeric variances between legacy prototype seed numbers (from the prior candidate view) and actual audited SEC EDGAR 10-Q filing balance sheets. All values exceeding our 1% / $50k numeric tolerance threshold are highlighted in red below.
        </p>
      </div>

      {/* Discrepancy Cards per Ticker */}
      <div className="grid grid-cols-1 gap-6">
        {reports.map(report => (
          <div
            key={report.ticker}
            className={`border rounded-xl p-5 transition-all ${
              report.overallStatus === 'MATERIAL_DISCREPANCY'
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-emerald-950/20 border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-white">{report.ticker}</span>
                <span className="text-xs text-gray-300 font-medium">{report.companyName}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                  report.overallStatus === 'MATERIAL_DISCREPANCY'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {report.overallStatus.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                SEC 10-Q Period End: {report.filingPeriodEnd}
              </span>
            </div>

            {/* Table of Discrepancies */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800 pb-2">
                    <th className="pb-2">Field Metric</th>
                    <th className="pb-2">Legacy Prototype Value</th>
                    <th className="pb-2">Audited SEC 10-Q Value</th>
                    <th className="pb-2">Variance / Delta</th>
                    <th className="pb-2">Audit Verdict & Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {report.discrepancies.map((disc, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30">
                      <td className="py-2.5 font-semibold text-gray-200">{disc.field}</td>
                      <td className="py-2.5 font-mono text-gray-400">
                        {disc.seededValue != null ? `$${(Number(disc.seededValue) / 1e6).toFixed(2)}M` : 'N/A'}
                      </td>
                      <td className="py-2.5 font-mono text-emerald-400 font-bold">
                        {disc.liveSecValue != null ? `$${(Number(disc.liveSecValue) / 1e6).toFixed(2)}M` : 'N/A'}
                      </td>
                      <td className="py-2.5 font-mono">
                        {disc.varianceAmount != null ? (
                          <span className={disc.status === 'DISCREPANCY' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {disc.varianceAmount > 0 ? `+` : ''}${(disc.varianceAmount / 1e6).toFixed(2)}M ({disc.differencePct?.toFixed(1)}%)
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          {disc.status === 'DISCREPANCY' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          <span>{disc.explanation}</span>
                          {disc.sourceUrl && (
                            <a href={disc.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 ml-1">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
