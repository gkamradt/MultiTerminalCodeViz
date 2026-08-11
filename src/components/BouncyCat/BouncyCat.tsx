import { memo, useMemo } from 'react';
import type { CSSProperties } from 'react';

interface BouncyCatProps {
  id: string;
  totalCatCount?: number;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function seededViewport(seed: number, offset: number, max: number, unit: 'vw' | 'vh') {
  const value = Math.abs(Math.sin(seed * 12.9898 + offset * 78.233) * 43_758.5453);
  return `${Math.round((value % 1) * max)}${unit}`;
}

function BouncyCatComponent({ id, totalCatCount = 1 }: BouncyCatProps) {
  const style = useMemo(() => {
    const seed = hashString(id);
    const duration = Math.max(7, 15 - Math.min(totalCatCount, 12) * 0.35);

    return {
      '--cat-x0': seededViewport(seed, 1, 88, 'vw'),
      '--cat-y0': seededViewport(seed, 2, 82, 'vh'),
      '--cat-x1': seededViewport(seed, 3, 90, 'vw'),
      '--cat-y1': seededViewport(seed, 4, 84, 'vh'),
      '--cat-x2': seededViewport(seed, 5, 89, 'vw'),
      '--cat-y2': seededViewport(seed, 6, 83, 'vh'),
      '--cat-x3': seededViewport(seed, 7, 91, 'vw'),
      '--cat-y3': seededViewport(seed, 8, 85, 'vh'),
      '--cat-duration': `${duration + (seed % 5)}s`,
      '--cat-delay': `${-(seed % 11)}s`,
      '--cat-direction': seed % 2 === 0 ? 1 : -1,
    } as CSSProperties;
  }, [id, totalCatCount]);

  return (
    <div className="bouncy-cat" style={style} aria-hidden="true">
      <img src="/nyancat.gif" alt="" width={64} height={64} />
    </div>
  );
}

export const BouncyCat = memo(BouncyCatComponent);
