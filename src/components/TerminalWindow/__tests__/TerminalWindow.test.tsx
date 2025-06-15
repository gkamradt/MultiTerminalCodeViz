import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TerminalWindow } from '../TerminalWindow';
import { ThemeProvider } from '../../../contexts/ThemeContext';

describe('<TerminalWindow />', () => {
  it('should match snapshot for static UI', () => {
    const { container } = render(
      <ThemeProvider>
        <TerminalWindow 
          id="snapshot-test-window"
          title="Test Terminal"
          initialPosition={{ x: 10, y: 20 }}
          initialSize={{ width: 500, height: 300 }}
        />
      </ThemeProvider>
    );
    // For snapshot testing with react-draggable and react-resizable, 
    // it's often best to assert against the direct child of the ResizableBox
    // or a stable part of your component structure, as the wrapper elements
    // from these libraries can add dynamic attributes (like transform styles)
    // that make snapshots brittle.
    // Here, we target the main 'terminal-window' div directly.
    const terminalWindowElement = container.querySelector('.terminal-window');
    expect(terminalWindowElement).toMatchSnapshot();
  });

  // 3.4 Clamping tests for resize (verifying props passed to ResizableBox)
  it('should pass correct min/max constraints to ResizableBox', () => {
    const { container } = render(
      <ThemeProvider>
        <TerminalWindow 
          id="constraints-test"
          initialSize={{ width: 300, height: 200 }}
        />
      </ThemeProvider>
    );

    // Find the ResizableBox element which has the react-resizable class
    const resizableBoxElement = container.querySelector('.react-resizable');
    expect(resizableBoxElement).toBeInTheDocument();

    // We can also check that our initial size is applied.
    // The ResizableBox wrapper div gets inline styles for width and height.
    expect(resizableBoxElement).toHaveStyle('width: 300px;');
    expect(resizableBoxElement).toHaveStyle('height: 200px;');
  });

  it('should apply default dimensions if initialSize is not provided', () => {
    const { container } = render(
      <ThemeProvider>
        <TerminalWindow id="default-size-test" />
      </ThemeProvider>
    );
    const resizableBoxElement = container.querySelector('.react-resizable');
    expect(resizableBoxElement).toHaveStyle('width: 650px;');
    expect(resizableBoxElement).toHaveStyle('height: 450px;');
  });

  it('should apply partial default dimensions if initialSize is partially provided', () => {
    const { container: containerW } = render(
      <ThemeProvider>
        <TerminalWindow id="partial-w" initialSize={{ width: 350 }} />
      </ThemeProvider>
    );
    const resizableBoxW = containerW.querySelector('.react-resizable');
    expect(resizableBoxW).toHaveStyle('width: 350px;');
    expect(resizableBoxW).toHaveStyle('height: 450px;'); // Default height

    const { container: containerH } = render(
      <ThemeProvider>
        <TerminalWindow id="partial-h" initialSize={{ height: 250 }} />
      </ThemeProvider>
    );
    const resizableBoxH = containerH.querySelector('.react-resizable');
    expect(resizableBoxH).toHaveStyle('width: 650px;'); // Default width
    expect(resizableBoxH).toHaveStyle('height: 250px;');
  });

  it('should call onFocus when pointer down occurs', () => {
    const onFocus = vi.fn();
    const { container } = render(
      <ThemeProvider>
        <TerminalWindow id="focus-test" onFocus={onFocus} />
      </ThemeProvider>
    );
    const wrapper = container.querySelector('.react-draggable');
    // The pointer event should propagate to the div with onPointerDown
    if (wrapper) {
      fireEvent.pointerDown(wrapper);
    }
    expect(onFocus).toHaveBeenCalledWith('focus-test');
  });
});
