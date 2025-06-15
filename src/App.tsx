import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TerminalWindow } from './components/TerminalWindow/TerminalWindow';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { AsciiTyper } from './pages/AsciiTyper';
import { useState } from 'react';
import { Analytics } from "@vercel/analytics/react"

interface Terminal {
  id: string;
  position: { x: number; y: number };
  zIndex: number;
}

function AppContent() {
  // Generate random position for a new terminal within safe bounds
  const generateRandomPosition = () => {
    const padding = 100; // Extra padding to avoid edge cases
    const maxX = Math.max(50, window.innerWidth - 200 - padding);
    const maxY = Math.max(50, window.innerHeight - 150 - padding);

    const position = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    };

    return position;
  };

  // Hold all terminals directly in state so changes trigger re-renders
  const [highestZIndex, setHighestZIndex] = useState(1);

  const [terminals, setTerminals] = useState<Terminal[]>(() => [
    {
      id: 'terminal-0',
      position: generateRandomPosition(),
      zIndex: 1,
    },
  ]);

  const terminalCount = terminals.length;

  const handleTerminalCountChange = (count: number) => {
    setTerminals((prev) => {
      let updated = [...prev];
      let newZ = highestZIndex;

      // Add new terminals if needed
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          newZ += 1;
          updated.push({
            id: `terminal-${i}`,
            position: generateRandomPosition(),
            zIndex: newZ,
          });
        }
      } else if (count < prev.length) {
        // Remove terminals from the end
        updated = updated.slice(0, count);
      }

      setHighestZIndex(newZ);
      return updated;
    });
  };

  const handleTerminalClose = (terminalId: string) => {
    setTerminals((prev) => prev.filter(terminal => terminal.id !== terminalId));
  };

  const handlePositionChange = (terminalId: string, position: { x: number; y: number }) => {
    setTerminals((prev) =>
      prev.map((terminal) =>
        terminal.id === terminalId
          ? { ...terminal, position }
          : terminal
      )
    );
  };

  const handleFocus = (terminalId: string) => {
    const newZ = highestZIndex + 1;
    setHighestZIndex(newZ);
    setTerminals((prev) =>
      prev.map((terminal) =>
        terminal.id === terminalId ? { ...terminal, zIndex: newZ } : terminal
      )
    );
  };

  const handleArrangeTerminals = () => {
    setTerminals((prev) => {
      const terminalWidth = 320; // Default terminal width + some padding
      const terminalHeight = 280; // Default terminal height + some padding
      const padding = 20;
      const layerOffset = 15; // Offset between layers
      
      // Calculate viewport constraints
      const availableWidth = window.innerWidth - 200; // Account for controls panel
      const availableHeight = window.innerHeight - 100; // Account for some top/bottom padding
      
      const terminalsPerRow = Math.floor(availableWidth / terminalWidth);
      const maxRows = Math.floor(availableHeight / terminalHeight);
      const terminalsPerLayer = terminalsPerRow * maxRows;
      
      return prev.map((terminal, index) => {
        // Determine which layer this terminal belongs to
        const layer = Math.floor(index / terminalsPerLayer);
        const indexInLayer = index % terminalsPerLayer;
        
        const row = Math.floor(indexInLayer / terminalsPerRow);
        const col = indexInLayer % terminalsPerRow;
        
        // Checkerboard offset - alternate starting positions
        const offsetX = (row % 2) * (terminalWidth / 2);
        
        // Layer offset - each layer is slightly behind and offset
        const layerOffsetX = layer * layerOffset;
        const layerOffsetY = layer * layerOffset;
        
        const x = col * terminalWidth + padding + offsetX + layerOffsetX + 150; // Extra offset for controls
        const y = row * terminalHeight + padding + layerOffsetY + 50;
        
        return {
          ...terminal,
          position: { x, y }
        };
      });
    });
  };

  return (
    <div 
      className="text-white overflow-hidden relative" 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        margin: 0, 
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundImage: 'url("sonomaBackground.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Controls Panel - positioned absolutely in top-left */}
      <ControlsPanel 
        terminalCount={terminalCount}
        onTerminalCountChange={handleTerminalCountChange}
        onArrangeTerminals={handleArrangeTerminals}
      />

      {/* Terminal Container */}
      <div 
        className="relative" 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          margin: 0, 
          padding: 0 
        }}
      >
        {terminals.map((terminal, index) => (
          <TerminalWindow
            key={terminal.id}
            id={terminal.id}
            title={`Terminal ${index + 1}`}
            initialPosition={terminal.position}
            zIndex={terminal.zIndex}
            onFocus={handleFocus}
            onClose={() => handleTerminalClose(terminal.id)}
            onPositionChange={handlePositionChange}
          />
        ))}
      </div>
    </div>
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
