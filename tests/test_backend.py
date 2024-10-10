import requests
import json

BASE_URL = "http://localhost:8000"

def test_consult_endpoint():
    url = f"{BASE_URL}/consult"
    payload = {
        "message": "Create a landing page for a fitness app",
        "autonomy_level": 50
    }
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "tsx_preview" in data
    assert "shared_knowledge" in data
    print("Consult endpoint test passed")

def test_progress_report_endpoint():
    url = f"{BASE_URL}/progress_report"
    response = requests.get(url)
    assert response.status_code == 200
    data = response.json()
    assert "report" in data
    print("Progress report endpoint test passed")

def test_explain_strategy_endpoint():
    url = f"{BASE_URL}/explain_strategy"
    strategies = ["monetization", "seo", "ui_design", "development", "content"]
    for strategy in strategies:
        payload = {"strategy_type": strategy}
        response = requests.post(url, json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "explanation" in data
    print("Explain strategy endpoint test passed")

if __name__ == "__main__":
    test_consult_endpoint()
    test_progress_report_endpoint()
    test_explain_strategy_endpoint()
    print("All backend tests passed successfully!")
