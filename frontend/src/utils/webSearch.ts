import axios from 'axios';

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface TavilySearchResult {
  title: string;
  snippet: string;
  url: string;
  [key: string]: unknown;  // This allows for additional properties we're not using
}

export class TavilyAPI {
  private apiKey: string;

  constructor(apiKey: string = process.env.NEXT_PUBLIC_TAVILY_API_KEY || '') {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get<{ results: TavilySearchResult[] }>('https://api.tavily.com/search', {
        params: {
          api_key: this.apiKey,
          query: query,
        },
      });

      return response.data.results.map((result: TavilySearchResult) => ({
        title: result.title,
        snippet: result.snippet,
        url: result.url,
      }));
    } catch (error) {
      console.error('Error performing web search:', error);
      return [];
    }
  }
}
