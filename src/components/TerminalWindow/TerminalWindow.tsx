import { useState, useEffect, useRef } from 'react';
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
  title?: string;
  onClose?: () => void;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  zIndex?: number;
  onFocus?: (id: string) => void;
}

const DEFAULT_WIDTH = 650;
const DEFAULT_HEIGHT = 450;

export function TerminalWindow({
  id,
  initialPosition = { x: 0, y: 0 },
  initialSize = {},
  title = 'Terminal',
  onClose,
  onPositionChange,
  zIndex = 10,
  onFocus
}: TerminalWindowProps) {
  const { currentTheme, getColorForRole } = useTheme();
  const nodeRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({
    width: initialSize.width ?? DEFAULT_WIDTH,
    height: initialSize.height ?? DEFAULT_HEIGHT,
  });

  // Static login time - calculated once when terminal is created
  // Use fixed date during testing for snapshot consistency
  const [loginTime] = useState(() => {
    // Check if we're in a test environment by looking for testing-specific props or environment
    const isTestEnv = id.includes('test');
    return isTestEnv 
      ? new Date('2024-06-12T20:41:30.000Z') // Fixed test date
      : new Date(Date.now() - 12 * 60 * 60 * 1000);
  });
  
  // Variable speed per terminal (±25% of base speed)
  const [terminalSpeed] = useState(() => {
    const baseSpeed = 50; // Base speed in ms
    const variation = 0.55; // ±25%
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation; // Random between 0.75 and 1.25
    return Math.round(baseSpeed * randomFactor);
  });
  
  // Terminal output animation
  // const outputTypes = ['development', 'build', 'error', 'conversation', 'troubleshooting', 'epic'] as const;
  const outputTypes = ['conversation', 'troubleshooting', 'epic'] as const;
  const terminalIndex = parseInt(id.split('-')[1]) || 0;
  const outputType = outputTypes[terminalIndex % outputTypes.length];
  const { displayedLines, isTyping } = useTypewriter({
    lines: terminalOutputs[outputType] || [],
    speed: terminalSpeed, // Use variable speed per terminal
    enabled: true,
    loop: true,
    loopDelay: 3000 // 3 seconds before restarting
  });
  
  // Auto-scroll to bottom when new content is added
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedLines]);

  // console.log(`Terminal ${id} using position:`, initialPosition);

  return (
    <Draggable 
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      handle=".terminal-title-bar" 
      position={initialPosition}
      cancel=".no-drag, .react-resizable-handle"
      bounds="parent"
      onDrag={(_e, data) => {
        if (onPositionChange) {
          onPositionChange(id, { x: data.x, y: data.y });
        }
      }}
    >
      <div
        ref={nodeRef}
        style={{ position: 'absolute', zIndex }}
        onPointerDown={() => onFocus && onFocus(id)}
      >
        <ResizableBox 
          width={size.width}
          height={size.height}
          minConstraints={[100, 80]} 
          maxConstraints={[1200, 800]}
          className="shadow-2xl rounded"
          onResize={(_e, data) => {
            setSize({ width: data.size.width, height: data.size.height });
          }}
        >
          <div 
            className={`terminal-window ${currentTheme.background} border-black rounded overflow-hidden w-full h-full flex flex-col subpixel-antialiased`}
            id={`terminal-${id}`}
          >
            {/* Title Bar */}
            <div className="terminal-title-bar bg-gray-400 border-b border-gray-500 h-6 flex items-center text-center text-black select-none cursor-move">
              {/* Traffic Lights */}
              <div className="flex ml-2 items-center space-x-2 no-drag">
                <div 
                  className="border-red-900 bg-red-500 shadow-inner rounded-full w-3 h-3 cursor-pointer hover:bg-red-600 transition-colors"
                  onClick={onClose}
                  title="Close terminal"
                ></div>
                <div className="border-yellow-900 bg-yellow-500 shadow-inner rounded-full w-3 h-3 cursor-pointer"></div>
                <div className="border-green-900 bg-green-500 shadow-inner rounded-full w-3 h-3 cursor-pointer"></div>
              </div>
              {/* Title */}
              <div className="mx-auto pr-16">
                <p className="text-center text-sm">{title}</p>
              </div>
            </div>

            {/* Content Area */}
            <div 
              ref={contentRef}
              className={`terminal-content flex-grow pl-2 pr-2 pt-1 h-auto ${getColorForRole('primary')} font-mono text-xs ${currentTheme.background} overflow-y-auto select-text text-left`}
            >
              {/* ASCII Art Header */}
              <pre>
              <div className={`pb-2 ${getColorForRole('accent')} font-mono text-xs leading-tight`}>
                {generateMultiLineAsciiArt(['I VIBE MORE', 'THAN YOU']).map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
              </pre>
              
              <p className={`pb-1 ${getColorForRole('muted')}`}>Last login: {loginTime.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' })} on ttys002</p>
              
              <div className="pb-1">
                <span className={getColorForRole('info')}>user@localhost</span>
                <span className={getColorForRole('primary')}>:</span>
                <span className={getColorForRole('info')}>~</span>
                <span className={getColorForRole('primary')}>$ </span>
                <span className={getColorForRole('muted')}>npm run dev</span>
              </div>
              
              {/* Animated output lines */}
              {displayedLines.map((line, index) => {
                if (!line) return null;
                // Use colorRole if available, fallback to legacy color, then to primary
                const colorClass = line.colorRole 
                  ? getColorForRole(line.colorRole)
                  : line.color || getColorForRole('primary');
                return (
                  <div 
                    key={index} 
                    className={`${colorClass} ${line.bold ? 'font-bold' : ''} pb-0.5`}
                  >
                    {line.text || '\u00A0'} {/* Non-breaking space for empty lines */}
                  </div>
                );
              })}
              
              {/* Cursor at the end when done typing */}
              {!isTyping && (
                <div className="pb-1">
                  <span className={getColorForRole('info')}>user@localhost</span>
                  <span className={getColorForRole('primary')}>:</span>
                  <span className={getColorForRole('info')}>~</span>
                  <span className={getColorForRole('primary')}>$ </span>
                  <span className={`inline-block w-1 h-3 ${getColorForRole('primary').replace('text-', 'bg-')} animate-pulse`}></span>
                </div>
              )}
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
} 