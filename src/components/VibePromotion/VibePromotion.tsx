import { memo } from 'react';
import { VIBE_PROMOTIONS } from '../../utils/vibeEconomy';
import type { VibeRank } from '../../utils/vibeEconomy';
import './VibePromotion.css';

export const VibePromotion = memo(function VibePromotion({ promotion }: { promotion: VibeRank }) {
  const level = VIBE_PROMOTIONS.indexOf(promotion);
  const next = VIBE_PROMOTIONS[level + 1];

  return (
    <section className="vibe-promotion" aria-label="Vibe career progress">
      <div
        key={promotion.threshold}
        className={`vibe-promotion__identity ${level > 0 ? 'vibe-promotion__identity--promoted' : ''}`}
        role="status"
      >
        <span className="vibe-promotion__badge" aria-hidden="true">↗</span>
        <div>
          <span className="vibe-promotion__eyebrow">
            {level > 0 ? 'Promotion unlocked' : 'Your vibe career'}
          </span>
          <h2>{promotion.title}</h2>
          <p>{promotion.description}</p>
        </div>
      </div>
      <div className="vibe-promotion__progress">
        <div className="vibe-promotion__steps" aria-label={`Rank ${level + 1} of ${VIBE_PROMOTIONS.length}`}>
          {VIBE_PROMOTIONS.map((rank, index) => (
            <span key={rank.threshold} className={index <= level ? 'is-earned' : ''} />
          ))}
        </div>
        <span>{next ? `Next at ${next.threshold.toLocaleString('en-US')} terminals` : 'Career peaked. Code has not.'}</span>
      </div>
    </section>
  );
});
