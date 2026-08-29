import { useState, useEffect, useRef } from 'react';
import type { TerminalLine } from '../data/terminalOutputs';

interface UseTypewriterProps {
  lines: TerminalLine[];
  speed?: number; // ms per token (3-6 chars)
  enabled?: boolean;
  loop?: boolean; // Add loop option
  loopDelay?: number; // Delay before restarting
}

export function useTypewriter({ 
  lines, 
  speed = 20, // Slower since we're doing tokens now
  enabled = true, 
  loop = false,
  loopDelay = 2000 
}: UseTypewriterProps) {
  const [displayedLines, setDisplayedLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate random token size (3-6 characters)
  const getTokenSize = () => Math.floor(Math.random() * 4) + 3;

  useEffect(() => {
    if (!enabled || lines.length === 0) {
      return;
    }

    // Handle loop restart
    if (currentLineIndex >= lines.length) {
      if (loop) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedLines([]);
          setCurrentLineIndex(0);
          setCurrentCharIndex(0);
        }, loopDelay);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
      } else {
        return;
      }
    }

    const currentLine = lines[currentLineIndex];
    const delay = currentLine.delay || 0;

    // Add delay before starting the line if specified
    if (currentCharIndex === 0 && delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrentCharIndex(1);
      }, delay);
      return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }

    // Type out the current line using tokens
    if (currentCharIndex < currentLine.text.length) {
      timeoutRef.current = setTimeout(() => {
        const tokenSize = getTokenSize();
        const nextCharIndex = Math.min(currentCharIndex + tokenSize, currentLine.text.length);
        
        const partialLine = {
          ...currentLine,
          text: currentLine.text.slice(0, nextCharIndex)
        };

        setDisplayedLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex] = partialLine;
          return newLines;
        });

        setCurrentCharIndex(nextCharIndex);
      }, speed);
    } else {
      // Move to next line
      setCurrentLineIndex(prev => prev + 1);
      setCurrentCharIndex(0);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentLineIndex, currentCharIndex, lines, speed, enabled, loop, loopDelay]);

  const reset = () => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
  };

  const isTyping = currentLineIndex < lines.length || (loop && currentLineIndex >= lines.length);

  return {
    displayedLines,
    isTyping,
    reset
  };
}
