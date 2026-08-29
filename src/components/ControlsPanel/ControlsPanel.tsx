import { useId, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatTerminalCount, INFINITY_UNLOCK_COUNT } from '../../utils/vibeEconomy';
import { SimpleYouTubePlayer } from '../YouTubeAudioPlayer/SimpleYouTubePlayer';

interface ControlsPanelProps {
  terminalCount: number;
  displayedTerminalCount?: number;
  onTerminalCountChange: (count: number) => void;
  onArrangeTerminals?: () => void;
  minTerminals?: number;
  maxTerminals?: number;
  catCount?: number;
  onRemoveAllCats?: () => void;
  infinityUnlocked?: boolean;
  infinityActive?: boolean;
  onStartInfinity?: () => void;
  onPreviewReceipt?: () => void;
}

export function ControlsPanel({
  terminalCount,
  displayedTerminalCount = terminalCount,
  onTerminalCountChange,
  onArrangeTerminals,
  minTerminals = 1,
  maxTerminals = 10_000,
  catCount = 0,
  onRemoveAllCats,
  infinityUnlocked = false,
  infinityActive = false,
  onStartInfinity,
  onPreviewReceipt,
}: ControlsPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const infinityTooltipId = useId();
  const { themeName, setTheme, getThemeNames } = useTheme();
  const manualControlsDisabled = infinityActive;
  const remainingToUnlock = Math.max(0, INFINITY_UNLOCK_COUNT - terminalCount);
  const youtubeVideos = [
    {
      id: 'n61ULEU7CO0',
      url: 'https://www.youtube.com/watch?v=n61ULEU7CO0',
      title: 'Best of lofi hip hop 2021 ✨ [beats to relax/study to]',
    },
  ];

  const handleIncrement = () => {
    if (!manualControlsDisabled && terminalCount < maxTerminals) {
      onTerminalCountChange(terminalCount + 1);
    }
  };

  const handleIncrementByTen = () => {
    if (!manualControlsDisabled && terminalCount < maxTerminals) {
      onTerminalCountChange(Math.min(terminalCount + 10, maxTerminals));
    }
  };

  const handleDecrement = () => {
    if (!manualControlsDisabled && terminalCount > minTerminals) {
      onTerminalCountChange(terminalCount - 1);
    }
  };

  const handleDecrementByTen = () => {
    if (!manualControlsDisabled && terminalCount > minTerminals) {
      onTerminalCountChange(Math.max(terminalCount - 10, minTerminals));
    }
  };

  const handleThemeToggle = () => {
    const themes = getThemeNames();
    const currentIndex = themes.indexOf(themeName);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  };

  const handleStartInfinity = () => {
    if (infinityUnlocked && !infinityActive) {
      onStartInfinity?.();
    }
  };

  return (
    <>
      <section
        className={`control-panel ${isVisible ? 'control-panel--visible' : 'control-panel--hidden'}`}
        aria-label="Vibe controls"
      >
        <div className="control-panel__inner">
          <div className="control-panel__header">
            <div>
              <span className="control-panel__eyebrow">DESKTOP LOAD</span>
              <h2>Terminal Controls</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="control-panel__close"
              aria-label="Hide controls"
            >
              ×
            </button>
          </div>

          <div className="terminal-count-control">
            <button
              type="button"
              onClick={handleDecrementByTen}
              disabled={manualControlsDisabled || terminalCount <= minTerminals}
              className="count-button count-button--remove"
              aria-label="Remove ten terminals"
            >
              -10
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={manualControlsDisabled || terminalCount <= minTerminals}
              className="count-button count-button--remove"
              aria-label="Remove terminal"
            >
              -
            </button>
            <span className="terminal-count-control__value" data-testid="terminal-count-control-value">
              {formatTerminalCount(displayedTerminalCount)}
              <small>terminal{displayedTerminalCount === 1 ? '' : 's'}</small>
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={manualControlsDisabled || terminalCount >= maxTerminals}
              className="count-button count-button--add"
              aria-label="Add terminal"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleIncrementByTen}
              disabled={manualControlsDisabled || terminalCount >= maxTerminals}
              className="count-button count-button--add"
              aria-label="Add ten terminals"
            >
              +10
            </button>
          </div>

          <div className="infinity-control">
            <div className="infinity-button-shell">
              <button
                type="button"
                className={`infinity-button ${infinityUnlocked ? 'infinity-button--unlocked' : 'infinity-button--locked'} ${infinityActive ? 'infinity-button--active' : ''}`}
                disabled={infinityActive}
                aria-disabled={!infinityUnlocked || infinityActive}
                aria-describedby={!infinityUnlocked ? infinityTooltipId : undefined}
                onClick={handleStartInfinity}
                aria-label={
                  infinityActive
                    ? 'Infinite terminals active'
                    : infinityUnlocked
                      ? 'Start infinite terminals'
                      : `Infinite terminals unlock at ${INFINITY_UNLOCK_COUNT} terminals`
                }
              >
                +∞
              </button>
              {!infinityUnlocked && (
                <span
                  id={infinityTooltipId}
                  role="tooltip"
                  className="infinity-lock-tooltip"
                >
                  Unlocked at {INFINITY_UNLOCK_COUNT} terminals
                </span>
              )}
            </div>
            <span className="infinity-control__copy">
              {infinityActive
                ? 'Vibe singularity active'
                : infinityUnlocked
                  ? 'Unlocked — 90 seconds to $1B'
                  : `Unlocks at ${INFINITY_UNLOCK_COUNT} terminals · ${remainingToUnlock} to go`}
            </span>
          </div>

          <div className="control-panel__actions">
            {onArrangeTerminals && (
              <button
                type="button"
                onClick={onArrangeTerminals}
                className="panel-action panel-action--arrange"
                aria-label="Arrange terminals in grid"
              >
                Arrange
              </button>
            )}
            <button
              type="button"
              onClick={handleThemeToggle}
              className="panel-action panel-action--theme"
              aria-label={`Switch theme (current: ${themeName})`}
            >
              Theme: {themeName}
            </button>
          </div>

          {catCount > 0 && onRemoveAllCats && (
            <div className="cat-control">
              <span>🐱 {catCount} vibe cat{catCount === 1 ? '' : 's'}</span>
              <button type="button" onClick={onRemoveAllCats} aria-label="Remove all cats">
                Clear cats
              </button>
            </div>
          )}

          <SimpleYouTubePlayer videos={youtubeVideos} />

          {onPreviewReceipt && (
            <button type="button" className="receipt-preview-link" onClick={onPreviewReceipt}>
              Preview receipt ↗ <span>local only</span>
            </button>
          )}

          <footer className="control-panel__footer">
            Made with ❤️ by{' '}
            <a href="https://x.com/gregkamradt" target="_blank" rel="noopener noreferrer">
              Greg Kamradt
            </a>
            <span> · </span>
            <a href="https://github.com/gkamradt/MultiTerminalCodeViz" target="_blank" rel="noopener noreferrer">
              Code
            </a>
            <span> · </span>
            <a href="/typer">vibe typer</a>
          </footer>
        </div>
      </section>

      {!isVisible && (
        <button
          type="button"
          onClick={() => setIsVisible(true)}
          className="control-panel-reveal"
          aria-label="Show controls"
        >
          Controls
        </button>
      )}
    </>
  );
}
