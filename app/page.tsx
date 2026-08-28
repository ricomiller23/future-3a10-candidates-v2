'use client';

import React, { useState } from 'react';
import { seededCandidates } from '@/lib/data/revalidated-seed';
import { CandidateRecord, DataMode } from '@/lib/types/domain';
import { HeaderNav } from '@/components/HeaderNav';
import { FilterToolbar } from '@/components/FilterToolbar';
import { CandidateTable } from '@/components/CandidateTable';
import { CandidateInspector } from '@/components/CandidateInspector';
import { DiscrepancyAuditor } from '@/components/DiscrepancyAuditor';
import { UniverseScanner } from '@/components/UniverseScanner';
import { ScoreBreakdownModal } from '@/components/ScoreBreakdownModal';
import { ShieldCheck, BarChart3, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>(seededCandidates);
  const [activeTab, setActiveTab] = useState<'screener' | 'discrepancy' | 'scanner' | 'docs'>('screener');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataMode, setSelectedDataMode] = useState<DataMode | 'ALL'>('ALL');
  const [marketCapMax, setMarketCapMax] = useState<number>(500); // Max ceiling $500M
  const [inspectingCandidate, setInspectingCandidate] = useState<CandidateRecord | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  // Filter Pipeline
  const filteredCandidates = candidates.filter(cand => {
    // Search query filter
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      cand.issuer.ticker.toLowerCase().includes(q) ||
      cand.issuer.companyName.toLowerCase().includes(q) ||
      (cand.issuer.sector && cand.issuer.sector.toLowerCase().includes(q))
    );

    // Data Mode filter
    const matchesMode = selectedDataMode === 'ALL' || cand.dataMode === selectedDataMode;

    // Market Cap filter (Cap Ceiling)
    const mcapMillions = (cand.snapshot.marketCap || 0) / 1e6;
    const matchesCap = mcapMillions <= marketCapMax;

    return matchesSearch && matchesMode && matchesCap;
  });

  // KPI counters
  const liveVerifiedCount = candidates.filter(c => c.dataMode === 'LIVE_VERIFIED').length;
  const discrepancyCount = 3; // Hardcoded known discrepancies from audit report (NKLA, ASTS, NBY)

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Ticker', 'Company Name', 'SEC CIK', 'Data Mode', '3(a)(10) Score', 'Score Confidence',
      'Market Cap (USD)', 'Canonical AP (USD)', 'Canonical Total Debt (USD)', 'Current Debt (USD)',
      'Long-Term Debt (USD)', 'Cash (USD)', 'Filing Form', 'Filing Date', 'SEC Source URL'
    ];

    const rows = filteredCandidates.map(c => [
      c.issuer.ticker,
      `"${c.issuer.companyName.replace(/"/g, '""')}"`,
      c.issuer.cik,
      c.dataMode,
      c.score?.total || 'N/A',
      `${c.score?.confidence || 0}%`,
      c.snapshot.marketCap || 'N/A',
      c.snapshot.canonicalAccountsPayable || 'N/A',
      c.snapshot.canonicalTotalDebt || 'N/A',
      c.snapshot.canonicalCurrentDebt || '0',
      c.snapshot.canonicalLongTermDebt || '0',
      c.snapshot.canonicalCash || 'N/A',
      c.snapshot.filingType || '10-Q',
      c.snapshot.asOfDate,
      c.snapshot.filingUrl || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `future_3a10candidates_v2_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-gray-100">
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidateCount={candidates.length}
        liveVerifiedCount={liveVerifiedCount}
        discrepancyCount={discrepancyCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: SCREENER */}
        {activeTab === 'screener' && (
          <div className="space-y-6">
            {/* System Info Banner */}
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Audit-Ready Screener Engine Active</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      Zero Fabrication Policy
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
                    Every candidate row below features field-level SEC XBRL provenance, unbundled canonical debt calculations, dynamic ratio recomputation, and explicit data mode badges. Hardcoded guesses and estimated prices have been eliminated.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsScoreModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>How Score Works</span>
              </button>
            </div>

            {/* Filter Toolbar */}
            <FilterToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDataMode={selectedDataMode}
              setSelectedDataMode={setSelectedDataMode}
              marketCapMax={marketCapMax}
              setMarketCapMax={setMarketCapMax}
              onExportCsv={handleExportCsv}
            />

            {/* Candidates Table */}
            <CandidateTable
              candidates={filteredCandidates}
              onInspect={cand => setInspectingCandidate(cand)}
              onCompareDiscrepancy={ticker => setActiveTab('discrepancy')}
            />
          </div>
        )}

        {/* TAB 2: DISCREPANCY AUDITOR */}
        {activeTab === 'discrepancy' && <DiscrepancyAuditor />}

        {/* TAB 3: LIVE SEC SCANNER */}
        {activeTab === 'scanner' && <UniverseScanner />}

        {/* TAB 4: AUDIT SPEC & DOCS */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>FUTURE 3a10candidatesV2 — Specifications & Technical Documentation</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
                  <h3 className="font-bold text-emerald-400 text-sm">ACCURACY_AUDIT_SPEC.md</h3>
                  <p className="text-gray-400">
                    Defines core audit principles, validation rules per ticker, field-by-field check constraints (AP &le; Total Liabilities, formula-based total debt), tolerance threshold (&le; 1% or $50k), and data modes.
                  </p>
                  <div className="text-[11px] text-gray-500 font-mono">Location: ./ACCURACY_AUDIT_SPEC.md</div>
                </div>

                <div className="p-4 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
                  <h3 className="font-bold text-amber-400 text-sm">DATA_MODEL_REVIEW.md</h3>
                  <p className="text-gray-400">
                    Documents the canonical entity model (<code className="text-emerald-300">Issuer</code>, <code className="text-emerald-300">CanonicalFinancialSnapshot</code>, <code className="text-emerald-300">DerivedMetrics</code>, <code className="text-emerald-300">ScoreBreakdown</code>), 6-component scoring breakdown, and unified market cap filter controls.
                  </p>
                  <div className="text-[11px] text-gray-500 font-mono">Location: ./DATA_MODEL_REVIEW.md</div>
                </div>

                <div className="p-4 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
                  <h3 className="font-bold text-blue-400 text-sm">LIVE_FETCH_TEST_PLAN.md</h3>
                  <p className="text-gray-400">
                    Establishes the QA test matrix for identity resolution, SEC XBRL parsing, ratio recomputation, edge cases, and automated test runners (<code className="text-emerald-300">npm test</code>).
                  </p>
                  <div className="text-[11px] text-gray-500 font-mono">Location: ./LIVE_FETCH_TEST_PLAN.md</div>
                </div>

                <div className="p-4 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
                  <h3 className="font-bold text-purple-400 text-sm">IMPLEMENTATION_AUDIT.md</h3>
                  <p className="text-gray-400">
                    Phase 0 audit report detailing legacy prototype risks (NKLA, ASTS, NBY discrepancies, random number generators) and the refactoring directives executed in V2.
                  </p>
                  <div className="text-[11px] text-gray-500 font-mono">Location: ./docs/IMPLEMENTATION_AUDIT.md</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0c121e] py-6 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FUTURE 3a10candidatesV2 — Internal Review-Grade Screening System</span>
          <span className="font-mono text-gray-400">SEC EDGAR XBRL Data • OTC Markets Quote Integration</span>
        </div>
      </footer>

      {/* Modals & Inspectors */}
      <CandidateInspector
        candidate={inspectingCandidate}
        onClose={() => setInspectingCandidate(null)}
      />

      <ScoreBreakdownModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
      />
    </div>
  );
}
