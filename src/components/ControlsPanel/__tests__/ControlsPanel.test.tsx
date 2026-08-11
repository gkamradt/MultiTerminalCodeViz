import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlsPanel } from '../ControlsPanel';
import { AppProvider } from '../../../contexts/AppContext';
import { ThemeProvider } from '../../../contexts/ThemeContext';

function renderControlsPanel() {
  const mockOnTerminalCountChange = () => {};
  const mockOnArrangeTerminals = () => {};
  
  return render(
    <ThemeProvider>
      <AppProvider>
        <ControlsPanel 
          terminalCount={1}
          onTerminalCountChange={mockOnTerminalCountChange}
          onArrangeTerminals={mockOnArrangeTerminals}
        />
      </AppProvider>
    </ThemeProvider>
  );
}

describe('ControlsPanel', () => {
  it('should render with default values', () => {
    renderControlsPanel();
    
    expect(screen.getByText('Terminal Controls')).toBeInTheDocument();
    expect(document.querySelector('.terminal-count-control__value')).toHaveTextContent('1terminal');
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('Arrange')).toBeInTheDocument();
    expect(screen.getByText(/Theme:/)).toBeInTheDocument();
    expect(screen.getByText(/Made with ❤️ by/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vibe typer/i })).toBeInTheDocument();
  });

  it('should call onTerminalCountChange when + button is clicked', () => {
    const mockOnTerminalCountChange = vi.fn();
    const mockOnArrangeTerminals = vi.fn();
    
    render(
      <ThemeProvider>
        <AppProvider>
          <ControlsPanel 
            terminalCount={1}
            onTerminalCountChange={mockOnTerminalCountChange}
            onArrangeTerminals={mockOnArrangeTerminals}
          />
        </AppProvider>
      </ThemeProvider>
    );
    
    const incrementButton = screen.getByText('+');
    fireEvent.click(incrementButton);
    
    expect(mockOnTerminalCountChange).toHaveBeenCalledWith(2);
  });

  it('should call onTerminalCountChange when +10 button is clicked', () => {
    const mockOnTerminalCountChange = vi.fn();
    const mockOnArrangeTerminals = vi.fn();

    render(
      <ThemeProvider>
        <AppProvider>
          <ControlsPanel
            terminalCount={1}
            onTerminalCountChange={mockOnTerminalCountChange}
            onArrangeTerminals={mockOnArrangeTerminals}
          />
        </AppProvider>
      </ThemeProvider>
    );

    const incrementTenButton = screen.getByText('+10');
    fireEvent.click(incrementTenButton);

    expect(mockOnTerminalCountChange).toHaveBeenCalledWith(11);
  });

  it('should call onArrangeTerminals when Arrange button is clicked', () => {
    const mockOnTerminalCountChange = vi.fn();
    const mockOnArrangeTerminals = vi.fn();
    
    render(
      <ThemeProvider>
        <AppProvider>
          <ControlsPanel 
            terminalCount={1}
            onTerminalCountChange={mockOnTerminalCountChange}
            onArrangeTerminals={mockOnArrangeTerminals}
          />
        </AppProvider>
      </ThemeProvider>
    );
    
    const arrangeButton = screen.getByText('Arrange');
    fireEvent.click(arrangeButton);
    
    expect(mockOnArrangeTerminals).toHaveBeenCalled();
  });

  it('should disable decrement button when at minimum (1)', () => {
    renderControlsPanel();

    const decrementButton = screen.getByRole('button', { name: 'Remove terminal' });
    expect(decrementButton).toBeDisabled();
  });

  it('should call onTerminalCountChange when -10 button is clicked', () => {
    const mockOnTerminalCountChange = vi.fn();
    const mockOnArrangeTerminals = vi.fn();

    render(
      <ThemeProvider>
        <AppProvider>
          <ControlsPanel
            terminalCount={20}
            onTerminalCountChange={mockOnTerminalCountChange}
            onArrangeTerminals={mockOnArrangeTerminals}
          />
        </AppProvider>
      </ThemeProvider>
    );

    const decrementTenButton = screen.getByRole('button', { name: 'Remove ten terminals' });
    fireEvent.click(decrementTenButton);

    expect(mockOnTerminalCountChange).toHaveBeenCalledWith(10);
  });

  it('keeps +∞ locked below 25 terminals', () => {
    renderControlsPanel();

    const infinityButton = screen.getByRole('button', {
      name: 'Infinite terminals unlock at 25 terminals',
    });

    expect(infinityButton).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Unlocked at 25 terminals');
    expect(screen.getByText(/24 to go/)).toBeInTheDocument();
  });

  it('does not start infinity when the locked button is clicked', () => {
    const onStartInfinity = vi.fn();

    render(
      <ThemeProvider>
        <AppProvider>
          <ControlsPanel
            terminalCount={24}
            onTerminalCountChange={vi.fn()}
            onStartInfinity={onStartInfinity}
          />
        </AppProvider>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', {
      name: 'Infinite terminals unlock at 25 terminals',
    }));
    expect(onStartInfinity).not.toHaveBeenCalled();
  });

  it('starts infinity once it is unlocked', () => {
    const onStartInfinity = vi.fn();

    render(
      <ThemeProvider>
        <AppProvider>
          <ControlsPanel
            terminalCount={25}
            onTerminalCountChange={vi.fn()}
            infinityUnlocked
            onStartInfinity={onStartInfinity}
          />
        </AppProvider>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start infinite terminals' }));
    expect(onStartInfinity).toHaveBeenCalledTimes(1);
  });
});
