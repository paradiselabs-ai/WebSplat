# WebSplat MVP Workflow

## Frontend Workflow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '16px', 'fontFamily': 'Arial', 'primaryColor': '#ff9900', 'primaryTextColor': '#1a1a1a' }}}%%

graph TD
    A[User] -->|Interacts with| B[WebSplat Interface]
    B -->|Displays results| A
    
    B --> C[Chat Interface]
    B --> K[Autonomy Level]
    B --> D[Progress View]
    B --> E[Strategy Views]
    B --> F[Live Preview]
    
    C -->|User input| G[Backend Server]
    K -->|Influences AI behavior| G
    D -->|Progress request| G
    E -->|Strategy request| G
    F -->|TSX code request| G
    
    classDef user fill:#e6f3ff,stroke:#0066cc,stroke-width:2px;
    classDef interface fill:#ffcc99,stroke:#ff9900,stroke-width:2px;
    classDef component fill:#ccffcc,stroke:#00cc66,stroke-width:2px;
    classDef backend fill:#ffcccc,stroke:#ff6666,stroke-width:2px,color:#1a1a1a;
    classDef control fill:#e6e6ff,stroke:#6666ff,stroke-width:2px;
    
    class A user;
    class B interface;
    class C,D,E,F component;
    class G backend;
    class K control;
    
    linkStyle 0,1 stroke:#0066cc,stroke-width:2px;
    linkStyle 2,3,4,5,6 stroke:#00cc66,stroke-width:2px;
    linkStyle 7,8,9,10,11 stroke:#ff6666,stroke-width:2px;
```

## Backend Workflow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '16px', 'fontFamily': 'Arial', 'primaryColor': '#ff6666', 'primaryTextColor': '#1a1a1a' }}}%%

graph TD
    A[Backend Server] -->|Processes request| B[AI Agent System]
    B -->|Delegates tasks| C[Specialized Agents]
    C -->|Generate content| B
    B -->|Compiles results| A
    
    C --> D[O1 Agent]
    D --> E[Project Manager]
    E --> F[Frontend Designer]
    F --> G[Lead Developer]
    
    C --> I[Content Manager]
    C --> J[Monetization Agent]
    C --> K[SEO Agent]
    C --> L[Research Agent]
    
    H[Consultation Agent] -->|To Chat Interface| B
    
    M[Development Environment] --> H
    
    D & E & F & G --> M
    I -->|Content updates| M
    J -->|Monetization strategies| M
    K -->|SEO recommendations| M
    L -->|Research insights| M
    
    M -->|Updates Strategy Views| H
    
    classDef server fill:#ffcccc,stroke:#ff6666,stroke-width:2px;
    classDef system fill:#ffe6cc,stroke:#ff9933,stroke-width:2px;
    classDef agents fill:#e6ffcc,stroke:#66cc33,stroke-width:2px;
    classDef agent fill:#ccffe6,stroke:#33cc99,stroke-width:2px;
    classDef environment fill:#f0e6ff,stroke:#9966ff,stroke-width:2px;
    
    class A server;
    class B system;
    class C agents;
    class D,E,F,G,H,I,J,K,L agent;
    class M environment;
    
    linkStyle 0,1,2,3 stroke:#ff9933,stroke-width:2px;
    linkStyle 4,5,6,7 stroke:#66cc33,stroke-width:2px;
    linkStyle 8,9,10,11 stroke:#33cc99,stroke-width:2px;
    linkStyle 12 stroke:#cc00ff,stroke-width:2px;
    linkStyle 13,14,15,16 stroke:#9966ff,stroke-width:2px;
    linkStyle 17 stroke:#6600cc,stroke-width:2px;
```

## Workflow Explanation

1. The user interacts with the WebSplat Interface, which includes a chat interface (connected to the Consultation Agent), progress view, strategy views, and a live preview.

2. User requests are sent to the Backend Server.

3. The Backend Server processes the request and passes it to the AI Agent System.

4. The AI Agent System, influenced by the user-set Autonomy Level, delegates tasks to Specialized Agents:
   - O1 Agent: Provides high-level reasoning and decision-making
   - Project Manager: Coordinates tasks and ensures project coherence
   - Frontend Designer: Creates UI/UX designs
   - Lead Developer: Generates code based on designs
   - Content Manager: Handles user-provided content
   - Monetization Agent: Develops monetization strategies
   - SEO Agent: Optimizes for search engines
   - Research Agent: Conducts web searches for relevant information

5. The Consultation Agent communicates with the user via the Chat Interface and updates the AI Agent System.

6. The Development Environment receives updates from the O1 Agent, Project Manager, Frontend Designer, Lead Developer, Content Manager, Monetization Agent, SEO Agent, and Research Agent.

7. The Development Environment sends updates to the Consultation Agent, which in turn updates the Strategy Views.

8. The AI Agent System compiles results and sends them back to the Backend Server.

9. The Backend Server sends the response to the WebSplat Interface.

10. The WebSplat Interface displays the results to the user in various views:
    - Chat Interface: Shows conversation with the AI (primarily the Consultation Agent)
    - Progress View: Displays project progress
    - Strategy Views: Shows specific strategies (e.g., monetization, SEO)
    - Live Preview: Renders the generated TSX code in real-time

11. The user can request progress reports or strategy explanations, which are then displayed in the respective views.

12. The process continues iteratively as the user refines their requirements and the AI system generates and improves the website.
