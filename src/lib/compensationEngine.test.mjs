import assert from 'node:assert/strict';

function resolveRate(pv) {
  const tiers = [
    [7500, 25], [6000, 23], [4000, 21], [2500, 18],
    [1500, 15], [1000, 12], [600, 9], [300, 6], [100, 3], [0, 0]
  ];
  for (const [minPv, rate] of tiers) {
    if (pv >= minPv) return rate;
  }
  return 0;
}

assert.equal(resolveRate(50), 0);
assert.equal(resolveRate(150), 3);
assert.equal(resolveRate(1500), 15);
assert.equal(resolveRate(7500), 25);
console.log('Customatter PV/BV compensation engine tests passed.');
