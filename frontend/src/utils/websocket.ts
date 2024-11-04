import { useState, useEffect } from 'react';
import { Message } from './Message';
import { AgentView } from './AgentView';
import { updateAgentView } from './websplatUtils';
import { initializeMessageAnimation } from '../components/AITypewriterText';

interface WebSocketHandlers {
  setGeneratedHtml: (html: string) => void;
  setOverallProgress: (progress: number) => void;
  setProgressReport: React.Dispatch<React.SetStateAction<string>>;
  setAgentViews: (views: AgentView[]) => void;
  setMessages: (updater: (prevMessages: Message[]) => Message[]) => void;
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

const useWebSocket = (
  workspaceId: string | null,
  handlers: WebSocketHandlers,
  agentViews: AgentView[],
  messages: Message[]
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (workspaceId) {
      const newSocket = new WebSocket(`ws://localhost:8000/ws/${workspaceId}`);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        handlers.setIsTyping(true);
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data) as WebSocketMessage;
        handleWebSocketMessage(data, handlers, agentViews, messages);
      };

      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        handlers.setIsTyping(false);
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        handlers.setIsTyping(false);
      };

      setSocket(newSocket);

      return () => {
        if (socket) {
          socket.close();
        }
        newSocket.close();
      };
    }
  }, [workspaceId, socket, handlers, agentViews, messages]);

  const handleWebSocketMessage = (
    data: WebSocketMessage,
    handlers: WebSocketHandlers,
    agentViews: AgentView[],
    currentMessages: Message[]
  ) => {
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
          setGeneratedHtml(data.content);
        }
        break;

      case 'progress_update':
        if (typeof data.content === 'number') {
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
          setAgentViews(updateAgentView(agentViews, agentType, data.content));
        }
        break;

      case 'chat_message':
        if (!data.role || typeof data.content !== 'string') return;
        
        const role = data.role as 'ai' | 'user';
        const content = data.content;

        if (role === 'ai') {
          if (content === '') {
            setCurrentAiMessage('');
          } else {
            // Set current message first
            setCurrentAiMessage(content);
            
            // Then update messages and initialize animation
            setMessages(prevMessages => {
              const messageId = `message-${prevMessages.length}`;
              initializeMessageAnimation(messageId, content);
              return [...prevMessages, { role, content, agent: data.agent }];
            });
            
            // Finally set typing state
            setIsTyping(false);
          }
        } else {
          // For user messages
          setMessages(prevMessages => [...prevMessages, { role, content, agent: data.agent }]);
          setIsTyping(false);
          setCurrentAiMessage('');
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  return socket;
};

export default useWebSocket;
