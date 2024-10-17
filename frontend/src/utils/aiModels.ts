import axios from 'axios';

export class O1Model {
  private apiKey: string;

  constructor(apiKey: string = process.env.OPENROUTER_API_KEY || '') {
    this.apiKey = apiKey;
  }

  async makeDecision(input: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/o1-mini',
          messages: [{ role: 'user', content: input }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error making decision with O1 model:', error);
      return 'Error occurred while making a decision.';
    }
  }
}

export class VertexAIModel {
  private projectId: string;

  constructor(projectId: string = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT || '') {
    this.projectId = projectId;
  }

  async generateResponse(input: string): Promise<string> {
    try {
      const response = await axios.post('/api/vertex-ai', {
        input: input,
        projectId: this.projectId
      });

      return response.data.response;
    } catch (error) {
      console.error('Error generating response with Vertex AI:', error);
      return 'Error occurred while generating a response.';
    }
  }
}
