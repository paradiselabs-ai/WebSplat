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
    workspaceId: 'test-workspace',
    mode: 'desktop' as const,
  };

  beforeEach(() => {
    // Reset timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loading state initially', () => {
    render(<LivePreview {...defaultProps} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows no preview message when workspaceId is null', () => {
    render(<LivePreview {...defaultProps} workspaceId={null} />);
    expect(screen.getByText('No preview available')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation to generate a preview')).toBeInTheDocument();
  });

  it('renders iframe with correct url when workspaceId is provided', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview') as HTMLIFrameElement;
    expect(iframe.src).toBe(`http://localhost:8000/serve/${defaultProps.workspaceId}/index.html`);
  });

  it('applies mobile styles when mode is mobile', () => {
    render(<LivePreview {...defaultProps} mode="mobile" />);
    const container = screen.getByTitle('Live Preview').parentElement;
    expect(container).toHaveClass('w-[375px]', 'h-[667px]');
    expect(screen.getByText('Mobile Preview (375x667)')).toBeInTheDocument();
  });

  it('applies desktop styles when mode is desktop', () => {
    render(<LivePreview {...defaultProps} mode="desktop" />);
    const container = screen.getByTitle('Live Preview').parentElement;
    expect(container).toHaveClass('w-full', 'h-full');
  });

  it('handles iframe load event', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    
    act(() => {
      iframe.dispatchEvent(new Event('load'));
    });

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('handles iframe error event', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    
    act(()
