import { CandidateRecord, CanonicalFinancialSnapshot, DerivedMetrics, ScoreBreakdown } from '../types/domain';

export function calculateDerivedMetrics(snapshot: CanonicalFinancialSnapshot): DerivedMetrics {
  const marketCap = snapshot.marketCap;
  const totalDebt = snapshot.canonicalTotalDebt;
  const ap = snapshot.canonicalAccountsPayable;
  const totalLiab = snapshot.canonicalTotalLiabilities;
  const cash = snapshot.canonicalCash;

  const debtToMarketCap = (totalDebt != null && marketCap && marketCap > 0)
    ? totalDebt / marketCap
    : null;

  const apToMarketCap = (ap != null && marketCap && marketCap > 0)
    ? ap / marketCap
    : null;

  const liabilitiesToCash = (totalLiab != null && cash && cash > 0)
    ? totalLiab / cash
    : null;

  const debtToCash = (totalDebt != null && cash && cash > 0)
    ? totalDebt / cash
    : null;

  return {
    debtToMarketCap,
    apToMarketCap,
    liabilitiesToCash,
    debtToCash
  };
}

export function calculate3A10Score(
  snapshot: CanonicalFinancialSnapshot,
  dataMode: CandidateRecord['dataMode'],
  qualitativeFlags: {
    goingConcern?: boolean;
    defaultedNotes?: boolean;
    convertibleDebtPresent?: boolean;
    jurisdictionPrecedent?: boolean;
  } = {}
): { score: ScoreBreakdown; metrics: DerivedMetrics } {
  const metrics = calculateDerivedMetrics(snapshot);

  let debtStress = 0;
  let apBurden = 0;
  let distressUrgency = 0;
  let structureFit = 0;
  let venuePrecedentFit = 0;
  let dataQuality = 0;

  const reasons: string[] = [];
  const blockers: string[] = [];

  // 1. Debt Stress (Max 25 pts)
  if (metrics.debtToMarketCap != null) {
    if (metrics.debtToMarketCap >= 1.5) {
      debtStress += 15;
      reasons.push(`High debt-to-market-cap ratio (${(metrics.debtToMarketCap * 100).toFixed(1)}%).`);
    } else if (metrics.debtToMarketCap >= 0.8) {
      debtStress += 10;
      reasons.push(`Elevated debt-to-market-cap ratio (${(metrics.debtToMarketCap * 100).toFixed(1)}%).`);
    } else if (metrics.debtToMarketCap >= 0.4) {
      debtStress += 5;
    }
  } else {
    blockers.push("Missing total debt or market cap prevents debt stress calculation.");
  }

  if (metrics.liabilitiesToCash != null) {
    if (metrics.liabilitiesToCash >= 10.0) {
      debtStress += 10;
      reasons.push(`Severe liability overhang vs cash runway (${metrics.liabilitiesToCash.toFixed(1)}x cash).`);
    } else if (metrics.liabilitiesToCash >= 4.0) {
      debtStress += 6;
      reasons.push(`Significant liability overhang vs cash (${metrics.liabilitiesToCash.toFixed(1)}x cash).`);
    } else if (metrics.liabilitiesToCash >= 2.0) {
      debtStress += 3;
    }
  }

  // 2. AP Burden (Max 15 pts)
  if (metrics.apToMarketCap != null) {
    if (metrics.apToMarketCap >= 0.5) {
      apBurden += 10;
      reasons.push(`Heavy trade accounts payable burden (${(metrics.apToMarketCap * 100).toFixed(1)}% of market cap).`);
    } else if (metrics.apToMarketCap >= 0.25) {
      apBurden += 6;
    } else if (metrics.apToMarketCap >= 0.1) {
      apBurden += 3;
    }
  }

  const ap = snapshot.canonicalAccountsPayable ?? 0;
  if (ap >= 5000000) {
    apBurden += 5;
    reasons.push(`Substantial raw AP balance ($${(ap / 1e6).toFixed(2)}M) suitable for 3(a)(10) settlement tranche.`);
  } else if (ap >= 1000000) {
    apBurden += 3;
  }

  // 3. Distress & Urgency (Max 20 pts)
  if (qualitativeFlags.goingConcern) {
    distressUrgency += 10;
    reasons.push("Explicit auditor going concern qualification in latest SEC filing.");
  }
  if (qualitativeFlags.defaultedNotes) {
    distressUrgency += 10;
    reasons.push("Active defaulted notes or notice of acceleration filed.");
  }

  // 4. Structure Fit (Max 15 pts)
  if (qualitativeFlags.convertibleDebtPresent || (snapshot.canonicalConvertibleDebt && snapshot.canonicalConvertibleDebt > 0)) {
    structureFit += 8;
    reasons.push("Convertible debt or toxic notes present for restructuring.");
  }
  if (snapshot.sharePrice && snapshot.sharePrice < 2.0) {
    structureFit += 7;
    reasons.push(`Microcap share price ($${snapshot.sharePrice.toFixed(2)}) facilitates 3(a)(10) share issuance mechanics.`);
  }

  // 5. Venue / Precedent Fit (Max 10 pts)
  if (qualitativeFlags.jurisdictionPrecedent !== false) {
    venuePrecedentFit += 10;
    reasons.push("Issuer maps to established 3(a)(10) court jurisdiction (FL 12th Circuit, CA Superior Court, NV District).");
  }

  // 6. Data Quality & Provenance (Max 15 pts)
  let confidence = 100;
  if (dataMode === "LIVE_VERIFIED") {
    dataQuality += 15;
  } else if (dataMode === "LIVE_PARTIAL") {
    dataQuality += 10;
    confidence = 80;
    reasons.push("Live SEC data extracted with partial market quote data.");
  } else if (dataMode === "CURATED_SNAPSHOT") {
    dataQuality += 6;
    confidence = 65;
    reasons.push("Score computed from curated baseline snapshot.");
  } else {
    dataQuality += 0;
    confidence = 30;
    blockers.push("Failed validation lowers score confidence.");
  }

  // Deduct confidence if critical values are missing
  if (snapshot.canonicalTotalDebt == null) confidence -= 25;
  if (snapshot.canonicalAccountsPayable == null) confidence -= 20;
  if (snapshot.marketCap == null) confidence -= 20;

  confidence = Math.max(0, Math.min(100, confidence));

  const total = Math.min(100, debtStress + apBurden + distressUrgency + structureFit + venuePrecedentFit + dataQuality);

  return {
    score: {
      debtStress,
      apBurden,
      distressUrgency,
      structureFit,
      venuePrecedentFit,
      dataQuality,
      total,
      confidence,
      reasons,
      blockers
    },
    metrics
  };
}
