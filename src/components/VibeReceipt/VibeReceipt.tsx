import { useEffect, useRef, useState } from 'react';
import { formatDollars, formatTerminalCount, formatVibeReceipt } from '../../utils/vibeEconomy';
import type { VibeRank } from '../../utils/vibeEconomy';
import './VibeReceipt.css';

interface VibeReceiptProps {
  dollarsSpent: number;
  terminalCount: number;
  promotion: VibeRank;
  onRestart: () => void;
  onBack?: () => void;
}

export function VibeReceipt({ dollarsSpent, terminalCount, promotion, onRestart, onBack }: VibeReceiptProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => { headingRef.current?.focus(); }, []);

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(formatVibeReceipt(dollarsSpent, terminalCount, promotion.title));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <section className="receipt-scene" aria-label="Vibe expense receipt">
      <div className="receipt-scene__status">
        <span className="receipt-scene__signal" aria-hidden="true" />
        {onBack ? 'LOCAL PREVIEW / EXAMPLE RECEIPT' : 'SESSION TERMINATED / VIBES PRESERVED'}
      </div>
      <div className="receipt-scene__content">
        <article className="vibe-receipt">
          <header className="vibe-receipt__header">
            <span className="vibe-receipt__merchant">I VIBE MORE<br />THAN YOU</span>
            <p>Artificial intelligence.<br />Very real confidence.</p>
          </header>

          <div className="vibe-receipt__reference">
            <span>VIBE EXPENSE REPORT</span>
            <span>#000000001</span>
          </div>

          <dl className="vibe-receipt__items">
            <div><dt>Output tokens</dt><dd>{formatDollars(dollarsSpent)}</dd></div>
            <div><dt>Actual understanding</dt><dd>$0.00</dd></div>
            <div><dt>Human supervision</dt><dd>NOT INCLUDED</dd></div>
          </dl>

          <div className="vibe-receipt__total">
            <span>TOTAL BURNED</span>
            <strong>{formatDollars(dollarsSpent)}</strong>
            <span>Paid with someone else's runway.</span>
          </div>

          <div className="vibe-receipt__deliverable">
            <span>AND ALL YOU GOT WAS</span>
            <h1 ref={headingRef} tabIndex={-1}>One button centered.</h1>
            <p>It looks incredible, though.</p>
          </div>

          <dl className="vibe-receipt__items vibe-receipt__results">
            <div><dt>Tests written</dt><dd>0</dd></div>
            <div><dt>Peak terminals</dt><dd>{formatTerminalCount(terminalCount)}</dd></div>
            <div><dt>Highest promotion</dt><dd>{promotion.title}</dd></div>
          </dl>

          <footer className="vibe-receipt__footer">
            <span className="vibe-receipt__stamp">VIBE APPROVED</span>
            <p>No refunds.<br />Only follow-up prompts.</p>
            <div className="vibe-receipt__barcode" aria-hidden="true" />
            <small>ivibemorethanyou.com</small>
          </footer>
        </article>

        <div className="receipt-scene__actions">
          <button type="button" onClick={copyReceipt}>
            {copyStatus === 'copied' ? 'Copied ✓' : 'Copy receipt'}
          </button>
          <button type="button" className="receipt-scene__restart" onClick={onRestart} aria-label="Raise another round (restart)">
            Raise another round ↗
          </button>
        </div>
        <p className="receipt-scene__disclaimer" role="status">
          {copyStatus === 'failed'
            ? 'Copy unavailable. Select the receipt text to copy it manually.'
            : 'All figures simulated. Your card is safe.'}
        </p>
        {onBack && <button type="button" className="receipt-scene__back" onClick={onBack}>← Back to the desktop</button>}
      </div>
    </section>
  );
}
