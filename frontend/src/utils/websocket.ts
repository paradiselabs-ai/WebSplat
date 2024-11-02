import { useState, useEffect } from 'react';
import { Message } from './Message';
import { AgentView } from './AgentView';
import { updateAgentView, addMessage } from './websplatUtils';

interface WebSocketHandlers {
  setGeneratedHtml: (html: string) => void;
  setOverallProgress: (progress: number) => void;
  setProgressReport: React.Dispatch<React.SetStateAction<string>>;
  setAgentViews: (views: AgentView[]) => void;
  setMessages: (messages: Message[]) => void;
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
        handlers.setIsTyping(true); // Set typing to true when connection is established
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data) as WebSocketMessage;
        handleWebSocketMessage(data, handlers, agentViews, messages);
      };

      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        handlers.setIsTyping(false); // Set typing to false when connection is closed
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        handlers.setIsTyping(false); // Set typing to false on error
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
    messages: Message[]
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
        if (data.role && typeof data.content === 'string') {
          if (data.role === 'ai') {
            if (data.content === '') {
              // Keep typing true but clear current message when empty content received
              setCurrentAiMessage('');
            } else {
              // Update current message and keep typing true while receiving content
              setCurrentAiMessage(data.content);
            }
          } else {
            // When the full message is received, add it to messages and set typing false
            setMessages(addMessage(messages, data.role, data.content, data.agent));
            setIsTyping(false);
            setCurrentAiMessage('');
          }
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  return socket;
};

export default useWebSocket;
