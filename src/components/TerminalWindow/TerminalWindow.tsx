import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import './TerminalWindow.css';
import { useTypewriter } from '../../hooks/useTypewriter';
import { terminalOutputs } from '../../data/terminalOutputs';
import { useTheme } from '../../contexts/ThemeContext';
import { generateMultiLineAsciiArt } from '../../utils/asciiArt';

interface TerminalWindowProps {
  id: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width?: number; height?: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  title?: string;
  onClose?: (id: string) => void;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  zIndex?: number;
  onFocus?: (id: string) => void;
  totalTerminalCount?: number;
  animated?: boolean;
}

const DEFAULT_WIDTH = 650;
const DEFAULT_HEIGHT = 450;
const VIBE_ASCII_ART = generateMultiLineAsciiArt(['I VIBE MORE', 'THAN YOU'])
  .map((line) => line.trimEnd());
const OUTPUT_TYPES = ['conversation', 'troubleshooting', 'epic'] as const;

function getNumericId(id: string) {
  const match = id.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

function TerminalWindowComponent({
  id,
  initialPosition = { x: 0, y: 0 },
  initialSize = {},
  minSize = { width: 220, height: 160 },
  maxSize = { width: 1_200, height: 800 },
  title = 'Terminal',
  onClose,
  onPositionChange,
  zIndex = 10,
  onFocus,
  totalTerminalCount = 1,
  animated = true,
}: TerminalWindowProps) {
  const { currentTheme, getColorForRole } = useTheme();
  const nodeRef = useRef<HTMLDivElement>(null);
  const { x: initialX, y: initialY } = initialPosition;
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({
    width: initialSize.width ?? DEFAULT_WIDTH,
    height: initialSize.height ?? DEFAULT_HEIGHT,
  });

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  useEffect(() => {
    setSize({
      width: initialSize.width ?? DEFAULT_WIDTH,
      height: initialSize.height ?? DEFAULT_HEIGHT,
    });
  }, [initialSize.height, initialSize.width]);

  const terminalIndex = getNumericId(id);
  const outputType = OUTPUT_TYPES[terminalIndex % OUTPUT_TYPES.length];
  const outputLines = terminalOutputs[outputType];
  const terminalSpeed = useMemo(() => {
    const baseSpeed = totalTerminalCount > 100 ? 85 : 52;
    const deterministicVariation = ((terminalIndex * 37) % 51) / 100 - 0.25;
    return Math.round(baseSpeed * (1 + deterministicVariation));
  }, [terminalIndex, totalTerminalCount]);
  const loginTime = useMemo(() => {
    if (id.includes('test')) return new Date('2024-06-12T20:41:30.000Z');
    return new Date(Date.now() - 12 * 60 * 60 * 1_000);
  }, [id]);
  const staticLines = useMemo(() => outputLines.slice(0, 7), [outputLines]);
  const typewriter = useTypewriter({
    lines: outputLines,
    speed: terminalSpeed,
    enabled: animated,
    loop: animated,
    loopDelay: 3_000,
  });
  const visibleLines = animated ? typewriter.displayedLines : staticLines;

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (animated && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [animated, visibleLines]);

  return (
    <Draggable
      nodeRef={nodeRef as RefObject<HTMLElement>}
      handle=".terminal-title-bar"
      position={position}
      cancel=".no-drag, .react-resizable-handle"
      bounds="parent"
      onDrag={(_event, data) => setPosition({ x: data.x, y: data.y })}
      onStop={(_event, data) => {
        const nextPosition = { x: data.x, y: data.y };
        setPosition(nextPosition);
        onPositionChange?.(id, nextPosition);
      }}
    >
      <div
        ref={nodeRef}
        className="terminal-shell"
        style={{ position: 'absolute', zIndex }}
        onMouseDown={() => onFocus?.(id)}
      >
        <ResizableBox
          width={size.width}
          height={size.height}
          minConstraints={[minSize.width, minSize.height]}
          maxConstraints={[maxSize.width, maxSize.height]}
          className="shadow-2xl rounded"
          onResize={(_event, data) => setSize(data.size)}
        >
          <section
            className={`terminal-window ${currentTheme.background} border-black rounded overflow-hidden w-full h-full flex flex-col subpixel-antialiased`}
            id={`terminal-${id}`}
            aria-label={title}
          >
            <header
              className="terminal-title-bar bg-gray-400 border-b border-gray-500 h-6 flex items-center text-center text-black select-none cursor-move"
              onMouseDown={() => onFocus?.(id)}
            >
              <div className="flex ml-2 items-center space-x-2 no-drag">
                <button
                  type="button"
                  className="terminal-traffic-light terminal-traffic-light--close"
                  onClick={() => onClose?.(id)}
                  aria-label={`Close ${title}`}
                />
                <span className="terminal-traffic-light terminal-traffic-light--minimize" />
                <span className="terminal-traffic-light terminal-traffic-light--maximize" />
              </div>
              <p className="terminal-title mx-auto pr-16 text-center text-sm">{title}</p>
            </header>

            <div
              ref={contentRef}
              className={`terminal-content flex-grow pl-2 pr-2 pt-1 ${getColorForRole('primary')} font-mono text-xs ${currentTheme.background} overflow-y-auto select-text text-left`}
              onMouseDown={() => onFocus?.(id)}
            >
              <pre className={`terminal-ascii pb-2 ${getColorForRole('accent')}`}>
                {VIBE_ASCII_ART.join('\n')}
              </pre>

              <p className={`pb-1 ${getColorForRole('muted')}`}>
                Last login: {loginTime.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                  timeZone: 'UTC',
                })} on ttys002
              </p>

              <div className="pb-1">
                <span className={getColorForRole('info')}>user@localhost</span>
                <span className={getColorForRole('primary')}>:</span>
                <span className={getColorForRole('info')}>~</span>
                <span className={getColorForRole('primary')}>$ </span>
                <span className={getColorForRole('muted')}>npm run dev</span>
              </div>

              {visibleLines.map((line, index) => {
                if (!line) return null;
                const colorClass = line.colorRole
                  ? getColorForRole(line.colorRole)
                  : line.color || getColorForRole('primary');
                return (
                  <div
                    key={`${index}-${line.text}`}
                    className={`${colorClass} ${line.bold ? 'font-bold' : ''} pb-0.5`}
                  >
                    {line.text || '\u00A0'}
                  </div>
                );
              })}

              {(!animated || !typewriter.isTyping) && (
                <div className="pb-1">
                  <span className={getColorForRole('info')}>user@localhost</span>
                  <span className={getColorForRole('primary')}>:</span>
                  <span className={getColorForRole('info')}>~</span>
                  <span className={getColorForRole('primary')}>$ </span>
                  <span className={`terminal-cursor ${getColorForRole('primary').replace('text-', 'bg-')}`} />
                </div>
              )}
            </div>
          </section>
        </ResizableBox>
      </div>
    </Draggable>
  );
}

export const TerminalWindow = memo(TerminalWindowComponent);
