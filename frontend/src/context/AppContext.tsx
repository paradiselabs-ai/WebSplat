'use client';

import React, { createContext, useState, useEffect } from 'react';
import { Message } from '../utils/Message';
import { AgentView } from '../utils/AgentView';
import useWebSocket from '../utils/websocket';
import { Layout, DollarSign, Search, BarChart2, Cloud } from 'lucide-react';
import axios from 'axios';

interface AppContextProps { 
  children: React.ReactNode;
}

interface AppContextValue {
    messages: Message[];
    inputMessage: string;
    autonomyLevel: number;
    previewMode: 'desktop' | 'mobile';
    activeView: string;
    generatedHtml: string;
    isFirstInteraction: boolean;
    isTyping: boolean;
    currentAiMessage: string;
    agentViews: AgentView[];
    progressReport: string;
    strategyExplanation: string;
    handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
    setInputMessage: (message: string) => void;
    togglePreview: () => void;
    setPreviewMode: (mode: 'desktop' | 'mobile') => void;
    setActiveView: (view: string) => void;
    requestProgressReport: () => void;
    requestStrategyExplanation: (strategyType: string) => void;
    isSending: boolean;
    projectName: string;
    isEditingProjectName: boolean;
    isHoveringProjectName: boolean;
    setIsEditingProjectName: (isEditing: boolean) => void;
    setIsHoveringProjectName: (isHovering: boolean) => void;
    handleProjectNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleProjectNameBlur: () => void;
    sidebarOpen: boolean;
    setAutonomyLevel: (level: number) => void;
    toggleAutonomySlider: () => void;
    isAutonomySliderVisible: boolean;
    workspaceId: string | null;
    previewOpen: boolean;
    overallProgress: number;
    hasError: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const AppProvider = ({ children }: AppContextProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [autonomyLevel, setAutonomyLevel] = useState<number>(50);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeView, setActiveView] = useState<string>('chat');
    const [generatedHtml, setGeneratedHtml] = useState<string>('');
    const [isFirstInteraction, setIsFirstInteraction] = useState<boolean>(true);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
    const [agentViews, setAgentViews] = useState<AgentView[]>([
      { name: 'UI Design', icon: Layout, content: [] },
      { name: 'Monetization', icon: DollarSign, content: [] },
      { name: 'SEO', icon: Search, content: [] },
      { name: 'Analytics', icon: BarChart2, content: [] },
      { name: 'Deployment', icon: Cloud, content: [] },
    ]);
    const [progressReport, setProgressReport] = useState<string>('');
    const [strategyExplanation, setStrategyExplanation] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);
    const [projectName, setProjectName] = useState<string>('Untitled Project');
    const [isEditingProjectName, setIsEditingProjectName] = useState<boolean>(false);
    const [isHoveringProjectName, setIsHoveringProjectName] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [isAutonomySliderVisible, setIsAutonomySliderVisible] = useState<boolean>(false);
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [overallProgress, setOverallProgress] = useState<number>(0);
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [hasError, setHasError] = useState<boolean>(false);

    // Initialize WebSocket connection
    const socket = useWebSocket(workspaceId, {
      setGeneratedHtml,
      setOverallProgress,
      setProgressReport,
      setAgentViews,
      setMessages,
      setIsTyping,
      setCurrentAiMessage,
    });

    // Log WebSocket status changes
    useEffect(() => {
      if (socket) {
        console.log('WebSocket connected for workspace:', workspaceId);
        setHasError(false);
      }
    }, [socket, workspaceId]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
          setCursorPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
        const tolerance = 50;

        if ((cursorPosition.x <= tolerance && cursorPosition.y >= windowHeight / 2 - tolerance && cursorPosition.y <= windowHeight / 2 + tolerance) || 
            (cursorPosition.x <= tolerance && cursorPosition.y >= windowHeight - tolerance)) {
          setSidebarOpen(true);
        } else if (cursorPosition.x > 300 && sidebarOpen) {
          setSidebarOpen(false);
        }
    }, [cursorPosition, sidebarOpen]);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputMessage.trim() === '' || isSending) return;

        console.log('Sending message:', inputMessage);
        console.log('Current isFirstInteraction:', isFirstInteraction);

        setIsSending(true);
        setHasError(false);
        
        if (isFirstInteraction) {
          console.log('Setting isFirstInteraction to false');
          setIsFirstInteraction(false);
        }

        try {
          console.log('Making API request...');
          const response = await axios.post('http://localhost:8000/consult', {
            message: inputMessage,
            autonomy_level: autonomyLevel,
            workspace_id: workspaceId
          });

          console.log('API response:', response.data);

          if (response.data.workspace_id) {
            setWorkspaceId(response.data.workspace_id);
          }

          // Update generated HTML if TSX preview is present
          if (response.data.tsx_preview) {
            console.log('Setting generated HTML:', response.data.tsx_preview);
            setGeneratedHtml(response.data.tsx_preview);
          }

          // Update agent views based on shared knowledge
          if (response.data.shared_knowledge) {
            console.log('Updating agent views with:', response.data.shared_knowledge);
            const updatedAgentViews = agentViews.map(view => {
              const knowledge = response.data.shared_knowledge[view.name];
              return {
                ...view,
                content: knowledge ? [...view.content, knowledge].flat() : view.content
              };
            });
            setAgentViews(updatedAgentViews);
          }

          setInputMessage('');

        } catch (error) {
          console.error('Error sending message:', error);
          setHasError(true);
          // Let WebSocket handle error message display
        } finally {
          setIsSending(false);
        }
    };
    
    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
    };
    
    const handleProjectNameBlur = () => {
        setIsEditingProjectName(false);
    };
    
    const togglePreview = () => {
        setPreviewOpen(!previewOpen);
    };
    
    const toggleAutonomySlider = () => {
        setIsAutonomySliderVisible(!isAutonomySliderVisible);
    };
    
    const requestProgressReport = async () => {
        try {
          const response = await axios.get('http://localhost:8000/progress_report', {
            params: { workspace_id: workspaceId }
          });
          setProgressReport(response.data.report);
          // Update overall progress based on the report
          if (response.data.progress) {
            setOverallProgress(response.data.progress);
          }
        } catch (error) {
          console.error('Error fetching progress report:', error);
          setProgressReport('Error fetching progress report. Please try again.');
        }
    };
    
    const requestStrategyExplanation = async (strategyType: string) => {
        try {
          const response = await axios.post('http://localhost:8000/explain_strategy', {
            strategy_type: strategyType,
            workspace_id: workspaceId
          });
          setStrategyExplanation(response.data.explanation);
        } catch (error) {
          console.error('Error fetching strategy explanation:', error);
          setStrategyExplanation('Error fetching strategy explanation. Please try again.');
        }
    };

    return (
        <AppContext.Provider
          value={{
            messages,
            inputMessage,
            autonomyLevel,
            previewMode,
            activeView,
            generatedHtml,
            isFirstInteraction,
            isTyping,
            currentAiMessage,
            agentViews,
            progressReport,
            strategyExplanation,
            isAutonomySliderVisible,
            toggleAutonomySlider,
            handleSendMessage,
            setInputMessage,
            togglePreview,
            setPreviewMode,
            setActiveView,
            requestProgressReport,
            requestStrategyExplanation,
            isSending,
            projectName,
            isEditingProjectName,
            isHoveringProjectName,
            setIsEditingProjectName,
            setIsHoveringProjectName,
            handleProjectNameChange,
            handleProjectNameBlur,
            sidebarOpen,
            setAutonomyLevel,
            workspaceId,
            previewOpen,
            overallProgress,
            hasError,
          }}
        >
          {children}
        </AppContext.Provider>
    );
};

export { AppProvider, AppContext };
