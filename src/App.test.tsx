import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import * as typewriterHook from './hooks/useTypewriter';
import { INFINITY_DURATION_MS } from './utils/vibeEconomy';

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
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('retains earned promotions when terminals are closed', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Add ten terminals' }));
    expect(screen.getByRole('heading', { name: '10× Engineer' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove ten terminals' }));
    expect(screen.getByTestId('terminal-count-control-value')).toHaveTextContent('1terminal');
    expect(screen.getByRole('heading', { name: '10× Engineer' })).toBeInTheDocument();
  });

  it('previews and copies a receipt without losing the current desktop', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', Object.assign(Object.create(navigator), { clipboard: { writeText } }));
    const view = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Add ten terminals' }));
    fireEvent.click(screen.getByRole('button', { name: /Preview receipt/ }));
    expect(screen.getByText('LOCAL PREVIEW / EXAMPLE RECEIPT')).toBeInTheDocument();
    expect(view.container.querySelectorAll('.terminal-window, .bouncy-cat')).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'One button centered.' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Copy receipt' }));
    expect(await screen.findByRole('button', { name: 'Copied ✓' })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Total burned: $1,000,000,000.00'));
    fireEvent.click(screen.getByRole('button', { name: /Back to the desktop/ }));
    expect(screen.getByTestId('terminal-count-control-value')).toHaveTextContent('11terminals');
    expect(screen.getByRole('heading', { name: '10× Engineer' })).toBeInTheDocument();
  });

  it('offers a manual fallback when receipt copying is unavailable', async () => {
    vi.stubGlobal('navigator', Object.assign(Object.create(navigator), {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard blocked')) },
    }));
    window.history.replaceState({}, '', '/?preview=receipt');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy receipt' }));
    expect(await screen.findByText('Copy unavailable. Select the receipt text to copy it manually.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copied ✓' })).not.toBeInTheDocument();
  });

  it.each([false, true])('finishes, stops background work, and restarts (reduced motion: %s)', (reducedMotion) => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reducedMotion })));
    // Exercise the economy and ending without simulating every typed character.
    vi.spyOn(typewriterHook, 'useTypewriter').mockReturnValue({
      displayedLines: [], isTyping: false, reset: vi.fn(),
    });
    const view = render(<App />);
    try {
      for (let click = 0; click < 3; click += 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Add ten terminals' }));
      }
      fireEvent.click(screen.getByRole('button', { name: 'Start infinite terminals' }));
      act(() => vi.advanceTimersByTime(INFINITY_DURATION_MS));
      expect(screen.getByRole('status', { name: 'One billion dollar vibe overload' })).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(reducedMotion ? 0 : 2_800));
      expect(screen.getByRole('heading', { name: 'One button centered.' })).toBeInTheDocument();
      expect(screen.queryByText('LOCAL PREVIEW / EXAMPLE RECEIPT')).not.toBeInTheDocument();
      expect(view.container.querySelectorAll('.terminal-window, .bouncy-cat')).toHaveLength(0);
      act(() => vi.advanceTimersByTime(0));
      expect(vi.getTimerCount()).toBe(0);
      fireEvent.click(screen.getByRole('button', { name: 'Raise another round (restart)' }));
      expect(screen.getByTestId('terminal-count-control-value')).toHaveTextContent('1terminal');
      expect(screen.getByRole('heading', { name: 'Vibe Intern' })).toBeInTheDocument();
      expect(screen.getByTestId('dollars-spent')).toHaveTextContent('$0.00');
      expect(screen.getByRole('button', { name: 'Infinite terminals unlock at 25 terminals' })).toHaveAttribute('aria-disabled', 'true');
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

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
