import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LivePreview from '../LivePreview';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loading-spinner">Loading Spinner</div>,
  AlertCircle: () => <div data-testid="error-icon">Error Icon</div>,
}));

describe('LivePreview Component', () => {
  const defaultProps = {
    workspaceId: 'test-workspace-123',
    mode: 'desktop' as const,
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows no preview message when workspaceId is null', () => {
    render(<LivePreview {...defaultProps} workspaceId={null} />);
    expect(screen.getByText('No preview available')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation to generate a preview')).toBeInTheDocument();
  });

  it('renders iframe with served content', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', `http://localhost:8000/serve/${defaultProps.workspaceId}/index.html`);
  });

  it('applies desktop mode styling', () => {
    render(<LivePreview {...defaultProps} />);
    const container = screen.getByTitle('Live Preview').parentElement?.parentElement;
    expect(container).toHaveClass('w-full h-full');
    expect(container).not.toHaveClass('w-[375px] h-[667px]');
  });

  it('applies mobile mode styling', () => {
    render(<LivePreview {...defaultProps} mode="mobile" />);
    const container = screen.getByTitle('Live Preview').parentElement?.parentElement;
    expect(container).toHaveClass('w-[375px] h-[667px]');
    expect(screen.getByText('Mobile Preview (375x667)')).toBeInTheDocument();
  });

  it('applies mobile scaling transform', () => {
    render(<LivePreview {...defaultProps} mode="mobile" />);
    const iframe = screen.getByTitle('Live Preview');
    expect(iframe.style.transform).toBe('scale(0.75)');
    expect(iframe.style.transformOrigin).toBe('top left');
  });

  it('applies no transform in desktop mode', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    expect(iframe.style.transform).toBe('none');
  });

  it('maintains responsive container in mobile mode', () => {
    render(<LivePreview {...defaultProps} mode="mobile" />);
    const outerContainer = screen.getByTitle('Live Preview').parentElement?.parentElement?.parentElement;
    expect(outerContainer).toHaveClass('max-w-[375px]');
    expect(outerContainer).toHaveClass('mx-auto');
  });

  it('applies border styling consistently', () => {
    render(<LivePreview {...defaultProps} />);
    const container = screen.getByTitle('Live Preview').parentElement;
    expect(container).toHaveClass('border-2');
    expect(container).toHaveClass('border-[#444444]');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('overflow-hidden');
  });

  it('renders iframe without border', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    expect(iframe).toHaveClass('border-0');
  });

  // New tests for loading and error states
  it('shows loading state initially', () => {
    render(<LivePreview {...defaultProps} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('hides loading state after iframe loads', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    
    act(() => {
      iframe.dispatchEvent(new Event('load'));
    });

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('shows error state when iframe fails to load', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    
    act(() => {
      iframe.dispatchEvent(new Event('error'));
    });

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByText('Failed to load preview')).toBeInTheDocument();
    expect(screen.getByText('Please try again later')).toBeInTheDocument();
  });

  it('handles mode transition animation', () => {
    const { rerender } = render(<LivePreview {...defaultProps} mode="desktop" />);
    
    // Change mode to trigger transition
    rerender(<LivePreview {...defaultProps} mode="mobile" />);
    
    const container = screen.getByTitle('Live Preview').parentElement;
    expect(container).toHaveClass('opacity-50');
    
    // Fast-forward through transition
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(container).toHaveClass('opacity-100');
  });

  it('resets loading state when workspaceId changes', () => {
    const { rerender } = render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    
    // Simulate initial load
    act(() => {
      iframe.dispatchEvent(new Event('load'));
    });
    
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    
    // Change workspaceId
    rerender(<LivePreview {...defaultProps} workspaceId="new-workspace" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
