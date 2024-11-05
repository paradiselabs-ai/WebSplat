import React from 'react';
import { render, screen, act } from '@testing-library/react';
import TypewriterText from '../TypewriterText';

describe('TypewriterText Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders empty text initially', () => {
    render(<TypewriterText text="Hello" />);
    expect(screen.getByText('')).toBeInTheDocument();
  });

  it('animates text character by character', () => {
    render(<TypewriterText text="Hello" />);

    // First character
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.getByText('H')).toBeInTheDocument();

    // Second character
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.getByText('He')).toBeInTheDocument();

    // Complete text
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('clears interval when text is fully displayed', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    render(<TypewriterText text="Hi" />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('resets and starts new animation when text changes', () => {
    const { rerender } = render(<TypewriterText text="Hi" />);

    // Complete first animation
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.getByText('Hi')).toBeInTheDocument();

    // Change text
    rerender(<TypewriterText text="Hello" />);
    expect(screen.getByText('')).toBeInTheDocument();

    // Verify new animation
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.getByText('H')).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const { unmount } = render(<TypewriterText text="Hello" />);

    act(() => {
      jest.advanceTimersByTime(50);
    });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('handles empty text', () => {
    render(<TypewriterText text="" />);
    expect(screen.getByText('')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.getByText('')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    render(<TypewriterText text="Hello" />);
    const textElement = screen.getByText('');
    expect(textElement).toHaveClass('text-[#AAAAAA]');
    expect(textElement).toHaveClass('text-lg');
  });

  it('maintains consistent timing between characters', () => {
    render(<TypewriterText text="Test" />);
    const timings: string[] = [];

    // Record text state at each interval
    for (let i = 0; i <= 4; i++) {
      act(() => {
        jest.advanceTimersByTime(50);
      });
      timings.push(screen.getByText(/^T.*$/).textContent || '');
    }

    expect(timings).toEqual(['T', 'Te', 'Tes', 'Test', 'Test']);
  });

  it('handles special characters correctly', () => {
    render(<TypewriterText text="Hello! 👋" />);

    // Advance through all characters
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(screen.getByText('Hello! 👋')).toBeInTheDocument();
  });
});
