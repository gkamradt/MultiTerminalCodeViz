import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BILLION_DOLLAR_TARGET,
  DOLLARS_PER_OUTPUT_TOKEN,
  calculateInfinitySnapshot,
  getManualTokensPerSecond,
  solveInfinityGrowth,
} from '../utils/vibeEconomy';

interface EconomyState {
  tokensPerSecond: number;
  dollarsSpent: number;
  logicalTerminalCount: number;
  progress: number;
  isInfinite: boolean;
  isComplete: boolean;
}

const UI_UPDATE_INTERVAL_MS = 100;

export function useVibeEconomy(terminalCount: number, enabled = true) {
  const manualTokensPerSecond = useMemo(
    () => getManualTokensPerSecond(terminalCount),
    [terminalCount],
  );
  const [economy, setEconomy] = useState<EconomyState>({
    tokensPerSecond: manualTokensPerSecond,
    dollarsSpent: 0,
    logicalTerminalCount: terminalCount,
    progress: 0,
    isInfinite: false,
    isComplete: false,
  });
  const economyRef = useRef(economy);
  const lastTickRef = useRef(performance.now());
  const infinityStartRef = useRef<number>();
  const infinityStartingDollarsRef = useRef(0);
  const infinityStartingCountRef = useRef(terminalCount);
  const infinityManualTokensRef = useRef(manualTokensPerSecond);
  const infinityGrowthRef = useRef(0);

  useEffect(() => {
    economyRef.current = economy;
  }, [economy]);

  useEffect(() => {
    if (!enabled || economy.isComplete) return;
    lastTickRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const deltaSeconds = Math.min((now - lastTickRef.current) / 1_000, 1);
      lastTickRef.current = now;

      if (economyRef.current.isInfinite && infinityStartRef.current !== undefined) {
        const snapshot = calculateInfinitySnapshot({
          elapsedMs: now - infinityStartRef.current,
          startingDollars: infinityStartingDollarsRef.current,
          startingTerminalCount: infinityStartingCountRef.current,
          manualTokensPerSecond: infinityManualTokensRef.current,
          growth: infinityGrowthRef.current,
        });
        setEconomy({ ...snapshot, isInfinite: true });
      } else {
        setEconomy((current) => ({
          ...current,
          tokensPerSecond: manualTokensPerSecond,
          logicalTerminalCount: terminalCount,
          dollarsSpent: Math.min(
            BILLION_DOLLAR_TARGET,
            current.dollarsSpent
              + manualTokensPerSecond * deltaSeconds * DOLLARS_PER_OUTPUT_TOKEN,
          ),
        }));
      }
    };

    const interval = window.setInterval(tick, UI_UPDATE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [enabled, economy.isComplete, manualTokensPerSecond, terminalCount]);

  const startInfinity = useCallback(() => {
    if (economyRef.current.isInfinite) return;

    const now = performance.now();
    infinityStartRef.current = now;
    infinityStartingDollarsRef.current = economyRef.current.dollarsSpent;
    infinityStartingCountRef.current = terminalCount;
    infinityManualTokensRef.current = manualTokensPerSecond;
    infinityGrowthRef.current = solveInfinityGrowth({
      startingDollars: economyRef.current.dollarsSpent,
      startingTokensPerSecond: manualTokensPerSecond,
    });
    lastTickRef.current = now;
    setEconomy((current) => ({
      ...current,
      logicalTerminalCount: terminalCount,
      progress: 0,
      isInfinite: true,
      isComplete: false,
    }));
  }, [manualTokensPerSecond, terminalCount]);

  return { ...economy, startInfinity };
}
