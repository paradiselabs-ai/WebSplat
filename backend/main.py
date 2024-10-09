from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from autogen_agents import create_website, set_autonomy_level
import asyncio

app = FastAPI()

class ConsultationRequest(BaseModel):
    message: str
    autonomy_level: int

class ConsultationResponse(BaseModel):
    message: str
    tsx_preview: Optional[str] = None

class AutonomyRequest(BaseModel):
    autonomy_level: int

@app.post("/consult", response_model=ConsultationResponse)
async def consult(request: ConsultationRequest):
    try:
        # Run the create_website function in a separate thread to avoid blocking
        result = await asyncio.to_thread(create_website, request.message, request.autonomy_level)
        return ConsultationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/set_autonomy")
async def set_autonomy(request: AutonomyRequest):
    try:
        set_autonomy_level(request.autonomy_level)
        return {"message": "Autonomy level set successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)