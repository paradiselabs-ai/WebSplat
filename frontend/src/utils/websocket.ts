import { useState, useEffect, useCallback } from 'react';
import { Message } from './Message';
import { AgentView } from './AgentView';
import { updateAgentView, addMessage } from './websplatUtils';

interface WebSocketHandlers {
  setGeneratedHtml: (html: string) => void;
  setOverallProgress: (progress: number) => void;
  setProgressReport: React.Dispatch<React.SetStateAction<string>>;
  setAgentViews: React.Dispatch<React.SetStateAction<AgentView[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsTyping: (isTyping: boolean) => void;
  setCurrentAiMessage: (message: string) => void;
}

interface WebSocketMessage {
  type: 'preview_update' | 'progress_update' | 'agent_update' | 'chat_message' | 'knowledge_update_UI Design' | 'knowledge_update_Monetization' | 'knowledge_update_SEO' | 'knowledge_update_Analytics' | 'knowledge_update_Deployment';
  content?: string | number | string[];
  agent?: string;
  progress?: number;
  progress_details?: string;
  role?: 'ai' | 'user';
}

const RECONNECT_INTERVAL = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

const useWebSocket = (
  workspaceId: string | null,
  handlers: WebSocketHandlers
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWebSocketMessage = useCallback((
    data: WebSocketMessage,
    handlers: WebSocketHandlers
  ) => {
    console.log('Received WebSocket message:', data);
    const {
      setGeneratedHtml,
      setOverallProgress,
      setProgressReport,
      setAgentViews,
      setMessages,
      setIsTyping,
      setCurrentAiMessage
    } = handlers;

    switch (data.type) {
      case 'preview_update':
        if (typeof data.content === 'string') {
          console.log('Updating preview with:', data.content);
          setGeneratedHtml(data.content);
        }
        break;

      case 'progress_update':
        if (typeof data.content === 'number') {
          console.log('Updating progress:', data.content);
          setOverallProgress(data.content);
          if (data.progress_details) {
            setProgressReport(prevReport => prevReport + '\n' + data.progress_details);
          }
        }
        break;

      case 'knowledge_update_UI Design':
      case 'knowledge_update_Monetization':
      case 'knowledge_update_SEO':
      case 'knowledge_update_Analytics':
      case 'knowledge_update_Deployment':
        const agentType = data.type.split('_')[2];
        if (Array.isArray(data.content)) {
          console.log(`Updating ${agentType} knowledge with:`, data.content);
          setAgentViews(prevViews => updateAgentView(prevViews, agentType, data.content as string[]));
        }
        break;

      case 'chat_message':
        if (data.role && typeof data.content === 'string') {
          console.log('Adding chat message:', { role: data.role, content: data.content, agent: data.agent });
          if (data.role === 'ai') {
            // Start typing animation for AI messages
            setIsTyping(true);
            setCurrentAiMessage('');
            
            // Split message into characters and animate
            const chars = data.content.split('');
            let currentText = '';
            chars.forEach((char, index) => {
              setTimeout(() => {
                currentText += char;
                setCurrentAiMessage(currentText);
                if (index === chars.length - 1) {
                  // Animation complete, add the full message
                  setMessages(prevMessages => {
                    const newMessages = addMessage(prevMessages, data.role!, data.content as string, data.agent);
                    console.log('Updated messages:', newMessages);
                    return newMessages;
                  });
                  setIsTyping(false);
                  setCurrentAiMessage('');
                }
              }, index * 30); // 30ms delay per character
            });
          } else {
            // Add user messages immediately
            setMessages(prevMessages => {
              const newMessages = addMessage(prevMessages, data.role!, data.content as string, data.agent);
              console.log('Updated messages:', newMessages);
              return newMessages;
            });
          }
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!workspaceId || isConnecting) return;

    setIsConnecting(true);
    console.log('Creating WebSocket connection for workspace:', workspaceId);
    const newSocket = new WebSocket(`ws://localhost:8000/ws/${workspaceId}`);
    
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
      setSocket(newSocket);
      setIsConnecting(false);
      setReconnectAttempts(0);
    };

    newSocket.onmessage = (event) => {
      console.log('Raw WebSocket message received:', event.data);
      const data = JSON.parse(event.data) as WebSocketMessage;
      handleWebSocketMessage(data, handlers);
    };

    newSocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      setSocket(null);
      setIsConnecting(false);

      // Attempt to reconnect if the connection was closed unexpectedly
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, RECONNECT_INTERVAL);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
    };
  }, [workspaceId, handlers, handleWebSocketMessage, reconnectAttempts, isConnecting]);

  useEffect(() => {
    if (workspaceId) {
      connectWebSocket();
    }

    return () => {
      if (socket) {
        console.log('Cleaning up WebSocket connection');
        socket.close();
        setSocket(null);
      }
    };
  }, [workspaceId, connectWebSocket]);

  return socket;
};

export default useWebSocket;
