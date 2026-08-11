import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock window.innerWidth and innerHeight for the terminal layout
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

describe('<App />', () => {
  it('renders terminal controls panel', () => {
    // App already includes Router, so we don't need to wrap it
    render(<App />);
    
    // Check for terminal controls
    expect(screen.getByText('Terminal Controls')).toBeInTheDocument();
    expect(screen.getByText('1 terminal')).toBeInTheDocument();
    expect(screen.getByText('Arrange')).toBeInTheDocument();
    expect(screen.getByText(/Theme:/)).toBeInTheDocument();
  });

  it('keeps the left and right terminal counts synchronized during infinity mode', () => {
    vi.useFakeTimers();
    const view = render(<App />);

    try {
      const addTen = screen.getByRole('button', { name: 'Add ten terminals' });
      const addOne = screen.getByRole('button', { name: 'Add terminal' });

      fireEvent.click(addTen);
      fireEvent.click(addTen);
      fireEvent.click(addOne);
      fireEvent.click(addOne);
      fireEvent.click(addOne);
      fireEvent.click(addOne);
      const catsBeforeInfinity = Number(
        screen.getByText(/vibe cats?/i).textContent?.match(/\d+/)?.[0],
      );
      fireEvent.click(screen.getByRole('button', { name: 'Start infinite terminals' }));

      act(() => vi.advanceTimersByTime(1_000));

      const leftCount = screen.getByTestId('burn-rate-terminal-count').textContent?.replace(/\s/g, '');
      const rightCount = screen.getByTestId('terminal-count-control-value').textContent?.replace(/\s/g, '');
      expect(leftCount).toBe(rightCount);
      const catsDuringInfinity = Number(
        screen.getByText(/vibe cats?/i).textContent?.match(/\d+/)?.[0],
      );
      expect(catsDuringInfinity).toBeGreaterThan(catsBeforeInfinity);
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });
});
