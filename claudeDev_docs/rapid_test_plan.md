# Rapid Test Plan for WebSplat MVP

## 1. Backend Functionality
- [ ] Test `/consult` endpoint
  - Verify it accepts user input and autonomy level
  - Check if it returns appropriate AI responses
- [ ] Test `/progress_report` endpoint
  - Ensure it generates and returns a progress report
- [ ] Test `/explain_strategy` endpoint
  - Verify it accepts strategy type and returns relevant explanations

## 2. Frontend-Backend Integration
- [ ] Verify WebSplatInterface successfully communicates with backend
  - Test sending messages and receiving responses
  - Check if progress reports are fetched and displayed correctly
  - Ensure strategy explanations are requested and shown properly

## 3. User Interface and Interactions
- [ ] Test chat functionality
  - Send messages and verify AI responses
  - Check if chat history is maintained correctly
- [ ] Verify all tabs and views are accessible and display correct content
  - Chat view
  - UI Design view
  - Monetization view
  - SEO view
  - Analytics view
  - Deployment view
  - Progress view
- [ ] Test autonomy level slider
  - Adjust autonomy level and verify it affects AI behavior
- [ ] Check project name editing functionality
- [ ] Verify real-time preview toggle and display

## 4. Agent Workflow and Collaboration
- [ ] Verify agents can delegate tasks to each other
- [ ] Check if shared knowledge is updated and used correctly
- [ ] Test inter-agent communication and information requests

## 5. Real-time Updates
- [ ] Verify that agent views update in real-time as new information is generated
- [ ] Check if progress reports reflect the current state of the project
- [ ] Ensure strategy explanations are up-to-date with the latest agent decisions

## 6. Error Handling and Edge Cases
- [ ] Test behavior when backend is unavailable
- [ ] Verify graceful handling of API errors
- [ ] Check performance with long conversations and multiple strategy requests

## 7. Responsiveness and Cross-browser Compatibility
- [ ] Test layout and functionality on different screen sizes
- [ ] Verify compatibility with major browsers (Chrome, Firefox, Safari)

## Notes
- Focus on critical functionality for the MVP demo
- Document any bugs or issues found for post-demo fixes
- Prioritize testing user-facing features and core agent interactions
