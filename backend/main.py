from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from autogen_agents import create_website, set_autonomy_level
import asyncio
import logging

app = FastAPI()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ConsultationRequest(BaseModel):
    message: str
    autonomy_level: int

class ConsultationResponse(BaseModel):
    message: str
    tsx_preview: Optional[str] = None
    shared_knowledge: Dict[str, Any] = {}

class AutonomyRequest(BaseModel):
    autonomy_level: int

@app.post("/consult", response_model=ConsultationResponse)
async def consult(request: ConsultationRequest):
    try:
        # Run the create_website function in a separate thread to avoid blocking
        result = await asyncio.to_thread(create_website, request.message, request.autonomy_level)
        return ConsultationResponse(**result)
    except Exception as e:
        logging.error(f"Error in consult endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/set_autonomy")
async def set_autonomy(request: AutonomyRequest):
    try:
        set_autonomy_level(request.autonomy_level)
        return {"message": "Autonomy level set successfully"}
    except Exception as e:
        logging.error(f"Error in set_autonomy endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)