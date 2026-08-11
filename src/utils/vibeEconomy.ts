export const GPT_56_SOL_OUTPUT_PRICE_PER_MILLION = 30;
export const DOLLARS_PER_OUTPUT_TOKEN = GPT_56_SOL_OUTPUT_PRICE_PER_MILLION / 1_000_000;
export const INFINITY_UNLOCK_COUNT = 25;
export const INFINITY_DURATION_MS = 90_000;
export const BILLION_DOLLAR_TARGET = 1_000_000_000;

const TERMINAL_TOKEN_RATES = [1_375, 3_250, 2_125, 3_625, 1_750, 2_875, 2_500, 2_500];
const TERMINAL_RATE_CYCLE_TOTAL = TERMINAL_TOKEN_RATES.reduce((sum, rate) => sum + rate, 0);
export const AVERAGE_TERMINAL_TOKENS_PER_SECOND =
  TERMINAL_RATE_CYCLE_TOTAL / TERMINAL_TOKEN_RATES.length;

export interface InfinitySnapshot {
  elapsedMs: number;
  progress: number;
  tokensPerSecond: number;
  dollarsSpent: number;
  logicalTerminalCount: number;
  isComplete: boolean;
}

export function getTerminalTokensPerSecond(terminalIndex: number) {
  const normalizedIndex = Math.max(0, Math.floor(terminalIndex));
  return TERMINAL_TOKEN_RATES[normalizedIndex % TERMINAL_TOKEN_RATES.length];
}

export function getManualTokensPerSecond(terminalCount: number) {
  const safeCount = Math.max(0, Math.floor(terminalCount));
  const fullCycles = Math.floor(safeCount / TERMINAL_TOKEN_RATES.length);
  const remainder = safeCount % TERMINAL_TOKEN_RATES.length;
  let total = fullCycles * TERMINAL_RATE_CYCLE_TOTAL;

  for (let index = 0; index < remainder; index += 1) {
    total += TERMINAL_TOKEN_RATES[index];
  }

  return total;
}

export function getLogicalTerminalCount(tokensPerSecond: number) {
  const safeRate = Math.max(0, tokensPerSecond);
  const fullCycles = Math.floor(safeRate / TERMINAL_RATE_CYCLE_TOTAL);
  let count = fullCycles * TERMINAL_TOKEN_RATES.length;
  let remainder = safeRate - fullCycles * TERMINAL_RATE_CYCLE_TOTAL;

  for (const rate of TERMINAL_TOKEN_RATES) {
    if (remainder <= 0.000_001) break;
    count += 1;
    remainder -= rate;
  }

  return Math.min(Number.MAX_SAFE_INTEGER, count);
}

function exponentialRatio(growth: number) {
  if (growth === 0) return 1;
  return Math.expm1(growth) / growth;
}

export function solveInfinityGrowth({
  startingDollars,
  startingTokensPerSecond,
}: {
  startingDollars: number;
  startingTokensPerSecond: number;
}) {
  const durationSeconds = INFINITY_DURATION_MS / 1_000;
  const remainingTokenBudget = Math.max(
    0,
    (BILLION_DOLLAR_TARGET - startingDollars) / DOLLARS_PER_OUTPUT_TOKEN,
  );
  const safeStartingRate = Math.max(1, startingTokensPerSecond);
  const targetRatio = remainingTokenBudget / (safeStartingRate * durationSeconds);

  if (targetRatio <= 1) return 0;

  let low = 0;
  let high = 1;
  while (exponentialRatio(high) < targetRatio && high < 128) high *= 2;

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const middle = (low + high) / 2;
    if (exponentialRatio(middle) < targetRatio) low = middle;
    else high = middle;
  }

  return (low + high) / 2;
}

export function calculateInfinitySnapshot({
  elapsedMs,
  startingDollars,
  startingTerminalCount,
  manualTokensPerSecond,
  growth = solveInfinityGrowth({
    startingDollars,
    startingTokensPerSecond: manualTokensPerSecond,
  }),
}: {
  elapsedMs: number;
  startingDollars: number;
  startingTerminalCount: number;
  manualTokensPerSecond: number;
  growth?: number;
}): InfinitySnapshot {
  const safeElapsedMs = Math.max(0, elapsedMs);
  const progress = Math.min(1, safeElapsedMs / INFINITY_DURATION_MS);
  const durationSeconds = INFINITY_DURATION_MS / 1_000;
  const safeStartingRate = Math.max(1, manualTokensPerSecond);
  const tokensPerSecond = safeStartingRate * Math.exp(growth * progress);
  const dollarsSpent = progress >= 1
    ? BILLION_DOLLAR_TARGET
    : startingDollars
      + DOLLARS_PER_OUTPUT_TOKEN
        * safeStartingRate
        * durationSeconds
        * (growth === 0 ? progress : Math.expm1(growth * progress) / growth);
  const logicalTerminalCount = Math.max(
    startingTerminalCount,
    getLogicalTerminalCount(tokensPerSecond),
  );

  return {
    elapsedMs: Math.min(safeElapsedMs, INFINITY_DURATION_MS),
    progress,
    tokensPerSecond,
    dollarsSpent,
    logicalTerminalCount,
    isComplete: progress >= 1,
  };
}

export function formatTokensPerSecond(value: number) {
  if (value < 1_000_000) return Math.round(value).toLocaleString('en-US');
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTerminalCount(value: number) {
  if (value < 100_000) return Math.round(value).toLocaleString('en-US');
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDollars(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.min(BILLION_DOLLAR_TARGET, value));
}
