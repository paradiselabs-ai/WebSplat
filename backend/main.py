from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Union
from .ai_integration import AIIntegration
from .workspace_manager import WorkspaceManager
from .autogen_agents import consultation_agent, FUNCTION_MAP, set_autonomy_level, generate_progress_report, explain_strategy
import asyncio
import logging
import traceback
import json
import os
import time
from datetime import datetime

# Set up detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)

# Add cleanup task function
async def cleanup_stale_connections():
    """Periodically clean up stale connections"""
    while True:
        try:
            stale_connections = [
                workspace_id for workspace_id, conn in active_connections.items()
                if conn.is_stale()
            ]
            for workspace_id in stale_connections:
                if workspace_id in active_connections:
                    try:
                        await active_connections[workspace_id].websocket.close()
                    except:
                        pass
                    del active_connections[workspace_id]
                    logging.info(f"Cleaned up stale connection for workspace: {workspace_id}")
        except Exception as e:
            logging.error(f"Error in cleanup task: {e}")
        await asyncio.sleep(60)  # Run every minute

app = FastAPI()

# Add startup event for cleanup task
@app.on_event("startup")
async def startup_event():
    """Start background tasks on app startup"""
    # Start cleanup task for stale connections
    asyncio.create_task(cleanup_stale_connections())

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

ai = AIIntegration()
workspace_manager = WorkspaceManager(base_path="./workspaces")

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

# WebSocket message models
class BaseWebSocketMessage(BaseModel):
    type: str
    agent: Optional[str] = None

class ChatMessage(BaseWebSocketMessage):
    type: str = "chat_message"
    role: str
    content: str
    autonomy_level: Optional[int] = 50  # Default to 50% autonomy

class PreviewUpdateMessage(BaseWebSocketMessage):
    type: str = "preview_update"
    content: str

class ProgressUpdateMessage(BaseWebSocketMessage):
    type: str = "progress_update"
    content: float
    progress_details: Optional[str] = None

class KnowledgeUpdateMessage(BaseWebSocketMessage):
    type: str
    content: List[str]

class ReconnectMessage(BaseWebSocketMessage):
    type: str = "reconnect"
    previous_workspace_id: str

class HeartbeatMessage(BaseWebSocketMessage):
    type: str = "heartbeat"
    timestamp: float

WebSocketMessageUnion = Union[
    ChatMessage, 
    PreviewUpdateMessage, 
    ProgressUpdateMessage, 
    KnowledgeUpdateMessage,
    ReconnectMessage,
    HeartbeatMessage
]

# WebSocket connection class with metadata
class WebSocketConnection:
    def __init__(self, websocket: WebSocket, workspace_id: str):
        self.websocket = websocket
        self.workspace_id = workspace_id
        self.connected_at = time.time()
        self.last_message = time.time()
        self.message_count = 0
        self.failed_attempts = 0
        self.last_heartbeat = time.time()

    def update_activity(self):
        self.last_message = time.time()
        self.message_count += 1
        # Extend workspace expiration on activity
        if self.workspace_id in workspace_manager.metadata:
            workspace_manager.extend_workspace_expiration(self.workspace_id)

    async def send_message(self, message: WebSocketMessageUnion):
        try:
            await self.websocket.send_json(message.dict())
            self.update_activity()
            logging.info(f"Sent message to workspace {self.workspace_id}: {message}")
        except Exception as e:
            logging.error(f"Error sending message to workspace {self.workspace_id}: {e}")
            self.failed_attempts += 1
            raise

    def is_stale(self, timeout: int = 300) -> bool:
        """Check if connection is stale (no activity for 5 minutes)"""
        return time.time() - self.last_message > timeout

# Active WebSocket connections
active_connections: Dict[str, WebSocketConnection] = {}

# Pending messages for workspaces without active connections
pending_messages: Dict[str, List[WebSocketMessageUnion]] = {}

# Knowledge categorization keywords
KNOWLEDGE_CATEGORIES = {
    "UI Design": ["ui", "user interface", "design", "layout", "style", "component", "testimonial", "section", "visual", "display"],
    "Monetization": ["monetization", "revenue", "payment", "subscription", "pricing", "premium"],
    "SEO": ["seo", "search engine", "meta", "keyword", "ranking", "optimization"],
    "Analytics": ["analytics", "tracking", "metrics", "data", "performance", "monitoring"],
    "Deployment": ["deployment", "hosting", "server", "production", "launch", "release"]
}

async def store_websocket_message(workspace_id: str, message: WebSocketMessageUnion):
    """Store a message for a workspace until its WebSocket connects."""
    if workspace_id not in pending_messages:
        pending_messages[workspace_id] = []
    pending_messages[workspace_id].append(message)
    logging.info(f"Stored message for workspace {workspace_id}: {message}")

async def send_websocket_update(workspace_id: str, update_type: str, content: Any):
    try:
        if update_type == "chat_message":
            message = ChatMessage(
                type=update_type,
                role="ai" if "agent" in content else "user",
                content=content["content"] if isinstance(content, dict) else content,
                agent=content.get("agent") if isinstance(content, dict) else None
            )
        elif update_type == "preview_update":
            message = PreviewUpdateMessage(type=update_type, content=content)
        elif update_type == "progress_update":
            message = ProgressUpdateMessage(
                type=update_type,
                content=float(content) if isinstance(content, (int, float)) else 0.0,
                progress_details=str(content) if isinstance(content, str) else None
            )
        elif update_type.startswith("knowledge_update_"):
            message = KnowledgeUpdateMessage(
                type=update_type,
                content=content if isinstance(content, list) else [str(content)]
            )
        elif update_type == "heartbeat":
            message = HeartbeatMessage(
                type=update_type,
                timestamp=time.time()
            )
        else:
            message = BaseWebSocketMessage(type=update_type)

        if workspace_id in active_connections:
            await active_connections[workspace_id].send_message(message)
            logging.info(f"Sent WebSocket update: type={update_type}, workspace_id={workspace_id}")
        else:
            await store_websocket_message(workspace_id, message)
            logging.info(f"Stored WebSocket update: type={update_type}, workspace_id={workspace_id}")
    except Exception as e:
        logging.error(f"Error sending WebSocket update: {e}")
        logging.error(traceback.format_exc())

async def handle_chat_message(workspace_id: str, message: ChatMessage):
    """Handle incoming chat messages from the frontend."""
    try:
        logging.info(f"Handling chat message for workspace {workspace_id}: {message}")
        
        # Update workspace access time
        if workspace_id in workspace_manager.metadata:
            workspace_manager.metadata[workspace_id].update_access()
            workspace_manager._save_metadata(workspace_id)
        
        # Process message based on role
        if message.role == "user":
            # Get response from consultation agent
            consultation_prompt = (
                f"The user has sent: \"{message.content}\"\n\n"
                f"Provide a friendly and informative response.\n"
                f"If the request involves UI changes, include a TSX component design.\n"
                f"If you need to generate code, clearly indicate it with TSX_START and TSX_END markers."
            )
            
            response = ai.liquid_reasoning(consultation_prompt, message.autonomy_level)
            
            # Send AI response through WebSocket
            await send_websocket_update(workspace_id, "chat_message", {
                "role": "ai",
                "content": response,
                "agent": "consultation_agent"
            })
            
            # Extract and handle any TSX code
            if "TSX_START" in response and "TSX_END" in response:
                tsx_start = response.index("TSX_START") + len("TSX_START")
                tsx_end = response.index("TSX_END")
                tsx_preview = response[tsx_start:tsx_end].strip()
                
                if tsx_preview:
                    # Save TSX code
                    workspace_manager.write_file(workspace_id, "App.tsx", tsx_preview)
                    
                    # Create and save HTML wrapper
                    component_name = "PreviewComponent"
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
                    
                    html_content = create_html_wrapper(tsx_preview, component_name)
                    workspace_manager.write_file(workspace_id, "index.html", html_content)
                    
                    # Send preview update
                    await send_websocket_update(workspace_id, "preview_update", tsx_preview)
            
            # Update shared knowledge
            consultation_text = response.lower()
            for category, keywords in KNOWLEDGE_CATEGORIES.items():
                if any(keyword.lower() in consultation_text for keyword in keywords):
                    ai.update_shared_knowledge(category, response)
                    await send_websocket_update(workspace_id, f"knowledge_update_{category}", ai.shared_knowledge[category])
    
    except Exception as e:
        logging.error(f"Error handling chat message: {e}")
        logging.error(traceback.format_exc())
        raise

@app.websocket("/ws/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: str):
    try:
        logging.info(f"WebSocket connection attempt for workspace: {workspace_id}")
        
        # Check if workspace exists and is valid
        workspace_path = workspace_manager.get_workspace_path(workspace_id)
        if not workspace_path:
            logging.error(f"Workspace not found: {workspace_id}")
            await websocket.close(code=4004)
            return
            
        # Check if workspace is expired
        if workspace_id in workspace_manager.metadata:
            if workspace_manager.metadata[workspace_id].is_expired():
                logging.error(f"Workspace expired: {workspace_id}")
                await websocket.close(code=4005)
                return
        
        await websocket.accept()
        logging.info(f"WebSocket connection accepted for workspace: {workspace_id}")
        
        # Handle existing connection
        if workspace_id in active_connections:
            try:
                old_connection = active_connections[workspace_id]
                await old_connection.websocket.close(code=4000)
                logging.info(f"Closed existing connection for workspace: {workspace_id}")
            except:
                pass
        
        # Create new connection object
        connection = WebSocketConnection(websocket, workspace_id)
        active_connections[workspace_id] = connection
        logging.info(f"Added workspace {workspace_id} to active connections. Total active: {len(active_connections)}")
        
        # Send any pending messages
        if workspace_id in pending_messages:
            logging.info(f"Sending {len(pending_messages[workspace_id])} pending messages for workspace: {workspace_id}")
            for message in pending_messages[workspace_id]:
                try:
                    await connection.send_message(message)
                except Exception as e:
                    logging.error(f"Error sending pending message: {e}")
            del pending_messages[workspace_id]
        
        # Start heartbeat
        heartbeat_task = asyncio.create_task(
            send_websocket_update(workspace_id, "heartbeat", {"timestamp": time.time()})
        )
        
        try:
            while True:
                data = await websocket.receive_text()
                logging.info(f"Received WebSocket message: {data}")
                
                try:
                    message_data = json.loads(data)
                    message_type = message_data.get("type")
                    
                    # Update workspace activity
                    if workspace_id in workspace_manager.metadata:
                        workspace_manager.metadata[workspace_id].update_access()
                        workspace_manager._save_metadata(workspace_id)
                    
                    if message_type == "chat_message":
                        message = ChatMessage(**message_data)
                        await handle_chat_message(workspace_id, message)
                    elif message_type == "heartbeat":
                        message = HeartbeatMessage(**message_data)
                        connection.last_heartbeat = message.timestamp
                    elif message_type == "reconnect":
                        message = ReconnectMessage(**message_data)
                        if message.previous_workspace_id in workspace_manager.metadata:
                            workspace_manager.extend_workspace_expiration(message.previous_workspace_id)
                    else:
                        logging.warning(f"Unknown message type: {message_type}")
                
                except json.JSONDecodeError:
                    logging.error(f"Invalid JSON received: {data}")
                except Exception as e:
                    logging.error(f"Error processing message: {e}")
                    logging.error(traceback.format_exc())
                    connection.failed_attempts += 1
                    if connection.failed_attempts >= 3:
                        await websocket.close(code=4003)
                        break
                
                connection.update_activity()
        
        except WebSocketDisconnect:
            logging.info(f"WebSocket disconnected for workspace: {workspace_id}")
        except Exception as e:
            logging.error(f"Error in WebSocket connection: {e}")
            logging.error(traceback.format_exc())
        finally:
            if workspace_id in active_connections:
                del active_connections[workspace_id]
                logging.info(f"Removed workspace {workspace_id} from active connections. Total active: {len(active_connections)}")
            try:
                heartbeat_task.cancel()
            except:
                pass
    
    except Exception as e:
        logging.error(f"Error accepting WebSocket connection: {e}")
        logging.error(traceback.format_exc())

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
        logging.info(f"Received consultation request: {request}")
        
        workspace_id = workspace_manager.create_workspace()
        logging.info(f"Created new workspace: {workspace_id}")
        
        # Set autonomy level
        set_autonomy_level(request.autonomy_level)
        logging.info(f"Set autonomy level to: {request.autonomy_level}")
        
        # Get initial response from consultation agent
        consultation_prompt = (
            f"You are the primary interface with the user, responsible for guiding them through the website creation process.\n"
            f"The user has requested: \"{request.message}\"\n\n"
            f"Provide a friendly and informative response, explaining the next steps in creating their website.\n"
            f"If the request involves UI changes, include a TSX component design.\n"
            f"Your response should be conversational and encouraging, similar to how Vercel's v0 AI would interact.\n\n"
            f"If you need to generate code, clearly indicate it with TSX_START and TSX_END markers."
        )
        
        logging.info("Generating consultation agent response...")
        response = ai.liquid_reasoning(consultation_prompt, request.autonomy_level)
        logging.info("Consultation agent response received")
        logging.info(f"Response content: {response}")

        # Send user message through WebSocket
        await send_websocket_update(workspace_id, "chat_message", {
            "role": "user",
            "content": request.message
        })
        
        # Send AI response through WebSocket
        await send_websocket_update(workspace_id, "chat_message", {
            "role": "ai",
            "content": response,
            "agent": "consultation_agent"
        })
        
        # Extract TSX code if present
        tsx_preview = None
        if "TSX_START" in response and "TSX_END" in response:
            logging.info("Extracting TSX code from response")
            tsx_start = response.index("TSX_START") + len("TSX_START")
            tsx_end = response.index("TSX_END")
            tsx_preview = response[tsx_start:tsx_end].strip()
            
            # Save TSX code to workspace if present
            if tsx_preview:
                logging.info("Saving TSX code to workspace")
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
                logging.info(f"Saved App.tsx to workspace: {workspace_id}")
                
                # Create and save the HTML wrapper
                html_content = create_html_wrapper(tsx_preview, component_name)
                workspace_manager.write_file(workspace_id, "index.html", html_content)
                logging.info(f"Saved index.html to workspace: {workspace_id}")
                
                await send_websocket_update(workspace_id, "preview_update", tsx_preview)
                logging.info("Sent preview update through WebSocket")
        
        # Update shared knowledge based on the response
        consultation_text = response.lower()
        for category, keywords in KNOWLEDGE_CATEGORIES.items():
            if any(keyword.lower() in consultation_text for keyword in keywords):
                logging.info(f"Updating shared knowledge for category: {category}")
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

@app.post("/test_workspace")
async def test_workspace():
    """Test endpoint that creates a workspace without AI integration."""
    try:
        workspace_id = workspace_manager.create_workspace()
        # Create a simple test file
        workspace_manager.write_file(workspace_id, "test.txt", "Test content")
        return {"workspace_id": workspace_id, "message": "Test workspace created"}
    except Exception as e:
        logging.error(f"Error in test_workspace endpoint: {e}")
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

@app.delete("/workspace/{workspace_id}")
async def delete_workspace(workspace_id: str):
    """Delete a workspace and all its contents."""
    try:
        logging.info(f"Attempting to delete workspace: {workspace_id}")
        if workspace_id in active_connections:
            await active_connections[workspace_id].websocket.close()
            del active_connections[workspace_id]
        
        workspace_manager.delete_workspace(workspace_id)
        logging.info(f"Successfully deleted workspace: {workspace_id}")
        return {"message": f"Workspace {workspace_id} deleted successfully"}
    except Exception as e:
        logging.error(f"Error deleting workspace {workspace_id}: {e}")
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
