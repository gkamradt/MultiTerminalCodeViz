import {
  formatDollars,
  formatTerminalCount,
  formatTokensPerSecond,
} from '../../utils/vibeEconomy';
import type { VibeRank } from '../../utils/vibeEconomy';
import { VibePromotion } from '../VibePromotion/VibePromotion';

interface BurnRateHUDProps {
  tokensPerSecond: number;
  dollarsSpent: number;
  terminalCount: number;
  progress: number;
  isInfinite: boolean;
  promotion: VibeRank;
}

export function BurnRateHUD({
  tokensPerSecond,
  dollarsSpent,
  terminalCount,
  progress,
  isInfinite,
  promotion,
}: BurnRateHUDProps) {
  return (
    <aside className={`burn-rate-hud ${isInfinite ? 'burn-rate-hud--critical' : ''}`}>
      <div className="burn-rate-hud__header">
        <span className="burn-rate-hud__signal" aria-hidden="true" />
        <span>{isInfinite ? 'VIBE SINGULARITY' : 'LIVE BURN RATE'}</span>
        <span className="burn-rate-hud__model">GPT-5.6 SOL · OUTPUT</span>
      </div>

      <div className="burn-rate-hud__metrics">
        <div className="burn-rate-hud__metric">
          <span className="burn-rate-hud__label">Tokens / second</span>
          <strong className="burn-rate-hud__value" data-testid="tokens-per-second">
            {formatTokensPerSecond(tokensPerSecond)}
          </strong>
        </div>
        <div className="burn-rate-hud__metric">
          <span className="burn-rate-hud__label">Dollars spent</span>
          <strong className="burn-rate-hud__value burn-rate-hud__value--money" data-testid="dollars-spent">
            {formatDollars(dollarsSpent)}
          </strong>
        </div>
      </div>

      <div className="burn-rate-hud__footer">
        <span data-testid="burn-rate-terminal-count">
          {formatTerminalCount(terminalCount)} terminal{terminalCount === 1 ? '' : 's'}
        </span>
        <span>$30 / 1M output tokens</span>
      </div>

      {isInfinite && (
        <div
          className="burn-rate-hud__progress"
          role="progressbar"
          aria-label="Progress to one billion dollars"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}
      <VibePromotion promotion={promotion} />
    </aside>
  );
}
