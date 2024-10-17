import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_consult():
    response = client.post("/consult", json={"message": "Create a landing page for a coffee shop", "autonomy_level": 50})
    assert response.status_code == 200
    assert "message" in response.json()
    assert "tsx_preview" in response.json()
    assert "shared_knowledge" in response.json()
    
    tsx_preview = response.json()["tsx_preview"]
    assert "import React" in tsx_preview
    assert "const" in tsx_preview
    assert "return" in tsx_preview
    assert "export default" in tsx_preview

def test_progress_report():
    response = client.get("/progress_report")
    assert response.status_code == 200
    assert "report" in response.json()

def test_explain_strategy():
    response = client.post("/explain_strategy", json={"strategy_type": "UI Design"})
    assert response.status_code == 200
    assert "explanation" in response.json()

def test_agent_response():
    response = client.post("/agent_response", json={"agent_type": "UI Design", "prompt": "Suggest a color scheme for a modern website", "autonomy_level": 50})
    assert response.status_code == 200
    assert "response" in response.json()

if __name__ == "__main__":
    pytest.main([__file__])
