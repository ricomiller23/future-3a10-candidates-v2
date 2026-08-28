'use client';

import React, { useState } from 'react';
import { CandidateRecord } from '@/lib/types/domain';
import { DataModeBadge } from './DataModeBadge';
import { Search, Loader2, ShieldCheck, ExternalLink, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

export function UniverseScanner() {
  const [tickerInput, setTickerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<CandidateRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await fetch(`/api/sec-lookup?ticker=${encodeURIComponent(tickerInput.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to fetch SEC facts for ticker "${tickerInput}"`);
      }

      setScanResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing live SEC EDGAR scan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Control Header */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-md">
        <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-400" />
          <span>Live SEC EDGAR & OTC Markets Ticker Scanner</span>
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Enter any US stock symbol (e.g. <span className="font-mono text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setTickerInput('NKLA')}>NKLA</span>, <span className="font-mono text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setTickerInput('ASTS')}>ASTS</span>, <span className="font-mono text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setTickerInput('GOEV')}>GOEV</span>, <span className="font-mono text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setTickerInput('XELA')}>XELA</span>, <span className="font-mono text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setTickerInput('NBY')}>NBY</span>) to parse live XBRL facts directly from SEC servers.
        </p>

        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter ticker (e.g. NKLA, ASTS, GOEV, XELA)..."
              value={tickerInput}
              onChange={e => setTickerInput(e.target.value.toUpperCase())}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !tickerInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Scanning SEC EDGAR...' : 'Scan Ticker Live'}</span>
          </button>
        </form>
      </div>

      {/* Error Output */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Scan Output Result */}
      {scanResult && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-mono text-white">{scanResult.issuer.ticker}</h3>
                <span className="text-sm text-gray-300">{scanResult.issuer.companyName}</span>
                <DataModeBadge mode={scanResult.dataMode} confidence={scanResult.score?.confidence} size="md" />
              </div>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                SEC CIK: {scanResult.issuer.cik} • Exchange: {scanResult.issuer.exchange || 'NASDAQ'}
              </p>
            </div>

            {scanResult.snapshot.filingUrl && (
              <a
                href={scanResult.snapshot.filingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 transition-colors"
              >
                <span>View SEC 10-Q</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Validation & Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
              <div className="text-gray-400 mb-1">Audit Validation</div>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{scanResult.validation.status} ({scanResult.validation.confidence}% Confidence)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
              <div className="text-gray-400 mb-1">3(a)(10) Score</div>
              <div className="text-base font-bold font-mono text-white">
                {scanResult.score?.total || 0} / 100
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
              <div className="text-gray-400 mb-1">Accounts Payable (AP)</div>
              <div className="text-base font-bold font-mono text-amber-300">
                {scanResult.snapshot.canonicalAccountsPayable != null
                  ? `$${(scanResult.snapshot.canonicalAccountsPayable / 1e6).toFixed(2)}M`
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Core Balance Sheet Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-xs space-y-3">
            <h4 className="font-semibold text-gray-200 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Extracted SEC Balance Sheet Facts (Normalized USD)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div>
                <div className="text-gray-400 text-[10px]">Total Debt:</div>
                <div className="text-sm font-bold text-white">
                  {scanResult.snapshot.canonicalTotalDebt != null ? `$${(scanResult.snapshot.canonicalTotalDebt / 1e6).toFixed(2)}M` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px]">Total Liabilities:</div>
                <div className="text-sm font-bold text-gray-300">
                  {scanResult.snapshot.canonicalTotalLiabilities != null ? `$${(scanResult.snapshot.canonicalTotalLiabilities / 1e6).toFixed(2)}M` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px]">Cash & Equivalents:</div>
                <div className="text-sm font-bold text-emerald-400">
                  {scanResult.snapshot.canonicalCash != null ? `$${(scanResult.snapshot.canonicalCash / 1e6).toFixed(2)}M` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px]">Market Cap:</div>
                <div className="text-sm font-bold text-gray-300">
                  {scanResult.snapshot.marketCap != null ? `$${(scanResult.snapshot.marketCap / 1e6).toFixed(1)}M` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
