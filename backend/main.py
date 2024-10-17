from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from ai_integration import AIIntegration
from workspace_manager import WorkspaceManager
from autogen_agents import create_website, generate_progress_report, explain_strategy, set_autonomy_level
import asyncio
import logging
import traceback
import json
import os

app = FastAPI()
ai = AIIntegration()
workspace_manager = WorkspaceManager(base_path="./workspaces")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

async def generate_tsx_preview(message: str, workspace_id: str) -> Dict[str, str]:
    consultation_prompt = f"""
    You are a helpful AI assistant guiding a user through the process of creating a website. The user has requested: "{message}"
    Provide a friendly and informative response to the user, explaining the next steps in creating their website.
    Your response should be conversational and encouraging, similar to how Vercel's v0 AI would interact.
    """
    
    tsx_prompt = f"""
    Create a React TSX component based on the following description:
    {message}
    
    The component should:
    1. Use modern React practices (functional components, hooks)
    2. Include basic styling using CSS-in-JS (styled-components syntax)
    3. Be responsive and accessible
    4. Include placeholder data where appropriate
    5. Be a complete, working component that can be rendered

    Provide only the TSX code, without any explanations or markdown formatting.
    """
    
    consultation_response = await asyncio.to_thread(ai.generate_text, consultation_prompt, 'gemini', 80)
    tsx_code = await asyncio.to_thread(ai.generate_text, tsx_prompt, 'gemini', 80)
    
    # Save the TSX code to the workspace
    workspace_manager.write_file(workspace_id, "App.tsx", tsx_code.strip())
    
    # Send real-time update to the connected client
    if workspace_id in active_connections:
        await active_connections[workspace_id].send_json({
            "type": "preview_update",
            "content": tsx_code.strip()
        })
    
    return {
        "consultation": consultation_response,
        "tsx_preview": tsx_code.strip()
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

@app.post("/consult", response_model=ConsultationResponse)
async def consult(request: ConsultationRequest):
    try:
        workspace_id = workspace_manager.create_workspace()
        logging.info(f"Created new workspace: {workspace_id}")
        
        # Use create_website from autogen_agents
        result = await asyncio.to_thread(create_website, request.message, request.autonomy_level)
        
        generated_content = await generate_tsx_preview(request.message, workspace_id)
        
        # Update shared knowledge based on the response
        for key in ai.shared_knowledge.keys():
            if key.lower() in generated_content["consultation"].lower():
                ai.update_shared_knowledge(key, generated_content["consultation"])
                await send_websocket_update(workspace_id, f"knowledge_update_{key}", ai.shared_knowledge[key])
        
        await send_websocket_update(workspace_id, "preview_update", result.get("tsx_preview", generated_content["tsx_preview"]))
        await send_websocket_update(workspace_id, "progress_update", result.get("progress", 0))
        
        response = ConsultationResponse(
            message=result["message"], 
            tsx_preview=result.get("tsx_preview", generated_content["tsx_preview"]),
            shared_knowledge=ai.shared_knowledge,
            compiled_results=result.get("compiled_results"),
            workspace_id=workspace_id
        )
        logging.info(f"Consultation response created for workspace: {workspace_id}")
        return response
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
