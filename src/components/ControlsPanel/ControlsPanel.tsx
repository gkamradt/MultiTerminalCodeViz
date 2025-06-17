import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SimpleYouTubePlayer } from '../YouTubeAudioPlayer/SimpleYouTubePlayer';

interface ControlsPanelProps {
  terminalCount: number;
  onTerminalCountChange: (count: number) => void;
  onArrangeTerminals?: () => void;
  minTerminals?: number;
  maxTerminals?: number;
  rabbitCount?: number;
  onRemoveAllRabbits?: () => void;
}

export function ControlsPanel({ 
  terminalCount, 
  onTerminalCountChange,
  onArrangeTerminals,
  minTerminals = 1, 
  maxTerminals = 10000,
  rabbitCount = 0,
  onRemoveAllRabbits
}: ControlsPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { themeName, setTheme, getThemeNames } = useTheme();

  // YouTube videos for the audio player
  const youtubeVideos = [
    { 
      id: 'jfKfPfyJRdk', 
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      title: 'lofi hip hop radio 📚 - beats to relax/study to'
    },
    {
      id: 'example2',
      url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
      title: 'lofi hip hop radio 🎵'
    }
  ];

  const handleIncrement = () => {
    if (terminalCount < maxTerminals) {
      onTerminalCountChange(terminalCount + 1);
    }
  };

  const handleIncrementByTen = () => {
    if (terminalCount < maxTerminals) {
      const newCount = Math.min(terminalCount + 10, maxTerminals);
      onTerminalCountChange(newCount);
    }
  };

  const handleDecrement = () => {
    if (terminalCount > minTerminals) {
      onTerminalCountChange(terminalCount - 1);
    }
  };

  const handleDecrementByTen = () => {
    if (terminalCount > minTerminals) {
      const newCount = Math.max(terminalCount - 10, minTerminals);
      onTerminalCountChange(newCount);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleThemeToggle = () => {
    const themes = getThemeNames();
    const currentIndex = themes.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <>
      {/* Main Controls Panel */}
      <div 
        className={`fixed top-4 left-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg transition-transform duration-300 ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 10001 }} // Ensure controls are always above rabbits and terminals
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium text-sm">Terminal Controls</h3>
            <button
              onClick={toggleVisibility}
              className="text-gray-400 hover:text-white transition-colors border-0 p-1 bg-transparent"
              style={{ backgroundColor: 'transparent' }}
              aria-label="Hide controls"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Terminal Count Control */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleDecrementByTen}
              disabled={terminalCount <= minTerminals}
              className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount <= minTerminals ? '#4b5563' : '#dc2626' }}
              aria-label="Remove ten terminals"
            >
              -10
            </button>

            <button
              onClick={handleDecrement}
              disabled={terminalCount <= minTerminals}
              className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount <= minTerminals ? '#4b5563' : '#dc2626' }}
              aria-label="Remove terminal"
            >
              -
            </button>

            <span className="text-white font-mono text-sm min-w-[3rem] text-center">
              {terminalCount} terminal{terminalCount !== 1 ? 's' : ''}
            </span>

            <button
              onClick={handleIncrement}
              disabled={terminalCount >= maxTerminals}
              className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount >= maxTerminals ? '#4b5563' : '#059669' }}
              aria-label="Add terminal"
            >
              +
            </button>

            <button
              onClick={handleIncrementByTen}
              disabled={terminalCount >= maxTerminals}
              className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount >= maxTerminals ? '#4b5563' : '#059669' }}
              aria-label="Add ten terminals"
            >
              +10
            </button>
          </div>

          {/* Arrange Button */}
          {onArrangeTerminals && (
            <button
              onClick={onArrangeTerminals}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0"
              style={{ backgroundColor: '#2563eb' }}
              aria-label="Arrange terminals in grid"
            >
              Arrange
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0"
            style={{ backgroundColor: '#7c3aed' }}
            aria-label={`Switch theme (current: ${themeName})`}
          >
            Theme: {themeName}
          </button>

          {/* Rabbit Controls (only show if rabbits exist) */}
          {rabbitCount > 0 && onRemoveAllRabbits && (
            <div className="space-y-2">
              <div className="text-center">
                <span className="text-white font-mono text-xs">
                  🐰 {rabbitCount} vibe rabbit{rabbitCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={onRemoveAllRabbits}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0"
                style={{ backgroundColor: '#ea580c' }}
                aria-label="Remove all rabbits"
              >
                Remove Rabbits
              </button>
            </div>
          )}

          {/* YouTube Audio Player */}
          <div className="space-y-2">
            <SimpleYouTubePlayer videos={youtubeVideos} />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-600 text-center">
            <p className="text-gray-400 text-xs">
              Made with ❤️ by{' '}
              <a 
                href="https://x.com/gregkamradt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Greg Kamradt
              </a>
              <br />
              <a
                href="https://github.com/gkamradt/MultiTerminalCodeViz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Code
              </a>
              {' '} • {' '}
              <a
                href="/typer"
                className="text-green-400 hover:text-green-300 transition-colors underline"
              >
                vibe typer
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Show Controls Button (appears when panel is hidden) */}
      {!isVisible && (
        <button
          onClick={toggleVisibility}
          className="fixed top-4 left-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg shadow-lg text-white transition-colors flex items-center justify-center p-0"
          style={{ backgroundColor: '#1f2937', zIndex: 10001 }}
          aria-label="Show controls"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </>
  );
} 