import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import PreviewPanel from '../PreviewPanel';

interface LivePreviewProps {
  mode: 'desktop' | 'mobile';
  generatedHtml: string;
  workspaceId: string | null;
}

// Mock the LivePreview component since we've already tested it separately
jest.mock('../LivePreview', () => {
  return function MockLivePreview({ mode }: LivePreviewProps) {
    return <div data-testid="live-preview" data-mode={mode}>Mock Preview</div>;
  };
});

describe('PreviewPanel Component', () => {
  const defaultProps = {
    previewOpen: true,
    previewMode: 'desktop' as const,
    generatedHtml: '<div>Test HTML</div>',
    workspaceId: 'test-workspace',
    togglePreview: jest.fn(),
    setPreviewMode: jest.fn(),
  };

  it('renders correctly when open', () => {
    render(<PreviewPanel {...defaultProps} />);
    expect(screen.getByText('Real-time Preview')).toBeInTheDocument();
    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
  });

  it('applies correct transform class when closed', () => {
    const { container } = render(<PreviewPanel {...defaultProps} previewOpen={false} />);
    expect(container.firstChild).toHaveClass('translate-x-full');
  });

  it('applies correct transform class when open', () => {
    const { container } = render(<PreviewPanel {...defaultProps} previewOpen={true} />);
    expect(container.firstChild).toHaveClass('translate-x-0');
  });

  it('handles desktop mode selection', () => {
    render(<PreviewPanel {...defaultProps} />);
    const desktopButton = screen.getByRole('button', { name: /laptop/i });
    fireEvent.click(desktopButton);
    expect(defaultProps.setPreviewMode).toHaveBeenCalledWith('desktop');
  });

  it('handles mobile mode selection', () => {
    render(<PreviewPanel {...defaultProps} />);
    const mobileButton = screen.getByRole('button', { name: /smartphone/i });
    fireEvent.click(mobileButton);
    expect(defaultProps.setPreviewMode).toHaveBeenCalledWith('mobile');
  });

  it('handles preview toggle', () => {
    render(<PreviewPanel {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /panel/i });
    fireEvent.click(toggleButton);
    expect(defaultProps.togglePreview).toHaveBeenCalled();
  });

  it('applies correct button styles based on current mode', () => {
    render(<PreviewPanel {...defaultProps} previewMode="desktop" />);
    const desktopButton = screen.getByRole('button', { name: /laptop/i });
    const mobileButton = screen.getByRole('button', { name: /smartphone/i });
    
    expect(desktopButton).toHaveClass('default');
    expect(mobileButton).toHaveClass('ghost');
  });

  it('applies correct button styles when in mobile mode', () => {
    render(<PreviewPanel {...defaultProps} previewMode="mobile" />);
    const desktopButton = screen.getByRole('button', { name: /laptop/i });
    const mobileButton = screen.getByRole('button', { name: /smartphone/i });
    
    expect(desktopButton).toHaveClass('ghost');
    expect(mobileButton).toHaveClass('default');
  });

  it('passes correct props to LivePreview', () => {
    render(<PreviewPanel {...defaultProps} />);
    const livePreview = screen.getByTestId('live-preview');
    expect(livePreview).toHaveAttribute('data-mode', 'desktop');
  });

  it('displays informational note', () => {
    render(<PreviewPanel {...defaultProps} />);
    expect(screen.getByText(/This preview updates live/)).toBeInTheDocument();
  });

  it('maintains correct height for preview container', () => {
    render(<PreviewPanel {...defaultProps} />);
    const previewContainer = screen.getByTestId('live-preview').parentElement;
    expect(previewContainer).toHaveClass('h-[calc(100vh-3.5rem)]');
  });

  it('maintains responsive layout structure', () => {
    const { container } = render(<PreviewPanel {...defaultProps} />);
    expect(container.firstChild).toHaveClass('fixed');
    expect(container.firstChild).toHaveClass('inset-0');
    expect(container.firstChild).toHaveClass('z-50');
  });

  it('applies transition effects', () => {
    const { container } = render(<PreviewPanel {...defaultProps} />);
    expect(container.firstChild).toHaveClass('transition-transform');
    expect(container.firstChild).toHaveClass('duration-300');
    expect(container.firstChild).toHaveClass('ease-in-out');
  });
});
