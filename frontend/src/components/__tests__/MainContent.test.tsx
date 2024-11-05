import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import MainContent from '../MainContent';
import { Message } from '../../utils/Message';

describe('MainContent Component', () => {
  const mockAgentViews = [
    { name: 'UI Design', icon: () => null, content: ['UI Design note 1'] },
    { name: 'Monetization', icon: () => null, content: ['Monetization note 1'] },
  ];

  const defaultProps = {
    messages: [
      { role: 'user' as const, content: 'Hello' },
      { role: 'ai' as const, content: 'Hi there!' },
    ] as Message[],
    inputMessage: '',
    autonomyLevel: 50,
    previewMode: 'desktop' as const,
    activeView: 'chat',
    isFirstInteraction: false,
    isTyping: false,
    currentAiMessage: '',
    agentViews: mockAgentViews,
    progressReport: '',
    strategyExplanation: '',
    handleSendMessage: jest.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    }),
    setInputMessage: jest.fn(),
    togglePreview: jest.fn(),
    setPreviewMode: jest.fn(),
    setActiveView: jest.fn(),
    requestProgressReport: jest.fn(),
    requestStrategyExplanation: jest.fn(),
    isSending: false,
    workspaceId: 'test-workspace',
    hasError: false,
  };

  it('renders chat tab by default', () => {
    render(<MainContent {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /chat/i })).toBeInTheDocument();
  });

  it('displays messages correctly', () => {
    render(<MainContent {...defaultProps} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('handles message input', () => {
    render(<MainContent {...defaultProps} />);
    const input = screen.getByPlaceholderText('Reply to Eden...');
    fireEvent.change(input, { target: { value: 'New message' } });
    expect(defaultProps.setInputMessage).toHaveBeenCalledWith('New message');
  });

  it('handles message submission', () => {
    render(<MainContent {...defaultProps} inputMessage="Test message" />);
    const form = screen.getByRole('button', { name: /arrow/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
      expect(defaultProps.handleSendMessage).toHaveBeenCalled();
    }
  });

  it('shows first interaction message when appropriate', () => {
    render(<MainContent {...defaultProps} isFirstInteraction={true} />);
    expect(screen.getByText("Got a website concept? I'm here to assist.")).toBeInTheDocument();
  });

  it('displays agent views correctly', () => {
    render(<MainContent {...defaultProps} />);
    mockAgentViews.forEach(view => {
      expect(screen.getByRole('tab', { name: view.name })).toBeInTheDocument();
    });
  });

  it('shows progress report when requested', () => {
    const progressReport = 'Current progress: 50%';
    render(<MainContent {...defaultProps} progressReport={progressReport} />);
    
    const progressTab = screen.getByRole('tab', { name: /progress/i });
    fireEvent.click(progressTab);
    
    expect(screen.getByText(progressReport)).toBeInTheDocument();
  });

  it('shows strategy explanation when requested', () => {
    const strategyExplanation = 'UI Design strategy explanation';
    render(<MainContent {...defaultProps} strategyExplanation={strategyExplanation} />);
    
    const uiDesignTab = screen.getByRole('tab', { name: /ui design/i });
    fireEvent.click(uiDesignTab);
    
    const explainButton = screen.getByText(/explain ui design strategy/i);
    fireEvent.click(explainButton);
    
    expect(defaultProps.requestStrategyExplanation).toHaveBeenCalledWith('UI Design');
  });

  it('disables send button when message is empty', () => {
    render(<MainContent {...defaultProps} inputMessage="" />);
    const sendButton = screen.getByRole('button', { name: /arrow/i });
    expect(sendButton).toBeDisabled();
  });

  it('disables send button while sending', () => {
    render(<MainContent {...defaultProps} inputMessage="Test" isSending={true} />);
    const sendButton = screen.getByRole('button', { name: /arrow/i });
    expect(sendButton).toBeDisabled();
  });

  it('shows typing indicator when AI is responding', () => {
    render(<MainContent {...defaultProps} isTyping={true} currentAiMessage="Thinking..." />);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('handles preview toggle', () => {
    render(<MainContent {...defaultProps} />);
    const toggleButton = screen.getByTitle('Toggle Preview');
    fireEvent.click(toggleButton);
    expect(defaultProps.togglePreview).toHaveBeenCalled();
  });

  it('displays progress bar with correct percentage', () => {
    render(<MainContent {...defaultProps} />);
    const progressTab = screen.getByRole('tab', { name: /progress/i });
    fireEvent.click(progressTab);
    
    const progressText = screen.getByText('50%');
    const progressBar = document.querySelector('.bg-\\[\\#A3512B\\]');
    expect(progressText).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('handles tab switching correctly', () => {
    render(<MainContent {...defaultProps} />);
    
    mockAgentViews.forEach(view => {
      const tab = screen.getByRole('tab', { name: view.name });
      fireEvent.click(tab);
      expect(defaultProps.setActiveView).toHaveBeenCalledWith(view.name);
    });
  });

  it('displays agent content in respective tabs', () => {
    render(<MainContent {...defaultProps} activeView="UI Design" />);
    expect(screen.getByText('UI Design note 1')).toBeInTheDocument();
  });

  it('shows error message when hasError is true', () => {
    render(<MainContent {...defaultProps} hasError={true} />);
    expect(screen.getByText('There was an error processing your request. Please try again.')).toBeInTheDocument();
  });

  it('adds error styling to input when hasError is true', () => {
    render(<MainContent {...defaultProps} hasError={true} />);
    const input = screen.getByPlaceholderText('Reply to Eden...');
    expect(input).toHaveClass('ring-2', 'ring-[#F5A9A9]');
  });
});
