import { Message } from './Message';
import { AgentView } from './AgentView';

export const updateAgentView = (agentViews: AgentView[], agentType: string, content: string[]): AgentView[] => {
  return agentViews.map(view => {
    if (view.name === agentType) {
      return { ...view, content };
    }
    return view;
  });
};

export const addMessage = (messages: Message[], role: 'ai' | 'user', content: string, agent?: string): Message[] => {
  return [...messages, { role, content, agent }];
};
