import assert from 'assert';
import { getCikForTicker } from '../lib/sec/ticker-map';

console.log('=== Running Live SEC Identity Resolution Tests ===');

async function testLiveSecResolution() {
  const tickersToTest = ["NKLA", "ASTS", "NBY", "GOEV", "XELA", "FFIE", "CETY", "VCIG"];

  for (const ticker of tickersToTest) {
    const res = await getCikForTicker(ticker);
    assert(res != null, `Ticker ${ticker} should resolve to a valid CIK`);
    console.log(`  ✓ ${ticker} -> CIK ${res.cik} (${res.companyName})`);
  }

  // Test invalid ticker resolution
  const invalidRes = await getCikForTicker("INVALID999TICKER");
  assert.strictEqual(invalidRes, null, "Invalid ticker should return null");
  console.log('  ✓ Invalid ticker handling verified (returns null gracefully).');

  console.log('✓ All live SEC resolution tests passed.');
}

testLiveSecResolution().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
