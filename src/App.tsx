import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TerminalWindow } from './components/TerminalWindow/TerminalWindow';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { BounceRabbit } from './components/BounceRabbit/BounceRabbit';
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
  
  // Separate actual count from rendered terminals for performance
  const [actualTerminalCount, setActualTerminalCount] = useState(1);
  const [nextTerminalId, setNextTerminalId] = useState(1);
  
  // Keep only the most recent N terminals rendered (circular buffer approach)
  // Reduce rendered terminals when performance is struggling
  const maxRenderedTerminals = actualTerminalCount > 1000 ? 40 : 80;
  
  const [terminals, setTerminals] = useState<Terminal[]>(() => [
    {
      id: 'terminal-0',
      position: generateRandomPosition(),
      zIndex: 1,
    },
  ]);

  // Bouncy rabbits state
  const [rabbits, setRabbits] = useState<string[]>([]);


  // Use actual count for rabbits, not rendered count - allow up to 1000 rabbits
  // const expectedRabbitCount = Math.min(Math.floor(actualTerminalCount / 5), 1000);

  const handleTerminalCountChange = (count: number) => {
    // Update the actual terminal count (can go to 10,000+)
    setActualTerminalCount(count);
    
    setTerminals((prev) => {
      let updated = [...prev];
      let newZ = highestZIndex;
      let newNextId = nextTerminalId;

      // Add new terminals if needed
      if (count > actualTerminalCount) {
        const terminalsToAdd = count - actualTerminalCount;
        for (let i = 0; i < terminalsToAdd; i++) {
          newZ += 1;
          const newTerminal = {
            id: `terminal-${newNextId}`,
            position: generateRandomPosition(),
            zIndex: newZ,
          };
          updated.push(newTerminal);
          newNextId += 1;
          
          // If we exceed max rendered terminals, remove the oldest ones
          if (updated.length > maxRenderedTerminals) {
            updated = updated.slice(-maxRenderedTerminals);
          }
        }
      } else if (count < actualTerminalCount) {
        // Remove terminals from the end
        const terminalsToRemove = actualTerminalCount - count;
        updated = updated.slice(0, Math.max(0, updated.length - terminalsToRemove));
      }

      setHighestZIndex(newZ);
      setNextTerminalId(newNextId);
      
      // Update rabbits based on new actual terminal count (max 1000 rabbits)
      const newExpectedRabbitCount = Math.min(Math.floor(count / 5), 1000);
      setRabbits(prevRabbits => {
        if (newExpectedRabbitCount > prevRabbits.length) {
          // Add new rabbits
          const newRabbits = [...prevRabbits];
          for (let i = prevRabbits.length; i < newExpectedRabbitCount; i++) {
            newRabbits.push(`rabbit-${Date.now()}-${i}`);
          }
          return newRabbits;
        } else if (newExpectedRabbitCount < prevRabbits.length) {
          // Remove excess rabbits if terminals are removed
          return prevRabbits.slice(0, newExpectedRabbitCount);
        }
        return prevRabbits;
      });
      
      return updated;
    });
  };

  const handleTerminalClose = (terminalId: string) => {
    // Decrease actual terminal count
    const newCount = Math.max(1, actualTerminalCount - 1);
    setActualTerminalCount(newCount);
    
    setTerminals((prev) => {
      const updated = prev.filter(terminal => terminal.id !== terminalId);
      
      // Update rabbits when terminal count changes (max 1000 rabbits)
      const newExpectedRabbitCount = Math.min(Math.floor(newCount / 5), 1000);
      setRabbits(prevRabbits => prevRabbits.slice(0, newExpectedRabbitCount));
      
      return updated;
    });
  };

  const handleRemoveAllRabbits = () => {
    setRabbits([]);
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
    // Cap z-index to prevent conflicts with controls (controls are at 10001)
    const newZ = Math.min(highestZIndex + 1, 9999);
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
        terminalCount={actualTerminalCount}
        onTerminalCountChange={handleTerminalCountChange}
        onArrangeTerminals={handleArrangeTerminals}
        rabbitCount={rabbits.length}
        onRemoveAllRabbits={handleRemoveAllRabbits}
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
            totalTerminalCount={actualTerminalCount}
          />
        ))}
      </div>

      {/* Bouncy Rabbits - render above everything */}
      {rabbits.map((rabbitId) => (
        <BounceRabbit
          key={rabbitId}
          id={rabbitId}
          totalRabbitCount={rabbits.length}
        />
      ))}
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
