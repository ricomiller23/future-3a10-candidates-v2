import assert from 'assert';
import { checkNumericTolerance } from '../lib/audit/tolerance';
import { validateCandidateRecord } from '../lib/audit/validator';
import { CandidateRecord } from '../lib/types/domain';

console.log('=== Running Accuracy Audit Tests ===');

// 1. Test Numeric Tolerance
const test1 = checkNumericTolerance(1000000, 1005000, "Accounts Payable"); // 0.5% delta
assert.strictEqual(test1.isWithinTolerance, true, "0.5% delta should pass tolerance");

const test2 = checkNumericTolerance(1000000, 1100000, "Accounts Payable"); // 10% delta ($100k > $50k)
assert.strictEqual(test2.isWithinTolerance, false, "10% delta should fail tolerance");

console.log('✓ Numeric tolerance rules verified.');

// 2. Test Candidate Validation Pipeline
const mockCandidate: Partial<CandidateRecord> = {
  issuer: {
    ticker: "TEST",
    cik: "0000000001",
    companyName: "Test Issuer"
  },
  snapshot: {
    issuer: { ticker: "TEST", cik: "0000000001", companyName: "Test Issuer" },
    asOfDate: "2026-03-31",
    canonicalAccountsPayable: 1000000,
    canonicalCurrentDebt: 500000,
    canonicalLongTermDebt: 500000,
    canonicalTotalDebt: 1000000,
    canonicalTotalLiabilities: 3000000,
    canonicalCash: 200000,
    marketCap: 5000000,
    sourceRefs: {}
  },
  dataMode: "LIVE_VERIFIED"
};

const valRes = validateCandidateRecord(mockCandidate);
assert.strictEqual(valRes.status, "PASS", "Valid candidate should pass validation");
assert.strictEqual(valRes.freshnessState, "LIVE_VERIFIED");

console.log('✓ Candidate validation pipeline verified.');
