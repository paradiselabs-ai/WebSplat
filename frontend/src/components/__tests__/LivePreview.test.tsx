import React from 'react';
import { render, screen } from '@testing-library/react';
import LivePreview from '../LivePreview';

describe('LivePreview Component', () => {
  const defaultProps = {
    workspaceId: 'test-workspace-123',
    mode: 'desktop' as const,
    generatedHtml: '',
  };

  it('shows no preview message when workspaceId is null', () => {
    render(<LivePreview {...defaultProps} workspaceId={null} />);
    expect(screen.getByText('No preview available')).toBeInTheDocument();
  });

  it('renders iframe with served content when no generatedHtml', () => {
    render(<LivePreview {...defaultProps} />);
    const iframe = screen.getByTitle('Live Preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', `http://localhost:8000/serve/${defaultProps.workspaceId}/index.html`);
  });

  it('renders iframe with generated HTML when provided', () => {
    const generatedHtml = '<div>Test Content</div>';
    render(<LivePreview {...defaultProps} generatedHtml={generatedHtml} />);
    const iframe = screen.getByTitle('Live Preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('srcDoc', generatedHtml);
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
});
