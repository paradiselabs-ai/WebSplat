# Development Notes

## Project Overview
WebSplat is an AI-driven website creation platform that uses a hierarchical system of AI agents to generate passive income websites. The system features a sleek, modern user interface and a flexible, collaborative AI workflow, functioning similarly to Vercel's v0.

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
- Updated backend (main.py) to generate TSX preview based on AI responses
- Modified WebSplatInterface.tsx to include a new "Preview" tab for displaying generated TSX code
- Updated handleSendMessage function to set generatedHtml state with tsx_preview from backend response

## Current Focus
- Rapidly integrating the backend with the frontend for a working MVP demo (Urgent)
- Implementing additional views (monetization, SEO, etc.) in the interface left pane
- Providing user-friendly visualizations of agent progress and ideas
- Ensuring the consulting agent can provide progress updates and explain strategies
- Enhancing the collaborative agent workflow
- Improving the integration of O1 model as the main reasoning/brain
- Developing progress visualization components for the frontend
- Preparing for comprehensive system testing
- Creating and executing a test plan for the new TSX preview feature
- Ensuring all existing functionality remains intact while integrating new features
- Implementing a real-time rendering system for the preview window
- Setting up a system for serving the generated websites
- Preparing for hosting and deployment on Google Cloud

## Technology Stack
- Frontend: React, Next.js
- Backend: FastAPI (Python)
- AI Models: O1 (main reasoning), Vertex AI (quick tasks), other specialized models
- Database: TBD (consider options based on scaling needs)
- APIs: Tavily for web searches, various AI model APIs
- Live TSX Rendering: react-live library
- Hosting: Google Cloud (planned)

## AI Agent System
- Hierarchical structure with O1 and Vertex AI at the top
- Modular, task-switchable lower-level agents
- Inter-agent communication and task delegation
- Adjustable autonomy and creativity levels
- Web search integration for market research and feature inspiration
- Collaborative code generation in a dedicated workspace on the server

## User Interface
- Main chat interface for user-AI interaction
- Tabs for different aspects of website development
- Adjustable autonomy/creativity meter
- Toggle-able window view for UI design progress with live TSX preview
- Real-time progress visualization for various aspects (UI, monetization, SEO)
- New "Preview" tab for displaying live render of generated TSX code
- Consultation agent guiding the user through the process and providing real-time updates

## Key Features to Implement
1. Conversational AI prompt window (Completed)
2. Web search integration for market research (Completed)
3. Hierarchical AI agent workflow (Completed)
4. Inter-agent communication and task delegation (In Progress)
5. Autonomy and creativity adjustment system (Completed)
6. Real-time progress visualization (To Do)
7. UI design preview window with live TSX rendering (Completed)
8. Additional views for monetization, SEO, and other aspects (Urgent, In Progress)
9. TSX preview generation and display (Completed, needs testing)
10. Backend workspace for code generation and iteration (To Do)
11. Real-time rendering system for the preview window (To Do)
12. System for serving generated websites (To Do)
13. Google Cloud deployment preparation (To Do)

## Best Practices
(Existing best practices remain unchanged)

## Testing Strategy
(Existing testing strategy remains unchanged)

## Deployment Considerations
- Set up Google Cloud infrastructure for deploying and serving the generated websites
- Implement a build process in the backend that compiles the React code
- Create a deployment pipeline that pushes the built code to Google Cloud
- Provide users with a URL where they can view and interact with their generated website
(Other existing deployment considerations remain unchanged)

## Future Considerations
(Existing future considerations remain unchanged)

## Challenges and Solutions
(Existing challenges and solutions remain unchanged, add the following:)
- Challenge: Implementing real-time collaboration of backend agents for website generation
  Solution: Create a dedicated workspace on the server for code generation and iteration
- Challenge: Serving generated websites in real-time
  Solution: Implement a system to build and deploy generated code to a hosting environment (Google Cloud)

## Next Steps (Urgent - MVP Development)
1. Update the backend to include a workspace for code generation and iteration:
   - Implement a WorkspaceManager class to handle workspace creation and file operations
   - Modify the main.py file to use the WorkspaceManager for code generation
2. Implement a real-time rendering system for the preview window:
   - Set up WebSocket communication between frontend and backend
   - Update the frontend to display live renders of generated TSX code
3. Set up a system for serving the generated websites:
   - Implement a build process for the generated React code
   - Create a basic deployment pipeline to Google Cloud
4. Improve the AI agents' collaboration and code generation process:
   - Enhance the backend logic for inter-agent communication
   - Implement a more sophisticated code generation process using the workspace
5. Conduct rapid testing of the new features:
   - Test the workspace management system
   - Verify the real-time rendering of generated websites
   - Ensure proper collaboration between AI agents

Remember to update this document regularly with new insights, solutions to challenges, and important development practices specific to WebSplat. As the project evolves, continually reassess and optimize the integration of various AI models and services.

## Additional Updates

### Autogen Multi-Agent System
- The Autogen multi-agent system is already implemented in autogen_agents.py
- Agents include: O1_Agent, Head_Project_Manager, Frontend_Designer, Lead_Developer, Consultation_Agent, User_Content_Manager, Monetization_Agent, SEO_Agent, and Research_Agent
- Each agent has specific roles and uses different AI models (O1, Vertex AI, Claude, Perplexity)
- The system uses a GroupChat and GroupChatManager for collaborative decision-making
- Agents can delegate tasks, request information, and update shared knowledge

### GroundX RAG System Integration
- Consider integrating GroundX RAG system with the existing shared knowledge base in autogen_agents.py
- Enhance the update_shared_knowledge and get_shared_knowledge methods in EnhancedAssistantAgent class to use GroundX

### Local Development Server
- Implement functionality to deploy generated website code to a local server
- Update the create_website function to include local server deployment steps

### WebSocket Communication
- Implement WebSocket communication for real-time updates between frontend and backend
- Update the frontend to handle WebSocket messages and update the UI accordingly

### Monetization and SEO Strategy Integration
- Leverage existing Monetization_Agent and SEO_Agent in autogen_agents.py
- Enhance the explain_strategy function to provide more detailed explanations

### Scaling Considerations
- Review the current implementation in autogen_agents.py for potential bottlenecks
- Consider optimizing the GroupChat and GroupChatManager for handling larger, more complex websites

### Next Steps
1. Review and update the autogen_agents.py file to ensure it aligns with the current project requirements
2. Integrate the autogen agents with the main.py file and the frontend
3. Implement WebSocket communication for real-time updates
4. Enhance the local development server functionality
5. Improve the integration of GroundX RAG system with the existing shared knowledge base
6. Update the frontend to handle the collaborative agent workflow and display real-time updates

Continue to prioritize getting a working MVP that can create simple websites (e.g., portfolios, blogs, small company sites) before scaling up to more complex projects. Regularly update this document with new insights and development practices as the project evolves.
