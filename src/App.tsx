import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TerminalWindow } from './components/TerminalWindow/TerminalWindow';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { BouncyCat } from './components/BouncyCat/BouncyCat';
import { BurnRateHUD } from './components/BurnRateHUD/BurnRateHUD';
import { CrtFinale } from './components/CrtFinale/CrtFinale';
import { AsciiTyper } from './pages/AsciiTyper';
import { useVibeEconomy } from './hooks/useVibeEconomy';
import { INFINITY_UNLOCK_COUNT } from './utils/vibeEconomy';

interface Size {
  width: number;
  height: number;
}

interface Terminal {
  id: string;
  position: { x: number; y: number };
  size: Size;
  zIndex: number;
}

interface ViewportProfile {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  maxRenderedTerminals: number;
  maxAnimatedTerminals: number;
  maxCats: number;
  terminalSize: Size;
  minTerminalSize: Size;
  maxTerminalSize: Size;
}

function getViewportProfile(): ViewportProfile {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1_024;
  const terminalWidth = isMobile
    ? Math.max(280, width - 24)
    : isTablet
      ? Math.min(520, width - 32)
      : Math.min(650, width - 48);
  const terminalHeight = isMobile
    ? Math.max(220, Math.min(320, height * 0.42))
    : isTablet
      ? Math.min(390, height * 0.55)
      : Math.min(450, height * 0.62);

  return {
    width,
    height,
    isMobile,
    isTablet,
    maxRenderedTerminals: isMobile ? 8 : isTablet ? 18 : 36,
    maxAnimatedTerminals: isMobile ? 3 : isTablet ? 5 : 8,
    maxCats: isMobile ? 5 : isTablet ? 7 : 10,
    terminalSize: { width: terminalWidth, height: terminalHeight },
    minTerminalSize: isMobile
      ? { width: Math.min(280, width - 16), height: 180 }
      : { width: 220, height: 160 },
    maxTerminalSize: {
      width: Math.max(280, width - (isMobile ? 8 : 24)),
      height: Math.max(220, height - (isMobile ? 120 : 24)),
    },
  };
}

function useViewportProfile() {
  const [profile, setProfile] = useState(getViewportProfile);

  useEffect(() => {
    let frame: number | undefined;
    const handleResize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setProfile(getViewportProfile()));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return profile;
}

function clampPosition(
  position: { x: number; y: number },
  size: Size,
  profile: ViewportProfile,
) {
  const minX = profile.isMobile ? -Math.max(0, size.width - profile.width + 12) : 0;
  const maxX = Math.max(minX, profile.width - Math.min(size.width, profile.width));
  const minY = profile.isMobile ? 94 : 0;
  const maxY = Math.max(minY, profile.height - Math.min(size.height, profile.height));
  return {
    x: Math.max(minX, Math.min(position.x, maxX)),
    y: Math.max(minY, Math.min(position.y, maxY)),
  };
}

function AppContent() {
  const profile = useViewportProfile();
  const profileRef = useRef(profile);
  const nextTerminalIdRef = useRef(1);
  const highestZIndexRef = useRef(1);
  const [actualTerminalCount, setActualTerminalCount] = useState(1);
  const [infinityUnlocked, setInfinityUnlocked] = useState(false);
  const [catsSuppressed, setCatsSuppressed] = useState(false);
  const economy = useVibeEconomy(actualTerminalCount);

  const makeTerminal = useCallback((overrideSize?: Size): Terminal => {
    const currentProfile = profileRef.current;
    const size = overrideSize ?? currentProfile.terminalSize;
    const safeTop = currentProfile.isMobile ? 106 : 18;
    const availableX = Math.max(1, currentProfile.width - Math.min(size.width, currentProfile.width));
    const availableY = Math.max(1, currentProfile.height - safeTop - Math.min(size.height, currentProfile.height));
    const sequence = nextTerminalIdRef.current;
    highestZIndexRef.current += 1;
    nextTerminalIdRef.current += 1;
    const rawPosition = {
      x: Math.floor((Math.sin(sequence * 91.17) * 0.5 + 0.5) * availableX),
      y: safeTop + Math.floor((Math.sin(sequence * 47.73 + 2) * 0.5 + 0.5) * availableY),
    };

    return {
      id: `terminal-${sequence}`,
      position: clampPosition(rawPosition, size, currentProfile),
      size,
      zIndex: highestZIndexRef.current,
    };
  }, []);

  const [terminals, setTerminals] = useState<Terminal[]>(() => {
    const size = profile.terminalSize;
    return [{
      id: 'terminal-0',
      position: clampPosition({ x: Math.max(8, profile.width * 0.48), y: Math.max(112, profile.height * 0.2) }, size, profile),
      size,
      zIndex: 1,
    }];
  });
  const terminalsRef = useRef(terminals);

  const commitTerminals = useCallback((nextTerminals: Terminal[]) => {
    terminalsRef.current = nextTerminals;
    setTerminals(nextTerminals);
  }, []);

  const reconcileTerminalPool = useCallback((targetCount: number, replaceNewest = false) => {
    const targetSize = Math.min(targetCount, profileRef.current.maxRenderedTerminals);
    let next = terminalsRef.current.slice(-targetSize);

    while (next.length < targetSize) next.push(makeTerminal());

    if (replaceNewest && next.length === targetSize && targetSize > 0) {
      next = [...next.slice(1), makeTerminal()];
    }

    commitTerminals(next);
  }, [commitTerminals, makeTerminal]);

  useEffect(() => {
    profileRef.current = profile;
    const targetSize = Math.min(actualTerminalCount, profile.maxRenderedTerminals);
    const next = terminalsRef.current.slice(-targetSize).map((terminal) => {
      const size = {
        width: Math.min(terminal.size.width, profile.maxTerminalSize.width),
        height: Math.min(terminal.size.height, profile.maxTerminalSize.height),
      };
      return {
        ...terminal,
        size,
        position: clampPosition(terminal.position, size, profile),
      };
    });
    while (next.length < targetSize) next.push(makeTerminal());
    commitTerminals(next);
  }, [actualTerminalCount, commitTerminals, makeTerminal, profile]);

  useEffect(() => {
    if (actualTerminalCount >= INFINITY_UNLOCK_COUNT) setInfinityUnlocked(true);
  }, [actualTerminalCount]);

  useEffect(() => {
    if (!economy.isInfinite || economy.isComplete) return undefined;
    const interval = window.setInterval(
      () => reconcileTerminalPool(profileRef.current.maxRenderedTerminals, true),
      profileRef.current.isMobile ? 650 : profileRef.current.isTablet ? 420 : 260,
    );
    return () => window.clearInterval(interval);
  }, [economy.isComplete, economy.isInfinite, reconcileTerminalPool]);

  const handleTerminalCountChange = useCallback((count: number) => {
    if (economyRef.current) return;
    const safeCount = Math.max(1, Math.min(10_000, count));
    const shouldReplace = safeCount > actualCountRef.current
      && terminalsRef.current.length >= profileRef.current.maxRenderedTerminals;
    actualCountRef.current = safeCount;
    setActualTerminalCount(safeCount);
    setCatsSuppressed(false);
    reconcileTerminalPool(safeCount, shouldReplace);
  }, [reconcileTerminalPool]);

  const actualCountRef = useRef(actualTerminalCount);
  const economyRef = useRef(economy.isInfinite);
  useEffect(() => {
    actualCountRef.current = actualTerminalCount;
    economyRef.current = economy.isInfinite;
  }, [actualTerminalCount, economy.isInfinite]);

  const handleTerminalClose = useCallback((terminalId: string) => {
    if (economyRef.current) return;
    const nextCount = Math.max(1, actualCountRef.current - 1);
    actualCountRef.current = nextCount;
    setActualTerminalCount(nextCount);
    const withoutClosed = terminalsRef.current.filter((terminal) => terminal.id !== terminalId);
    commitTerminals(withoutClosed);
    reconcileTerminalPool(nextCount);
  }, [commitTerminals, reconcileTerminalPool]);

  const handlePositionChange = useCallback((terminalId: string, position: { x: number; y: number }) => {
    const next = terminalsRef.current.map((terminal) => (
      terminal.id === terminalId ? { ...terminal, position } : terminal
    ));
    commitTerminals(next);
  }, [commitTerminals]);

  const handleFocus = useCallback((terminalId: string) => {
    highestZIndexRef.current = Math.min(highestZIndexRef.current + 1, 9_900);
    const next = terminalsRef.current.map((terminal) => (
      terminal.id === terminalId
        ? { ...terminal, zIndex: highestZIndexRef.current }
        : terminal
    ));
    commitTerminals(next);
  }, [commitTerminals]);

  const handleArrangeTerminals = useCallback(() => {
    const currentProfile = profileRef.current;
    const count = Math.max(1, terminalsRef.current.length);
    const topOffset = currentProfile.isMobile ? 106 : 18;
    const gap = currentProfile.isMobile ? 8 : 14;
    const usableWidth = Math.max(1, currentProfile.width - gap * 2);
    const usableHeight = Math.max(1, currentProfile.height - topOffset - gap);
    const aspect = usableWidth / usableHeight;
    const columns = Math.max(1, Math.ceil(Math.sqrt(count * aspect)));
    const rows = Math.max(1, Math.ceil(count / columns));
    const cellWidth = Math.max(1, usableWidth / columns);
    const cellHeight = Math.max(1, usableHeight / rows);
    const size = {
      width: Math.min(
        currentProfile.maxTerminalSize.width,
        Math.max(currentProfile.minTerminalSize.width, cellWidth - gap),
      ),
      height: Math.min(
        currentProfile.maxTerminalSize.height,
        Math.max(currentProfile.minTerminalSize.height, cellHeight - gap),
      ),
    };

    const next = terminalsRef.current.map((terminal, index) => ({
      ...terminal,
      size,
      position: clampPosition({
        x: gap + (index % columns) * cellWidth,
        y: topOffset + Math.floor(index / columns) * cellHeight,
      }, size, currentProfile),
    }));
    commitTerminals(next);
  }, [commitTerminals]);

  const handleStartInfinity = useCallback(() => {
    if (!infinityUnlocked || economyRef.current) return;
    setCatsSuppressed(false);
    economy.startInfinity();
  }, [economy, infinityUnlocked]);

  const catCount = useMemo(() => {
    if (catsSuppressed && !economy.isInfinite) return 0;
    const manualCats = Math.min(profile.maxCats, Math.floor(actualTerminalCount / 5));
    if (!economy.isInfinite) return manualCats;
    return Math.min(
      profile.maxCats,
      Math.max(manualCats, 2 + Math.floor(economy.progress * profile.maxCats)),
    );
  }, [actualTerminalCount, catsSuppressed, economy.isInfinite, economy.progress, profile.maxCats]);

  return (
    <main className={`desktop-stage ${economy.isInfinite ? 'desktop-stage--infinite' : ''}`}>
      <BurnRateHUD
        tokensPerSecond={economy.tokensPerSecond}
        dollarsSpent={economy.dollarsSpent}
        terminalCount={economy.logicalTerminalCount}
        progress={economy.progress}
        isInfinite={economy.isInfinite}
      />

      <ControlsPanel
        terminalCount={actualTerminalCount}
        onTerminalCountChange={handleTerminalCountChange}
        onArrangeTerminals={handleArrangeTerminals}
        catCount={catCount}
        onRemoveAllCats={() => setCatsSuppressed(true)}
        infinityUnlocked={infinityUnlocked}
        infinityActive={economy.isInfinite}
        onStartInfinity={handleStartInfinity}
      />

      <div className="terminal-layer" aria-label="Terminal desktop">
        {terminals.map((terminal, index) => (
          <TerminalWindow
            key={terminal.id}
            id={terminal.id}
            title={`Terminal ${terminal.id.replace('terminal-', '')}`}
            initialPosition={terminal.position}
            initialSize={terminal.size}
            minSize={profile.minTerminalSize}
            maxSize={profile.maxTerminalSize}
            zIndex={terminal.zIndex}
            onFocus={handleFocus}
            onClose={handleTerminalClose}
            onPositionChange={handlePositionChange}
            totalTerminalCount={Math.min(actualTerminalCount, 101)}
            animated={index >= terminals.length - profile.maxAnimatedTerminals}
          />
        ))}
      </div>

      {Array.from({ length: catCount }, (_, index) => (
        <BouncyCat key={`cat-${index}`} id={`cat-${index}`} totalCatCount={catCount} />
      ))}

      {economy.isComplete && <CrtFinale />}
    </main>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/typer" element={<AsciiTyper />} />
          </Routes>
          <Analytics />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
