import { describe, expect, it } from 'vitest';
import {
  BILLION_DOLLAR_TARGET,
  GPT_56_SOL_OUTPUT_PRICE_PER_MILLION,
  INFINITY_DURATION_MS,
  calculateInfinitySnapshot,
  formatDollars,
  formatTokensPerSecond,
  getLogicalTerminalCount,
  getManualTokensPerSecond,
  getTerminalTokensPerSecond,
  solveInfinityGrowth,
} from '../vibeEconomy';

describe('vibe economy', () => {
  it('uses variable terminal rates with an O(1) repeating aggregate', () => {
    const firstCycle = Array.from({ length: 8 }, (_, index) => getTerminalTokensPerSecond(index));

    expect(new Set(firstCycle).size).toBeGreaterThan(4);
    expect(firstCycle.reduce((sum, rate) => sum + rate, 0)).toBe(20_000);
    expect(getManualTokensPerSecond(25)).toBe(61_375);
    expect(getManualTokensPerSecond(8_000_000)).toBe(20_000_000_000);
  });

  it('maps aggregate throughput back to its logical terminal count', () => {
    for (const count of [1, 7, 8, 25, 1_001, 8_000_000]) {
      expect(getLogicalTerminalCount(getManualTokensPerSecond(count))).toBe(count);
    }
  });

  it('starts continuously and reaches exactly one billion dollars at 90 seconds', () => {
    const manualTokensPerSecond = getManualTokensPerSecond(25);
    const growth = solveInfinityGrowth({
      startingDollars: 18.25,
      startingTokensPerSecond: manualTokensPerSecond,
    });
    const start = calculateInfinitySnapshot({
      elapsedMs: 0,
      startingDollars: 18.25,
      startingTerminalCount: 25,
      manualTokensPerSecond,
      growth,
    });
    const almostDone = calculateInfinitySnapshot({
      elapsedMs: INFINITY_DURATION_MS - 1,
      startingDollars: 18.25,
      startingTerminalCount: 25,
      manualTokensPerSecond,
      growth,
    });
    const done = calculateInfinitySnapshot({
      elapsedMs: INFINITY_DURATION_MS,
      startingDollars: 18.25,
      startingTerminalCount: 25,
      manualTokensPerSecond,
      growth,
    });

    expect(start.tokensPerSecond).toBe(manualTokensPerSecond);
    expect(start.dollarsSpent).toBe(18.25);
    expect(start.logicalTerminalCount).toBe(25);
    expect(almostDone.dollarsSpent).toBeLessThan(BILLION_DOLLAR_TARGET);
    expect(almostDone.isComplete).toBe(false);
    expect(done.dollarsSpent).toBe(BILLION_DOLLAR_TARGET);
    expect(done.isComplete).toBe(true);
    expect(done.logicalTerminalCount).toBeGreaterThan(1_000_000_000);
  });

  it('is monotonically accelerating throughout the run', () => {
    const manualTokensPerSecond = getManualTokensPerSecond(25);
    const snapshots = [0, 15_000, 30_000, 45_000, 60_000, 75_000, 90_000].map((elapsedMs) => (
      calculateInfinitySnapshot({
        elapsedMs,
        startingDollars: 0,
        startingTerminalCount: 25,
        manualTokensPerSecond,
      })
    ));

    for (let index = 1; index < snapshots.length; index += 1) {
      expect(snapshots[index].dollarsSpent).toBeGreaterThan(snapshots[index - 1].dollarsSpent);
      expect(snapshots[index].tokensPerSecond).toBeGreaterThan(snapshots[index - 1].tokensPerSecond);
      expect(snapshots[index].logicalTerminalCount).toBeGreaterThan(snapshots[index - 1].logicalTerminalCount);
    }
  });

  it('formats the counters without losing their unit story', () => {
    expect(GPT_56_SOL_OUTPUT_PRICE_PER_MILLION).toBe(30);
    expect(formatTokensPerSecond(61_375)).toBe('61,375');
    expect(formatTokensPerSecond(6_870_000_000_000)).toMatch(/T/);
    expect(formatDollars(BILLION_DOLLAR_TARGET)).toBe('$1,000,000,000.00');
  });
});
