import requests
import json
import time
import websocket
import threading
import pytest
import logging

BASE_URL = "http://localhost:8000"
workspace_id = None

@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown():
    global workspace_id
    # Setup
    yield
    # Teardown
    if workspace_id:
        # Add a cleanup endpoint to delete the workspace after tests
        requests.delete(f"{BASE_URL}/workspace/{workspace_id}")

def test_consult_endpoint():
    global workspace_id
    url = f"{BASE_URL}/consult"
    payload = {
        "message": "Create a landing page for a fitness app",
        "autonomy_level": 50
    }
    response = requests.post(url, json=payload)
    assert response.status_code == 200, f"Consult endpoint failed with status code {response.status_code}"
    data = response.json()
    logging.info(f"Consult endpoint response: {json.dumps(data, indent=2)}")
    assert "message" in data, "Message not found in response"
    assert "tsx_preview" in data, "TSX preview not found in response"
    assert "shared_knowledge" in data, "Shared knowledge not found in response"
    assert "workspace_id" in data, "Workspace ID not found in response"
    workspace_id = data["workspace_id"]
    logging.info(f"Workspace ID: {workspace_id}")
    print("Consult endpoint test passed")

def test_preview_endpoint():
    url = f"{BASE_URL}/preview/{workspace_id}"
    response = requests.get(url)
    assert response.status_code == 200, f"Preview endpoint failed with status code {response.status_code}"
    data = response.json()
    assert "preview" in data, "Preview not found in response"
    assert "import React" in data["preview"], "React import not found in preview"
    assert "workspace_id" in data, "Workspace ID not found in response"
    assert data["workspace_id"] == workspace_id, "Workspace ID mismatch"
    print("Preview endpoint test passed")

def test_workspace_persistence():
    time.sleep(2)
    url = f"{BASE_URL}/preview/{workspace_id}"
    response = requests.get(url)
    assert response.status_code == 200, f"Workspace persistence test failed with status code {response.status_code}"
    data = response.json()
    assert "preview" in data, "Preview not found in response"
    assert "import React" in data["preview"], "React import not found in preview"
    print("Workspace persistence test passed")

def test_progress_report_endpoint():
    url = f"{BASE_URL}/progress_report"
    response = requests.get(url)
    assert response.status_code == 200, f"Progress report endpoint failed with status code {response.status_code}"
    data = response.json()
    assert "report" in data, "Report not found in response"
    print("Progress report endpoint test passed")

def test_explain_strategy_endpoint():
    url = f"{BASE_URL}/explain_strategy"
    strategies = ["UI Design", "Monetization", "SEO", "Analytics", "Deployment"]
    for strategy in strategies:
        payload = {"strategy_type": strategy}
        response = requests.post(url, json=payload)
        assert response.status_code == 200, f"Explain strategy endpoint failed for {strategy} with status code {response.status_code}"
        data = response.json()
        assert "explanation" in data, f"Explanation not found in response for {strategy}"
    print("Explain strategy endpoint test passed")

def test_websocket_connection():
    ws = websocket.WebSocket()
    try:
        ws.connect(f"ws://localhost:8000/ws/{workspace_id}")
        assert ws.connected, "WebSocket connection failed"
    except Exception as e:
        pytest.fail(f"WebSocket connection test failed: {str(e)}")
    finally:
        ws.close()
    print("WebSocket connection test passed")

def test_serve_endpoint():
    url = f"{BASE_URL}/serve/{workspace_id}/App.tsx"
    response = requests.get(url)
    assert response.status_code == 200, f"Serve endpoint failed with status code {response.status_code}"
    assert "import React" in response.text, "React import not found in served file"
    print("Serve endpoint test passed")

def test_agent_response():
    url = f"{BASE_URL}/agent_response"
    agent_types = ["UI Design", "Monetization", "SEO", "Analytics", "Deployment"]
    for agent_type in agent_types:
        payload = {
            "agent_type": agent_type,
            "prompt": f"Provide a tip for {agent_type.lower()}",
            "autonomy_level": 50
        }
        response = requests.post(url, json=payload)
        assert response.status_code == 200, f"Agent response endpoint failed for {agent_type} with status code {response.status_code}"
        data = response.json()
        assert "response" in data, f"Response not found for {agent_type}"
        assert len(data["response"]) > 0, f"Empty response for {agent_type}"
    print("Agent response endpoint test passed")

def test_shared_knowledge_update():
    url = f"{BASE_URL}/consult"
    payload = {
        "message": "Update the fitness app landing page with a section for user testimonials",
        "autonomy_level": 50
    }
    response = requests.post(url, json=payload)
    assert response.status_code == 200, f"Shared knowledge update test failed with status code {response.status_code}"
    data = response.json()
    assert "shared_knowledge" in data, "Shared knowledge not found in response"
    assert any("testimonial" in knowledge.lower() for knowledge in data["shared_knowledge"]["UI Design"]), "Testimonial not found in shared knowledge"
    print("Shared knowledge update test passed")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    pytest.main([__file__])
