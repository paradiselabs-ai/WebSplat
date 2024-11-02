# WebSplat Frontend Architecture

## Overview
WebSplat's frontend is built using Next.js 13+ with TypeScript, utilizing the App Router pattern. The application follows a component-based architecture with context-based state management and theme support.

## Directory Structure

### Root Configuration Files
- `tailwind.config.ts`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration for processing CSS
- `jest.config.js`: Jest testing configuration
- `jest.setup.js`: Jest test setup file
- `next.config.mjs`: Next.js configuration
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.json`: ESLint configuration
- `package.json`: Project dependencies and scripts
- `README.md`: Project documentation

### `/src/app`
- `layout.tsx`: Root layout component that wraps the entire application
- `page.tsx`: Main entry point of the application
- `globals.css`: Global styles and Tailwind CSS utilities
- `/fonts`: Custom fonts (GeistVF and GeistMonoVF)

### `/src/components`
Core UI components organized by functionality:

#### Main Components
- `App.tsx`: Root component that orchestrates the main layout and state management
  - Integrates with AppContext
  - Manages layout of Header, Sidebar, MainContent, and PreviewPanel
  - Handles autonomy slider visibility

- `ClientApp.tsx`: Client-side wrapper component
  - Handles client-side initialization
  - Wraps App component with necessary providers

- `Header.tsx`: Top navigation and controls
  - Project name management
  - Navigation tabs for different views
  - Settings and autonomy controls
  - User avatar display

- `Sidebar.tsx`: Left navigation panel
  - New website button
  - Navigation links for different agent views
  - Collapsible design

- `MainContent.tsx`: Central content area
  - Chat interface
  - Agent view displays
  - Progress reporting
  - Message handling

- `PreviewPanel.tsx`: Right-side preview panel
  - Live preview of generated website
  - Desktop/mobile view toggle
  - Real-time updates

#### Supporting Components
- `TypewriterText.tsx`: Animated text display component
  - Used for welcome messages and dynamic text
  - Theme-aware styling

- `LivePreview.tsx`: Website preview component
  - Renders generated HTML
  - Supports desktop/mobile views
  - Handles workspace-specific content

- `MinimalAutonomyControl.tsx`: AI autonomy level slider
  - Controls AI behavior
  - Visual feedback for current level

- `SettingsMenu.tsx`: Application settings interface
  - Theme toggle
  - Other configuration options

- `ErrorBoundary.tsx`: Error handling component
  - Catches and displays runtime errors
  - Prevents app crashes

- `mockAiResponse.js`: Mock AI response data for testing and development

#### Test Components
- `__tests__/WebSplatInterface.test.tsx`: Tests for the WebSplat interface components

### `/src/components/ui`
Reusable UI components:
- `avatar.tsx`: User avatar component
- `button.tsx`: Customized button component
- `input.tsx`: Form input component
- `scroll-area.tsx`: Custom scrollable container
- `tabs.tsx`: Tab navigation component
- `Loader.tsx`: Loading indicator component
  - Animated meteor-style loader
  - Theme-aware styling
  - Interactive hover effects
  - Supports thinking/idle states
- `Switch.tsx`: Toggle switch component

### `/src/context`
Application state management:

- `AppContext.tsx`: Main application state
  - Message handling
  - View management
  - Project settings
  - Workspace management

- `ThemeContext.tsx`: Theme management
  - Light/dark theme switching
  - Theme variable management
  - Dynamic theme application
  - CSS variable injection
  - Theme persistence

### `/src/utils`
Utility functions and type definitions:

- `AgentView.ts`: Agent view type definitions and utilities
- `aiAgentSystem.ts`: AI agent system integration
- `aiModels.ts`: AI model configurations
- `colors.ts`: Color definitions and utilities
- `ConsultationAgent.ts`: AI consultation agent logic
- `Message.ts`: Message type definitions
- `themes.ts`: Theme definitions and configuration
  - Dark and light theme presets
  - Theme type definitions
  - Color variables for UI components
  - Component-specific theme variables (loader, buttons, etc.)
- `webSearch.ts`: Web search functionality
- `websocket.ts`: WebSocket connection management
- `websplatUtils.ts`: General utility functions

## Component Dependencies and File Relationships

### Entry Point Chain
```
page.tsx
└── ClientApp.tsx
    └── App.tsx
        ├── Header.tsx
        ├── Sidebar.tsx
        ├── MainContent.tsx
        └── PreviewPanel.tsx
```

### Context Provider Dependencies
```
ClientApp.tsx
├── ThemeContext.tsx
│   ├── themes.ts
│   └── colors.ts
└── AppContext.tsx
    ├── Message.ts
    ├── AgentView.ts
    └── websocket.ts
```

### Component-to-Component Dependencies

#### Header.tsx Dependencies
```
Header.tsx
├── ui/button.tsx
├── ui/input.tsx
├── ui/avatar.tsx
├── ui/tabs.tsx
├── SettingsMenu.tsx
├── AppContext.tsx
└── AgentView.ts
```

#### Sidebar.tsx Dependencies
```
Sidebar.tsx
├── ui/button.tsx
├── AppContext.tsx
└── AgentView.ts
```

#### MainContent.tsx Dependencies
```
MainContent.tsx
├── ui/button.tsx
├── ui/scroll-area.tsx
├── ui/tabs.tsx
├── ui/Loader.tsx
├── Message.ts
├── TypewriterText.tsx
├── AppContext.tsx
└── ThemeContext.tsx
```

#### PreviewPanel.tsx Dependencies
```
PreviewPanel.tsx
├── ui/button.tsx
├── LivePreview.tsx
└── ThemeContext.tsx
```

### Utility Dependencies

#### Theme System
```
ThemeContext.tsx
├── themes.ts
│   ├── darkTheme
│   │   ├── Main UI Colors
│   │   ├── Text Colors
│   │   ├── Interactive Elements
│   │   ├── Input Elements
│   │   ├── Accent Colors
│   │   ├── Hover States
│   │   ├── Scroll Colors
│   │   ├── Border Colors
│   │   └── Loader Colors
│   └── lightTheme
└── colors.ts
```

#### AI System
```
aiAgentSystem.ts
├── ConsultationAgent.ts
├── aiModels.ts
├── Message.ts
└── websocket.ts
```

### Component-to-Utility Dependencies

#### TypewriterText.tsx
```
TypewriterText.tsx
└── ThemeContext.tsx
```

#### LivePreview.tsx
```
LivePreview.tsx
├── websplatUtils.ts
└── AppContext.tsx
```

#### Loader.tsx
```
Loader.tsx
├── ThemeContext.tsx
└── themes.ts
```

### Shared Dependencies
Most components share these common dependencies:
- `ThemeContext.tsx` for theme access
- `AppContext.tsx` for application state
- UI components from `/components/ui`

## Data Flow Between Components

### User Input Flow
1. User interaction in MainContent.tsx
2. Event handlers in AppContext.tsx
3. WebSocket communication via websocket.ts
4. AI processing through aiAgentSystem.ts
5. State updates in AppContext.tsx
6. UI updates across affected components

### Theme Change Flow
1. Toggle in SettingsMenu.tsx
2. Theme update in ThemeContext.tsx
3. Theme variable updates from themes.ts
4. CSS variable application across all components
5. Component-specific theme updates (e.g., Loader colors)

### Preview Update Flow
1. Content changes in MainContent.tsx
2. State update in AppContext.tsx
3. Content passed to PreviewPanel.tsx
4. Rendering in LivePreview.tsx

### Navigation Flow
1. User clicks in Header.tsx or Sidebar.tsx
2. View state update in AppContext.tsx
3. Content update in MainContent.tsx
4. Agent view update if applicable

## State Management Details

### AppContext State Flow
```
AppContext.tsx (State Provider)
├── Header.tsx (Consumes project state)
├── Sidebar.tsx (Consumes navigation state)
├── MainContent.tsx (Consumes message state)
└── PreviewPanel.tsx (Consumes preview state)
```

### Theme State Flow
```
ThemeContext.tsx (Theme Provider)
├── App.tsx (Root theme application)
├── MainContent.tsx (Content theming)
├── TypewriterText.tsx (Text theming)
├── Loader.tsx (Component-specific theming)
└── All UI components (Component theming)
```

## Event Handling Chain

### Message Handling
```
MainContent.tsx (User input)
└── AppContext.tsx (State update)
    └── websocket.ts (Server communication)
        └── aiAgentSystem.ts (AI processing)
            └── AppContext.tsx (Response update)
                └── MainContent.tsx (Display update)
```

### Preview Updates
```
MainContent.tsx (Content change)
└── AppContext.tsx (State update)
    └── PreviewPanel.tsx (Preview update)
        └── LivePreview.tsx (Render update)
```

This detailed mapping shows how each component is connected and how data flows through the application, making it easier to understand the relationships between different parts of the system.
