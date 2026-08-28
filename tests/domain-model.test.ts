import assert from 'assert';
import { calculate3A10Score, calculateDerivedMetrics } from '../lib/scoring/score-engine';
import { CanonicalFinancialSnapshot } from '../lib/types/domain';

console.log('=== Running Domain Model & Scoring Tests ===');

const mockSnapshot: CanonicalFinancialSnapshot = {
  issuer: {
    ticker: "NKLA",
    cik: "0001731289",
    companyName: "Nikola Corporation"
  },
  asOfDate: "2024-09-30",
  canonicalAccountsPayable: 57161000,
  canonicalCurrentDebt: 73111000,
  canonicalLongTermDebt: 270018000,
  canonicalTotalDebt: 343129000,
  canonicalTotalLiabilities: 412500000,
  canonicalCash: 198300000,
  marketCap: 210000000,
  sharePrice: 0.85,
  sourceRefs: {}
};

const metrics = calculateDerivedMetrics(mockSnapshot);
assert(metrics.debtToMarketCap != null);
assert(metrics.apToMarketCap != null);
assert.strictEqual(Math.round(metrics.debtToMarketCap * 100), 163); // ~1.63x

const { score } = calculate3A10Score(mockSnapshot, "LIVE_VERIFIED", { goingConcern: true, defaultedNotes: true });
assert(score.total >= 75, `Distressed NKLA snapshot should yield high score (got ${score.total})`);
assert.strictEqual(score.confidence, 100, "Live verified data should yield 100% confidence");

console.log(`✓ Derived metrics & scoring engine verified (NKLA Score: ${score.total}, Confidence: ${score.confidence}%).`);
