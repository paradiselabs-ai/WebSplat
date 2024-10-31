'use client';

import React, { createContext, useState, useEffect } from 'react';
import { Message } from '../utils/Message';
import { AgentView } from '../utils/AgentView';
import useWebSocket from '../utils/websocket';
import { updateAgentView, addMessage } from '../utils/websplatUtils';

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
    const [agentViews, setAgentViews] = useState<AgentView[]>([]);
    const [progressReport, setProgressReport] = useState<string>('');
    const [strategyExplanation, setStrategyExplanation] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);
    const [projectName, setProjectName] = useState<string>('Untitled Project');
    const [isEditingProjectName, setIsEditingProjectName] = useState<boolean>(false);
    const [isHoveringProjectName, setIsHoveringProjectName] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [isAutonomySliderVisible, setIsAutonomySliderVisible] = useState<boolean>(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (workspaceId) {
          const newSocket = new WebSocket(`ws://localhost:8000/ws/${workspaceId}`);
          
          newSocket.onopen = () => {
            console.log('WebSocket connection established');
          };
    
          newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          };
    
          newSocket.onclose = () => {
            console.log('WebSocket connection closed');
          };
    
          setSocket(newSocket);
    
          return () => {
            if (socket) {
              socket.close();
            }
            newSocket.close();
          };
        }
      }, [workspaceId, socket]);
    
      const handleWebSocketMessage = (data: any) => {
        switch (data.type) {
          case 'preview_update':
            if (typeof data.content === 'string') {
              setGeneratedHtml(data.content);
            }
            break;
          case 'progress_update':
            if (typeof data.content === 'number') {
              // Update progress report here
            }
            break;
          case 'knowledge_update_UI Design':
          case 'knowledge_update_Monetization':
          case 'knowledge_update_SEO':
          case 'knowledge_update_Analytics':
          case 'knowledge_update_Deployment':
            const agentType = data.type.split('_')[2];
            if (Array.isArray(data.content)) {
              setAgentViews(updateAgentView(agentViews, agentType, data.content));
            }
            break;
          case 'chat_message':
            if (data.role && typeof data.content === 'string') {
              setMessages(addMessage(messages, data.role, data.content, data.agent));
            }
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      };    

      const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        // Implement send message logic here
      };
    
      const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
      };
    
      const handleProjectNameBlur = () => {
        setIsEditingProjectName(false);
      };
    
      const togglePreview = () => {
        setSidebarOpen(!sidebarOpen);
      };
    
      const toggleAutonomySlider = () => {
        setIsAutonomySliderVisible(!isAutonomySliderVisible);
      };
    
      const requestProgressReport = async () => {
        // Implement request progress report logic here
      };
    
      const requestStrategyExplanation = async (strategyType: string) => {
        // Implement request strategy explanation logic here
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
        setActiveView: (view: string) => setActiveView(view),
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };