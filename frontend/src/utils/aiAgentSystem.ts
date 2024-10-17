import axios from 'axios';
import { O1Model, VertexAIModel } from './aiModels';
import { TavilyAPI, SearchResult } from './webSearch';

interface AgentTask {
  id: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface AgentView {
  name: string;
  content: string[];
}

class AIAgent {
  constructor(public name: string, public role: string) {}

  async performTask(task: AgentTask): Promise<string> {
    // Implement task execution logic
    return `${this.name} completed task: ${task.description}`;
  }
}

class MainAIBrain {
  private o1Model: O1Model;
  private vertexAI: VertexAIModel;
  private agents: AIAgent[];
  private webSearch: TavilyAPI;
  private autonomyLevel: number;

  constructor(autonomyLevel: number) {
    this.o1Model = new O1Model();
    this.vertexAI = new VertexAIModel();
    this.webSearch = new TavilyAPI();
    this.agents = [
      new AIAgent('UIDesigner', 'UI Design'),
      new AIAgent('ContentCreator', 'Content Creation'),
      new AIAgent('SEOExpert', 'SEO Optimization'),
      new AIAgent('MonetizationSpecialist', 'Monetization'),
    ];
    this.autonomyLevel = autonomyLevel;
    this.setAutonomyLevel(autonomyLevel);
  }

  setAutonomyLevel(level: number) {
    this.autonomyLevel = level;
    // Implement logic to adjust AI behavior based on autonomy level
  }

  async processUserInput(input: string): Promise<{
    message: string;
    tsxPreview: string;
    agentViews: AgentView[];
  }> {
    try {
      // Use existing logic
      const decision = await this.o1Model.makeDecision(input);
      const searchResults = await this.webSearch.search(input);
      const tasks = this.delegateTasks(decision, searchResults);
      const results = await Promise.all(tasks.map(task => 
        this.agents.find(agent => agent.name === task.assignedTo)?.performTask(task)
      ));
      const localResponse = this.generateFinalResponse(results);

      // Communicate with backend
      const response = await axios.post('http://localhost:8000/consult', {
        message: input,
        autonomy_level: this.autonomyLevel,
        local_response: localResponse,
        decision: decision,
        search_results: searchResults
      });

      const agentViews: AgentView[] = [
        { name: 'UI Design', content: [response.data['ui design'] || ''] },
        { name: 'Monetization', content: [response.data['monetization'] || ''] },
        { name: 'SEO', content: [response.data['seo'] || ''] },
        { name: 'Analytics', content: [response.data['analytics'] || ''] },
        { name: 'Deployment', content: [response.data['deployment'] || ''] },
      ];

      return {
        message: response.data.message,
        tsxPreview: response.data.tsx_preview || '',
        agentViews: agentViews
      };
    } catch (error) {
      console.error('Error processing user input:', error);
      throw error;
    }
  }

  private delegateTasks(decision: string, searchResults: SearchResult[]): AgentTask[] {
    // Implement task delegation logic based on decision and search results
    return this.agents.map((agent, index) => ({
      id: `task-${index}`,
      description: `${agent.role} task based on decision: ${decision} and search results: ${JSON.stringify(searchResults)}`,
      assignedTo: agent.name,
      status: 'pending'
    }));
  }

  private generateFinalResponse(results: (string | undefined)[]): string {
    // Implement response generation logic
    return results.filter(Boolean).join(' ');
  }

  async getProgressReport(): Promise<string> {
    try {
      const response = await axios.get('http://localhost:8000/progress_report');
      return response.data.report;
    } catch (error) {
      console.error('Error fetching progress report:', error);
      throw error;
    }
  }

  async explainStrategy(strategyType: string): Promise<string> {
    try {
      const response = await axios.post('http://localhost:8000/explain_strategy', { strategy_type: strategyType });
      return response.data.explanation;
    } catch (error) {
      console.error('Error fetching strategy explanation:', error);
      throw error;
    }
  }
}

export const mainAIBrain = new MainAIBrain(50); // Start with 50% autonomy
