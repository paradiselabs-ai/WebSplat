# Development Notes

## Project Overview
WebSplat is an AI-driven website creation platform that uses a hierarchical system of AI agents to generate passive income websites. The system features a sleek, modern user interface and a flexible, collaborative AI workflow.

## Recent Changes
- Shifted to a React/Next.js frontend for a more modern and responsive UI
- Implemented a hierarchical AI agent system with O1 and Vertex AI as the main reasoning/brain
- Integrated web search capabilities using Tavily or Perplexity for market research
- Added an adjustable autonomy and creativity meter for AI agents
- Created a main chat interface for user-AI interaction
- Implemented tabs for different aspects of website development (UI design, monetization, SEO)
- Added a toggle-able window view for UI design progress

## Current Focus
- Implementing the new React/Next.js frontend
- Refactoring the AI agent system to support the hierarchical workflow
- Integrating web search functionality
- Implementing the autonomy and creativity control system
- Creating a collaborative agent workflow with inter-agent communication

## Technology Stack
- Frontend: React, Next.js
- Backend: Flask (Python)
- AI Models: O1 (main reasoning), Vertex AI (quick tasks), other specialized models
- Database: TBD (consider options based on scaling needs)
- APIs: Tavily or Perplexity for web searches, various AI model APIs

## AI Agent System
- Hierarchical structure with O1 and Vertex AI at the top
- Modular, task-switchable lower-level agents
- Inter-agent communication and task delegation
- Adjustable autonomy and creativity levels
- Web search integration for market research and feature inspiration

## User Interface
- Main chat interface for user-AI interaction
- Tabs for different aspects of website development
- Adjustable autonomy/creativity meter
- Toggle-able window view for UI design progress
- Real-time progress visualization for various aspects (UI, monetization, SEO)

## Key Features to Implement
1. Conversational AI prompt window
2. Web search integration for market research
3. Hierarchical AI agent workflow
4. Inter-agent communication and task delegation
5. Autonomy and creativity adjustment system
6. Real-time progress visualization
7. UI design preview window

## Best Practices
- Follow React and Next.js best practices for component structure and state management
- Implement proper error handling and logging throughout the application
- Use TypeScript for better type safety and developer experience
- Implement comprehensive testing for both frontend and backend components
- Regularly update documentation to reflect current project state and future plans
- Use ESLint and Prettier for consistent code formatting
- Implement CI/CD pipelines for automated testing and deployment

## Testing Strategy
- Implement unit tests for individual components (React components, AI agents, utility functions)
- Create integration tests for API endpoints and AI agent interactions
- Implement end-to-end tests for critical user flows
- Use mock objects to simulate AI model responses in tests
- Regularly run all tests, especially before merging new features

## Deployment Considerations
- Choose a suitable hosting platform (e.g., Vercel for Next.js frontend, Google Cloud or AWS for backend)
- Implement proper environment variable management for different deployment stages
- Set up monitoring and logging for production environment
- Implement a scalable architecture to handle potential high traffic

## Future Considerations
- Implement A/B testing capabilities for comparing different AI strategies
- Develop a plugin system for easy integration of new AI models or services
- Research and implement advanced caching strategies for improved performance
- Design and implement a version control system for generated websites
- Explore options for user account management and saved projects

Remember to update this document regularly with new insights, solutions to challenges, and important development practices specific to WebSplat. As the project evolves, continually reassess and optimize the integration of various AI models and services.