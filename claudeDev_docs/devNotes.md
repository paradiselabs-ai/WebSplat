# Development Notes

## Latest Backend Verification (October 31, 2024)
All core backend functionality has been verified:
1. Health Check (✅) - Server is running and responding properly
2. Autonomy Setting (✅) - AI autonomy level control is working
3. Consultation (✅) - Can create workspaces and generate responses
4. WebSocket (✅) - Connection works (no updates during test window as expected)
5. Preview (✅) - Can retrieve TSX previews successfully
6. Serve Website (✅) - Can serve generated content
7. Shared Knowledge (✅) - Knowledge base is working
8. Progress Report (✅) - Can track progress effectively
9. Strategy Explanation (✅) - Strategy system works
10. Agent Response (✅) - AI agents are responding

Note: Minor Claude model version mismatch detected but system using fallbacks successfully.

## Frontend-Backend Integration Mapping (October 31, 2024)

### 1. Live Preview Integration
Backend Verified Endpoints:
```
GET /serve/{workspace_id}/App.tsx
Response: {
    "preview": string (TSX code),
    "workspace_id": string
}

WebSocket /ws/{workspace_id}
Messages: {
    type: "preview_update",
    content: string (TSX code)
}
```

Component Chain:
```
LivePreview.tsx
↓ (props: workspaceId, mode, generatedHtml)
PreviewPanel.tsx
↓ (state: previewOpen, previewMode)
MainContent.tsx (manages WebSocket)
```

Integration Steps:
1. Workspace Creation Flow:
   - MainContent sends initial request to /consult
   - Receives workspace_id
   - Establishes WebSocket connection
   - Initializes LivePreview with workspace_id

2. Preview Update Flow:
   - WebSocket receives "preview_update"
   - MainContent updates generatedHtml state
   - LivePreview renders new content
   - PreviewPanel handles display mode

3. Error Handling:
   - WebSocket disconnection recovery
   - Failed preview fetch fallbacks
   - Invalid TSX code handling

### 2. Chat & AI Integration
Backend Verified Endpoints:
```
POST /consult
Request: {
    "message": string,
    "autonomy_level": number
}
Response: {
    "message": string,
    "tsx_preview": string,
    "workspace_id": string,
    "shared_knowledge": Object
}

WebSocket Messages: {
    type: "chat_message" | "progress_update",
    content: string | number,
    role?: "ai" | "user"
}
```

Component Chain:
```
MainContent.tsx (chat interface)
↓ (manages messages, WebSocket)
TypewriterText.tsx (message animation)
↓ (props: text)
MinimalAutonomyControl.tsx (AI settings)
```

Integration Steps:
1. Message Flow:
   - User input → /consult endpoint
   - Response → TypewriterText animation
   - WebSocket updates → Real-time feedback

2. State Management:
   - Message history in MainContent
   - Typing indicators
   - Autonomy level sync

3. Error Recovery:
   - Failed message retries
   - WebSocket reconnection
   - Partial response handling

### 3. Agent System Integration
Backend Verified Endpoints:
```
POST /agent_response
Request: {
    "agent_type": string,
    "prompt": string,
    "autonomy_level": number
}
Response: {
    "response": string
}

GET /progress_report
Response: {
    "report": string
}

POST /explain_strategy
Request: {
    "strategy_type": string
}
Response: {
    "explanation": string
}
```

Component Chain:
```
MainContent.tsx (agent views)
↓ (manages agent state)
MinimalAutonomyControl.tsx
↓ (controls AI behavior)
Individual Agent Views
```

Integration Steps:
1. Agent Communication:
   - View selection → agent type mapping
   - Autonomy level → agent behavior
   - Response → view updates

2. Knowledge Management:
   - Shared knowledge updates
   - Cross-agent communication
   - Progress tracking

3. Error Handling:
   - Agent fallback mechanisms
   - Strategy explanation retries
   - Progress report recovery

### Integration Priority & Dependencies
1. Live Preview System (Priority 1)
   - Required: Workspace management
   - Required: WebSocket stability
   - Required: TSX rendering
   - Benefits: Immediate user feedback

2. Chat & AI Interaction (Priority 2)
   - Depends on: Workspace system
   - Depends on: WebSocket connection
   - Required: Message handling
   - Benefits: Core user interaction

3. Agent System (Priority 3)
   - Depends on: Chat system
   - Depends on: Knowledge base
   - Required: Agent coordination
   - Benefits: Enhanced functionality

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
- Updated test files with additional logging and assertions
- Ran backend tests and identified several issues that need to be addressed
- Removed CORS middleware while maintaining WebSocket functionality
- Verified all backend endpoints operational

## Current Focus
- Frontend verification and component testing
- Preparing for Google Cloud deployment
- Implementing real-time collaboration between AI agents
- Setting up local development server for generated websites
- Enhancing WebSocket communication
- Improving the preview functionality
- Resolving remaining API configuration issues

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

## Best Practices
1. Code Management
   - Never remove or alter existing functionality
   - Make incremental changes with thorough testing
   - Keep all code intact, no placeholders
   - Document all changes in detail

2. Testing
   - Run all tests before and after changes
   - Test frontend components individually
   - Verify backend endpoints thoroughly
   - Conduct integration testing carefully
   - Document test results and issues
   - Verify API configurations and model versions

3. Frontend Development
   - Test all components independently
   - Verify responsive design
   - Check error handling
   - Monitor performance metrics
   - Test cross-browser compatibility
   - Implement graceful fallbacks for API failures

4. Backend Development
   - Implement proper error handling
   - Use environment variables
   - Add comprehensive logging
   - Include health checks
   - Clean up resources properly
   - Verify API model versions and configurations

5. Deployment Preparation
   - Configure environment variables
   - Set up proper CORS with environment-aware configuration
   - Implement rate limiting
   - Add security measures
   - Prepare monitoring solutions
   - Set up proper API authentication for production

## Known Issues
1. Backend:
   - Claude model version compatibility (non-blocking, using fallbacks)
   - Perplexity API configuration errors
   - Tavily API authentication issues

2. Frontend:
   - Need to verify all component functionality
   - Responsive design needs testing
   - Error handling needs verification
   - Performance testing required
   - API error handling needs improvement

## Integration Strategy
1. Frontend First:
   - Verify all components
   - Test user interactions
   - Check state management
   - Validate form handling
   - Test error scenarios
   - Implement API error boundaries

2. Backend Stabilization:
   - Fix test failures
   - Verify endpoints
   - Test AI integration
   - Check WebSocket functionality
   - Update API configurations
   - Implement proper model versioning

3. Careful Integration:
   - Connect basic API endpoints
   - Implement real-time updates
   - Add file management
   - Enable preview generation
   - Test API fallback mechanisms

## Deployment Considerations
- Set up Google Cloud infrastructure
- Configure environment variables
- Implement proper security measures
- Set up monitoring and logging
- Prepare backup and recovery procedures
- Configure proper API authentication
- Set up environment-specific CORS
- Implement API rate limiting
- Configure proper model versions for production
- Set up API key management in Google Cloud Secret Manager

## Next Steps
1. Complete frontend verification
2. Fix remaining API configuration issues
3. Implement remaining features
4. Prepare for deployment
5. Conduct comprehensive testing

Remember: Move slowly and methodically, testing each change thoroughly. Maintain existing functionality while making improvements. Document all changes and their impacts.
