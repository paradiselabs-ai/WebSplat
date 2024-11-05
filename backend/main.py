from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from .ai_integration import AIIntegration
from .workspace_manager import WorkspaceManager
from .autogen_agents import consultation_agent, FUNCTION_MAP, set_autonomy_level, generate_progress_report, explain_strategy
import asyncio
import logging
import traceback
import json
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

ai = AIIntegration()
workspace_manager = WorkspaceManager(base_path="./workspaces")

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ConsultationRequest(BaseModel):
    message: str
    autonomy_level: int

class ConsultationResponse(BaseModel):
    message: str
    tsx_preview: Optional[str] = None
    shared_knowledge: Dict[str, Any] = {}
    compiled_results: Optional[str] = None
    workspace_id: str

class AutonomyRequest(BaseModel):
    autonomy_level: int

class ProgressReportResponse(BaseModel):
    report: str

class StrategyExplanationRequest(BaseModel):
    strategy_type: str

class StrategyExplanationResponse(BaseModel):
    explanation: str

class AgentRequest(BaseModel):
    agent_type: str
    prompt: str
    autonomy_level: int

# WebSocket connections
active_connections: Dict[str, WebSocket] = {}

# Knowledge categorization keywords
KNOWLEDGE_CATEGORIES = {
    "UI Design": ["ui", "user interface", "design", "layout", "style", "component", "testimonial", "section", "visual", "display"],
    "Monetization": ["monetization", "revenue", "payment", "subscription", "pricing", "premium"],
    "SEO": ["seo", "search engine", "meta", "keyword", "ranking", "optimization"],
    "Analytics": ["analytics", "tracking", "metrics", "data", "performance", "monitoring"],
    "Deployment": ["deployment", "hosting", "server", "production", "launch", "release"]
}

async def send_websocket_update(workspace_id: str, update_type: str, content: Any):
    if workspace_id in active_connections:
        await active_connections[workspace_id].send_json({
            "type": update_type,
            "content": content
        })

@app.websocket("/ws/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: str):
    await websocket.accept()
    active_connections[workspace_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
    except WebSocketDisconnect:
        del active_connections[workspace_id]

@app.options("/consult")
async def options_consult():
    return {"message": "OK"}

def create_html_wrapper(tsx_code: str, component_name: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSplat Preview</title>
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <style>
        body {{ margin: 0; padding: 0; }}
        #root {{ height: 100vh; }}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        {tsx_code}

        ReactDOM.render(
            <{component_name} />,
            document.getElementById('root')
        );
    </script>
</body>
</html>
"""

@app.post("/consult", response_model=ConsultationResponse)
async def consult(request: ConsultationRequest):
    try:
        workspace_id = workspace_manager.create_workspace()
        logging.info(f"Created new workspace: {workspace_id}")
        
        # Set autonomy level
        set_autonomy_level(request.autonomy_level)
        
        # Get initial response from consultation agent
        consultation_prompt = (
            f"You are the primary interface with the user, responsible for guiding them through the website creation process.\n"
            f"The user has requested: \"{request.message}\"\n\n"
            f"Provide a friendly and informative response, explaining the next steps in creating their website.\n"
            f"If the request involves UI changes, include a TSX component design.\n"
            f"Your response should be conversational and encouraging, similar to how Vercel's v0 AI would interact.\n\n"
            f"If you need to generate code, clearly indicate it with TSX_START and TSX_END markers."
        )
        
        response = consultation_agent.generate_reply(
            messages=[{"role": "user", "content": consultation_prompt}],
            sender=None,
            config={}
        )

        # Send user message through WebSocket
        if workspace_id in active_connections:
            await active_connections[workspace_id].send_json({
                "type": "chat_message",
                "role": "user",
                "content": request.message
            })
            # Send AI response through WebSocket
            await active_connections[workspace_id].send_json({
                "type": "chat_message",
                "role": "ai",
                "content": response,
                "agent": "consultation_agent"
            })
        
        # Extract TSX code if present
        tsx_preview = None
        if "TSX_START" in response and "TSX_END" in response:
            tsx_start = response.index("TSX_START") + len("TSX_START")
            tsx_end = response.index("TSX_END")
            tsx_preview = response[tsx_start:tsx_end].strip()
            
            # Save TSX code to workspace if present
            if tsx_preview:
                # Extract component name from TSX code
                component_name = "PreviewComponent"  # Default name
                if "function" in tsx_preview:
                    try:
                        component_name = tsx_preview.split("function ")[1].split("(")[0].strip()
                    except:
                        pass
                elif "const" in tsx_preview:
                    try:
                        component_name = tsx_preview.split("const ")[1].split("=")[0].strip()
                    except:
                        pass

                # Save the TSX component
                workspace_manager.write_file(workspace_id, "App.tsx", tsx_preview)
                
                # Create and save the HTML wrapper
                html_content = create_html_wrapper(tsx_preview, component_name)
                workspace_manager.write_file(workspace_id, "index.html", html_content)
                
                await send_websocket_update(workspace_id, "preview_update", tsx_preview)
        
        # Update shared knowledge based on the response
        consultation_text = response.lower()
        for category, keywords in KNOWLEDGE_CATEGORIES.items():
            if any(keyword.lower() in consultation_text for keyword in keywords):
                ai.update_shared_knowledge(category, response)
                await send_websocket_update(workspace_id, f"knowledge_update_{category}", ai.shared_knowledge[category])
        
        response_obj = ConsultationResponse(
            message=response,
            tsx_preview=tsx_preview,
            shared_knowledge=ai.shared_knowledge,
            workspace_id=workspace_id
        )
        
        logging.info(f"Consultation response created for workspace: {workspace_id}")
        return response_obj
        
    except Exception as e:
        logging.error(f"Error in consult endpoint: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/preview/{workspace_id}")
async def get_preview(workspace_id: str):
    try:
        logging.info(f"Attempting to get preview for workspace: {workspace_id}")
        preview_content = workspace_manager.read_file(workspace_id, "App.tsx")
        if preview_content is None:
            logging.error(f"Preview not found for workspace_id: {workspace_id}")
            raise HTTPException(status_code=404, detail=f"Preview not found for workspace_id: {workspace_id}")
        logging.info(f"Preview retrieved successfully for workspace: {workspace_id}")
        return {"preview": preview_content, "workspace_id": workspace_id}
    except Exception as e:
        logging.error(f"Error in get_preview endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/set_autonomy")
async def set_autonomy(request: AutonomyRequest):
    try:
        set_autonomy_level(request.autonomy_level)
        return {"message": f"Autonomy level set successfully to {request.autonomy_level}"}
    except Exception as e:
        logging.error(f"Error in set_autonomy endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress_report", response_model=ProgressReportResponse)
async def get_progress_report():
    try:
        report = await asyncio.to_thread(generate_progress_report)
        return ProgressReportResponse(report=report)
    except Exception as e:
        logging.error(f"Error in progress_report endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain_strategy", response_model=StrategyExplanationResponse)
async def get_strategy_explanation(request: StrategyExplanationRequest):
    try:
        explanation = await asyncio.to_thread(explain_strategy, request.strategy_type)
        return StrategyExplanationResponse(explanation=explanation)
    except Exception as e:
        logging.error(f"Error in explain_strategy endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/agent_response")
async def agent_response(request: AgentRequest):
    try:
        response = await asyncio.to_thread(ai.get_agent_response, request.agent_type, request.prompt, request.autonomy_level)
        return {"response": response}
    except Exception as e:
        logging.error(f"Error in agent_response endpoint: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/serve/{workspace_id}/{path:path}")
async def serve_website(workspace_id: str, path: str):
    try:
        logging.info(f"Attempting to serve file: {path} for workspace: {workspace_id}")
        file_path = workspace_manager.get_file_path(workspace_id, path)
        if not file_path or not os.path.exists(file_path):
            logging.error(f"File not found: {file_path}")
            raise HTTPException(status_code=404, detail=f"File not found: {path}")
        logging.info(f"Serving file: {file_path}")
        return FileResponse(file_path)
    except Exception as e:
        logging.error(f"Error serving file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount the static files for each workspace
app.mount("/static", StaticFiles(directory="./workspaces"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
