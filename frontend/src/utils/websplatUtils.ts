import { Message } from './Message';
import { AgentView } from './AgentView';
export const updateAgentView = (agentViews: AgentView[], agentName: string, content: string[]) => {
  return agentViews.map(view => 
    view.name === agentName 
      ? { ...view, content: content } 
      : view
  );
};

export const addMessage = (messages: Message[], role: 'ai' | 'user', content: string, agent?: string) => {
  return [...messages, { role, content, agent }];
};
