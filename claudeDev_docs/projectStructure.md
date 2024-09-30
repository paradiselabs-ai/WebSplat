# Project Structure

```
/
├── .env                    # Environment variables and API keys
├── .gitignore              # Git ignore file
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/              # React components representing full pages
│   └── utils/              # Utility functions and helper modules
├── claudeDev_docs/
│   ├── currentTask.md      # Current development task
│   ├── designDocumentSummary.md # Project design summary
│   ├── wireframes.csv      # Wireframes for UI design
│   ├── projectStructure.md # This file
│   ├── claudeDevInstructions.md # Instructions for Claude Dev
│   ├── devNotes.md         # Development notes and best practices
│   └── sequentialDocs/     # Step-by-step development guide
│       ├── 01_projectSetup.md
│       ├── 02_frontendStructure.md
│       ├── 03_coreFunctionality.md
│       ├── 04_backendSetup.md
│       ├── 05_dataIntegration.md
│       ├── 06_refinementAndPolish.md
│       └── 07_deploymentPreparation.md
├── tests/                  # Contains test files for the application
├── app.py                  # Main Flask application file
├── ai_agents.py            # Implementation of hybrid AI agent system
├── ai_ml_client.py         # Client for AI/ML API (o1 model)
├── ai_integration.py       # Integration with various AI services
├── templates/
│   └── index.html          # Main HTML template for the web interface
├── static/
│   └── style.css           # CSS styles for the web interface
├── groundxrag.md           # Documentation for GroundX RAG integration
└── AI_ML.md                # Information on AI model integration
```

## Directory Descriptions

- `src/`: Contains the main source code for the WebSplat application
  - `components/`: Reusable React components
  - `pages/`: React components representing full pages
  - `utils/`: Utility functions and helper modules
- `claudeDev_docs/`: Documentation and development resources
  - `sequentialDocs/`: Step-by-step development guide
- `tests/`: Contains test files for the application
- `templates/`: HTML templates for the Flask backend
- `static/`: Static assets like CSS files

## Key Files

- `app.py`: Main Flask application file that handles routing and integrates AI agents
- `ai_agents.py`: Implementation of the hybrid AI agent system using o1 and Vertex AI
- `ai_ml_client.py`: Client for interacting with the AI/ML API (o1 model)
- `ai_integration.py`: Integration with various AI services (Claude, Perplexity, Mistral, etc.)
- `groundxrag.md`: Documentation for GroundX RAG integration
- `AI_ML.md`: Information on AI model integration

## AI Integration

The project now uses a hybrid approach, combining the o1 model (via AI/ML API) and Vertex AI. The system can automatically choose between these models based on task complexity, with options for manual override. Additional AI services like Claude, Perplexity, and Mistral are integrated for specialized tasks.

## Web Interface

The web interface (index.html) allows users to:
- Initialize the project
- Execute agent actions
- Choose between o1 and Vertex AI models
- View the action log with information on which model was used for each action

## Next Steps

- Implement more detailed logging and monitoring
- Add unit tests for the AI agent system and Flask routes
- Develop a more advanced caching system
- Enhance project state management
- Improve web development capabilities
- Implement collaborative features for AI agents
- Integrate RAG capabilities using the GroundX API
- Implement Tavily web search API for up-to-date information gathering
- Explore potential uses for Hugging Face models
- Optimize the use of various AI models for different tasks within the project