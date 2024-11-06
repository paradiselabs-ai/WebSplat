import { useState, useEffect, useCallback } from 'react';
import { Message } from './Message';
import { AgentView } from './AgentView';
import { updateAgentView, addMessage } from './websplatUtils';
import { config } from './config';

interface WebSocketHandlers {
  setGeneratedHtml: (html: string) => void;
  setOverallProgress: (progress: number) => void;
  setProgressReport: React.Dispatch<React.SetStateAction<string>>;
  setAgentViews: React.Dispatch<React.SetStateAction<AgentView[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsTyping: (isTyping: boolean) => void;
  setCurrentAiMessage: (message: string) => void;
}

type KnowledgeUpdateType = 
  | 'knowledge_update_UI Design' 
  | 'knowledge_update_Monetization' 
  | 'knowledge_update_SEO' 
  | 'knowledge_update_Analytics' 
  | 'knowledge_update_Deployment';

interface BaseWebSocketMessage {
  type: 'preview_update' | 'progress_update' | 'agent_update' | 'chat_message' | KnowledgeUpdateType;
  agent?: string;
}

interface PreviewUpdateMessage extends BaseWebSocketMessage {
  type: 'preview_update';
  content: string;
}

interface ProgressUpdateMessage extends BaseWebSocketMessage {
  type: 'progress_update';
  content: number;
  progress_details?: string;
}

interface ChatMessage extends BaseWebSocketMessage {
  type: 'chat_message';
  role: 'ai' | 'user';
  content: string;
  autonomy_level?: number;
}

interface KnowledgeUpdateMessage extends BaseWebSocketMessage {
  type: KnowledgeUpdateType;
  content: string[];
}

type WebSocketMessage = 
  | PreviewUpdateMessage 
  | ProgressUpdateMessage 
  | ChatMessage 
  | KnowledgeUpdateMessage;

const RECONNECT_INTERVAL = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
const CONNECTION_TIMEOUT = 5000; // 5 seconds

const useWebSocket = (
  workspaceId: string | null,
  handlers: WebSocketHandlers
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<WebSocketMessage[]>([]);

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
        console.log('Updating preview with:', data.content);
        setGeneratedHtml(data.content);
        break;

      case 'progress_update':
        console.log('Updating progress:', data.content);
        setOverallProgress(data.content);
        if (data.progress_details) {
          setProgressReport(prevReport => prevReport + '\n' + data.progress_details);
        }
        break;

      case 'knowledge_update_UI Design':
      case 'knowledge_update_Monetization':
      case 'knowledge_update_SEO':
      case 'knowledge_update_Analytics':
      case 'knowledge_update_Deployment':
        const agentType = data.type.split('_')[2];
        console.log(`Updating ${agentType} knowledge with:`, data.content);
        setAgentViews(prevViews => updateAgentView(prevViews, agentType, data.content));
        break;

      case 'chat_message':
        console.log('Adding chat message:', { role: data.role, content: data.content, agent: data.agent, autonomy_level: (data as ChatMessage).autonomy_level });
        
        // Add message to the list immediately
        setMessages(prevMessages => {
          const newMessages = addMessage(prevMessages, data.role, data.content, data.agent, (data as ChatMessage).autonomy_level);
          console.log('Updated messages:', newMessages);
          return newMessages;
        });

        // If it's an AI message, show typing animation
        if (data.role === 'ai') {
          setIsTyping(true);
          setCurrentAiMessage('');
          
          // Animate the message character by character
          const chars = data.content.split('');
          let currentText = '';
          chars.forEach((char, index) => {
            setTimeout(() => {
              currentText += char;
              setCurrentAiMessage(currentText);
              if (index === chars.length - 1) {
                setIsTyping(false);
                setCurrentAiMessage('');
              }
            }, index * 30); // 30ms delay per character
          });
        }
        break;

      default:
        console.log('Unknown message type:', (data as BaseWebSocketMessage).type);
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not ready, queueing message:', message);
      setPendingMessages(prev => [...prev, message]);
      return;
    }

    try {
      console.log('Sending WebSocket message:', message);
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      setPendingMessages(prev => [...prev, message]);
    }
  }, [socket]);

  const connectWebSocket = useCallback(() => {
    if (!workspaceId || isConnecting) {
      console.log('Cannot connect WebSocket:', !workspaceId ? 'No workspace ID' : 'Already connecting');
      return;
    }

    setIsConnecting(true);
    setIsConnected(false);
    const wsUrl = config.endpoints.websocket(workspaceId);
    console.log('Creating WebSocket connection:', {
      workspaceId,
      url: wsUrl,
      reconnectAttempts
    });

    const newSocket = new WebSocket(wsUrl);
    
    // Set connection timeout
    const timeoutId = setTimeout(() => {
      if (newSocket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket connection timeout');
        newSocket.close();
      }
    }, CONNECTION_TIMEOUT);

    newSocket.onopen = () => {
      console.log('WebSocket connection established:', {
        workspaceId,
        url: wsUrl,
        readyState: newSocket.readyState
      });
      clearTimeout(timeoutId);
      setSocket(newSocket);
      setIsConnecting(false);
      setIsConnected(true);
      setReconnectAttempts(0);

      // Send any pending messages
      if (pendingMessages.length > 0) {
        console.log('Sending pending messages:', pendingMessages);
        pendingMessages.forEach(message => {
          try {
            newSocket.send(JSON.stringify(message));
          } catch (error) {
            console.error('Error sending pending message:', error);
          }
        });
        setPendingMessages([]);
      }
    };

    newSocket.onmessage = (event) => {
      console.log('Raw WebSocket message received:', {
        data: event.data,
        workspaceId,
        timestamp: new Date().toISOString()
      });
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        handleWebSocketMessage(data, handlers);
      } catch (error) {
        console.error('Error parsing WebSocket message:', {
          error,
          rawData: event.data,
          workspaceId
        });
      }
    };

    newSocket.onclose = (event) => {
      console.log('WebSocket connection closed:', {
        workspaceId,
        wasClean: event.wasClean,
        code: event.code,
        reason: event.reason,
        reconnectAttempts
      });
      clearTimeout(timeoutId);
      setSocket(null);
      setIsConnecting(false);
      setIsConnected(false);

      // Attempt to reconnect if the connection was closed unexpectedly
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`Attempting to reconnect:`, {
          attempt: reconnectAttempts + 1,
          maxAttempts: MAX_RECONNECT_ATTEMPTS,
          delay: RECONNECT_INTERVAL
        });
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, RECONNECT_INTERVAL);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', {
        error,
        workspaceId,
        readyState: newSocket.readyState
      });
      clearTimeout(timeoutId);
      setIsConnecting(false);
      setIsConnected(false);
    };
  }, [workspaceId, handlers, handleWebSocketMessage, reconnectAttempts, isConnecting, pendingMessages]);

  useEffect(() => {
    if (workspaceId) {
      console.log('Workspace ID changed, connecting WebSocket:', {
        workspaceId,
        previousSocket: socket?.readyState
      });
      // Close existing socket before creating a new one
      if (socket) {
        socket.close();
      }
      connectWebSocket();
    }

    return () => {
      if (socket) {
        console.log('Cleaning up WebSocket connection:', {
          workspaceId,
          readyState: socket.readyState
        });
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [workspaceId, connectWebSocket, socket]);

  return {
    socket,
    isConnected,
    isConnecting,
    sendMessage
  };
};

export default useWebSocket;
