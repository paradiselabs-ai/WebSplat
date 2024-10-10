import React, { PropsWithChildren } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WebSplatInterface from '../WebSplatInterface';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Define prop types for mocked components
type ButtonProps = PropsWithChildren<{
  variant?: string;
  size?: string;
  className?: string;
  onClick?: () => void;
}>;

type InputProps = {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type AvatarImageProps = {
  src: string;
  alt: string;
  className: string;
};

// Mock the components and functions
jest.mock('../ui/button', () => ({
  Button: ({ children, ...props }: ButtonProps) => <button {...props}>{children}</button>,
}));
jest.mock('../ui/input', () => ({
  Input: (props: InputProps) => <input {...props} />,
}));
jest.mock('../ui/scroll-area', () => ({
  ScrollArea: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('../ui/tabs', () => ({
  Tabs: ({ children }: PropsWithChildren) => <div>{children}</div>,
  TabsContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
  TabsList: ({ children }: PropsWithChildren) => <div>{children}</div>,
  TabsTrigger: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('../ui/avatar', () => ({
  Avatar: ({ children }: PropsWithChildren) => <div>{children}</div>,
  AvatarImage: (props: AvatarImageProps) => <img {...props} />,
  AvatarFallback: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

jest.mock('react-live', () => ({
  LiveProvider: ({ children }: PropsWithChildren) => <div>{children}</div>,
  LivePreview: () => <div>Live Preview</div>,
  LiveError: () => <div>Live Error</div>,
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Toaster: () => <div>Toaster</div>,
}));

describe('WebSplatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<WebSplatInterface />);
    expect(screen.getByText('WebSplat')).toBeInTheDocument();
  });

  it('displays the initial AI message', () => {
    render(<WebSplatInterface />);
    expect(screen.getByText("Hello! I'm Eden, your AI consultation agent. How can I help you create your website today?")).toBeInTheDocument();
  });

  it('allows user to input a message', () => {
    render(<WebSplatInterface />);
    const input = screen.getByPlaceholderText('Message Eden');
    fireEvent.change(input, { target: { value: 'Create a landing page' } });
    expect(input).toHaveValue('Create a landing page');
  });

  it('displays the preview mode buttons', () => {
    render(<WebSplatInterface />);
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
  });

  it('displays the autonomy level control', () => {
    render(<WebSplatInterface />);
    expect(screen.getByText(/AI Autonomy Level:/)).toBeInTheDocument();
  });

  it('updates the live preview when receiving new TSX', async () => {
    const mockTsx = '() => <div><h1>Landing Page</h1><p>Welcome to our awesome product!</p></div>';
    const mockResponse = {
      data: {
        message: 'I have created a simple landing page for you. Here\'s the preview:',
        tsx_preview: mockTsx,
        shared_knowledge: {},
      },
    };
    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    render(<WebSplatInterface />);

    const input = screen.getByPlaceholderText('Message Eden');
    fireEvent.change(input, { target: { value: 'Create a landing page' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/consult', {
        message: 'Create a landing page',
        autonomy_level: 50,  // default autonomy level
      });
    });

    // Check if the AI response is displayed
    await waitFor(() => {
      expect(screen.getByText('I have created a simple landing page for you. Here\'s the preview:')).toBeInTheDocument();
    });

    // Check if the preview is rendered
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  // Add more tests as needed
});