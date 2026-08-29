import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export function CrtFinale({ children }: { children?: ReactNode }) {
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => setShowReceipt(true), reducedMotion ? 0 : 2_800);
    return () => window.clearTimeout(timeout);
  }, []);

  if (showReceipt) return children;

  return (
    <div className="crt-finale" role="status" aria-label="One billion dollar vibe overload">
      <div className="crt-finale__flash" />
      <svg
        className="crt-finale__cracks"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g className="crt-finale__crack-group">
          <path d="M510 338 438 250 401 178 326 105 248 36" />
          <path d="M453 269 360 280 291 252 204 268 101 229" />
          <path d="M406 184 431 116 404 49" />
          <path d="M510 338 597 260 642 183 728 137 799 49" />
          <path d="M595 263 700 279 777 246 884 271 974 232" />
          <path d="M644 184 617 104 661 31" />
          <path d="M510 338 445 421 419 513 343 575 302 687" />
          <path d="M451 414 356 402 278 449 172 428 61 486" />
          <path d="M420 513 464 578 441 675" />
          <path d="M510 338 583 426 608 516 687 583 729 692" />
          <path d="M580 420 682 404 758 452 855 432 954 493" />
          <path d="M607 516 565 592 592 684" />
          <circle cx="510" cy="338" r="18" />
        </g>
      </svg>
      <div className="crt-finale__shutter crt-finale__shutter--top" />
      <div className="crt-finale__shutter crt-finale__shutter--bottom" />
      <div className="crt-finale__line" />
      <div className="crt-finale__dot" />
      <span className="sr-only">One billion dollars spent. Signal lost.</span>
    </div>
  );
}
