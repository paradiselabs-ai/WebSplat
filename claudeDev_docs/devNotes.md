# Development Notes

## Project Overview
WebSplat is an AI-driven website creation platform that uses a hierarchical system of AI agents to generate passive income websites. The system features a sleek, modern user interface and a flexible, collaborative AI workflow.

## Recent Changes
- Shifted to a React/Next.js frontend for a more modern and responsive UI
- Implemented a hierarchical AI agent system with O1 and Vertex AI as the main reasoning/brain
- Integrated web search capabilities using Tavily for market research
- Added an adjustable autonomy and creativity meter for AI agents
- Created a main chat interface for user-AI interaction
- Implemented tabs for different aspects of website development (UI design, monetization, SEO)
- Added a toggle-able window view for UI design progress with live TSX rendering
- Successfully implemented live TSX preview using react-live library
- Integrated error handling and logging in the backend
- Implemented autonomy level adjustments for agent behavior

## Current Focus
- Rapidly integrating the backend with the frontend for a working MVP demo (Urgent)
- Implementing additional views (monetization, SEO, etc.) in the interface left pane
- Providing user-friendly visualizations of agent progress and ideas
- Ensuring the consulting agent can provide progress updates and explain strategies
- Enhancing the collaborative agent workflow
- Improving the integration of O1 model as the main reasoning/brain
- Developing progress visualization components for the frontend
- Preparing for comprehensive system testing

## Technology Stack
- Frontend: React, Next.js
- Backend: FastAPI (Python)
- AI Models: O1 (main reasoning), Vertex AI (quick tasks), other specialized models
- Database: TBD (consider options based on scaling needs)
- APIs: Tavily for web searches, various AI model APIs
- Live TSX Rendering: react-live library

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
- Toggle-able window view for UI design progress with live TSX preview
- Real-time progress visualization for various aspects (UI, monetization, SEO)

## Key Features to Implement
1. Conversational AI prompt window (Completed)
2. Web search integration for market research (Completed)
3. Hierarchical AI agent workflow (Completed)
4. Inter-agent communication and task delegation (In Progress)
5. Autonomy and creativity adjustment system (Completed)
6. Real-time progress visualization (To Do)
7. UI design preview window with live TSX rendering (Completed)
8. Additional views for monetization, SEO, and other aspects (Urgent, In Progress)

## Best Practices
- Follow React and Next.js best practices for component structure and state management
- Implement proper error handling and logging throughout the application
- Use TypeScript for better type safety and developer experience
- Implement comprehensive testing for both frontend and backend components
- Regularly update documentation to reflect current project state and future plans
- Use ESLint and Prettier for consistent code formatting
- Implement CI/CD pipelines for automated testing and deployment
- NEVER OMIT UNRELATED CODE when making changes or additions
- Always preserve the entire codebase, only modifying the specific parts relevant to the current task
- Be extremely careful not to disrupt any working parts of the existing interface
- Proceed with caution when making changes, especially to core functionality
- When updating files, always read the entire content first and make changes without omitting any existing code
- Regularly review and test the entire system to ensure all components are working together correctly
- For urgent MVP development, focus on rapid integration while maintaining existing functionality

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

## Challenges and Solutions
- Challenge: Implementing real-time TSX rendering
  Solution: Successfully utilized the react-live library to create a live preview of generated TSX code
- Challenge: Managing complex state in the frontend
  Solution: Consider implementing a state management library like Redux or Recoil if the application state becomes too complex
- Challenge: Coordinating multiple AI agents
  Solution: Implemented a hierarchical structure with adjustable autonomy levels
- Challenge: Rapid MVP development for hackathon
  Solution: Focus on integrating existing components and implementing essential new views without disrupting core functionality

## Next Steps (Urgent - MVP Development)
1. Rapidly integrate the backend with the frontend:
   - Ensure all existing agent communications are preserved
   - Verify that the consulting agent can properly interact with the user and other agents
2. Implement additional views in the left pane:
   - Add views for monetization, SEO, and other relevant aspects
   - Implement basic visualizations for each aspect
3. Enhance the consultation agent's capabilities:
   - Enable progress report generation on user request
   - Implement functionality to explain specific strategies (e.g., monetization)
4. Conduct rapid testing:
   - Verify all components are working together
   - Test user interactions and agent responses
   - Ensure real-time updates are displayed correctly in all views

Remember to update this document regularly with new insights, solutions to challenges, and important development practices specific to WebSplat. As the project evolves, continually reassess and optimize the integration of various AI models and services.
