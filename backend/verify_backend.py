import asyncio
import websockets
import requests
import json
import logging
import os
import shutil
from typing import Dict, Any, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backend_verification.log')
    ]
)

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"
HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

def log_response(response: requests.Response, endpoint: str):
    """Log detailed response information"""
    logging.info(f"\n{'='*50}")
    logging.info(f"Endpoint: {endpoint}")
    logging.info(f"Status Code: {response.status_code}")
    logging.info(f"Headers: {dict(response.headers)}")
    try:
        logging.info(f"Response Body: {json.dumps(response.json(), indent=2)}")
    except:
        logging.info(f"Response Text: {response.text}")
    logging.info(f"{'='*50}\n")

async def verify_websocket(workspace_id: str) -> Tuple[bool, str]:
    """Verify WebSocket connection and updates"""
    try:
        async with websockets.connect(
            f"{WS_URL}/ws/{workspace_id}",
            extra_headers={'Origin': 'http://localhost:3000'}
        ) as websocket:
            logging.info("WebSocket connection established")
            try:
                # Wait for updates for 15 seconds
                response = await asyncio.wait_for(websocket.recv(), timeout=15.0)
                logging.info(f"Received WebSocket update: {response}")
                return True, "WebSocket connection and updates successful"
            except asyncio.TimeoutError:
                logging.warning("No WebSocket updates received in 15 seconds")
                return True, "WebSocket connection successful but no updates received"
    except Exception as e:
        error_msg = f"WebSocket verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_health() -> Tuple[bool, str]:
    """Verify health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", headers=HEADERS)
        log_response(response, "health")
        if response.status_code == 200:
            return True, "Health check successful"
        return False, f"Health check failed with status {response.status_code}"
    except Exception as e:
        error_msg = f"Health check failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_consultation(message: str = "Create a simple landing page") -> Tuple[bool, str, Optional[Dict]]:
    """Verify consultation endpoint"""
    try:
        payload = {
            "message": message,
            "autonomy_level": 50
        }
        response = requests.post(
            f"{BASE_URL}/consult",
            json=payload,
            headers=HEADERS
        )
        log_response(response, "consult")
        
        if response.status_code != 200:
            return False, f"Consultation failed with status {response.status_code}", None
            
        response_data = response.json()
        required_fields = ['message', 'tsx_preview', 'workspace_id', 'shared_knowledge']
        
        if all(field in response_data for field in required_fields):
            return True, "Consultation successful with all required fields", response_data
        
        missing_fields = [field for field in required_fields if field not in response_data]
        return False, f"Consultation missing required fields: {missing_fields}", response_data
            
    except Exception as e:
        error_msg = f"Consultation verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg, None

def verify_autonomy(level: int = 75) -> Tuple[bool, str]:
    """Verify autonomy level setting"""
    try:
        payload = {"autonomy_level": level}
        response = requests.post(
            f"{BASE_URL}/set_autonomy",
            json=payload,
            headers=HEADERS
        )
        log_response(response, "set_autonomy")
        if response.status_code == 200:
            return True, f"Autonomy level set to {level}"
        return False, f"Failed to set autonomy level: {response.status_code}"
    except Exception as e:
        error_msg = f"Autonomy setting failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_preview(workspace_id: str) -> Tuple[bool, str]:
    """Verify preview endpoint"""
    try:
        response = requests.get(
            f"{BASE_URL}/preview/{workspace_id}",
            headers=HEADERS
        )
        log_response(response, "preview")
        if response.status_code == 200:
            preview_data = response.json()
            if 'preview' in preview_data and preview_data['preview'].strip():
                return True, "Preview content retrieved successfully"
            return False, "Preview content is empty"
        return False, f"Preview failed with status {response.status_code}"
    except Exception as e:
        error_msg = f"Preview verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_progress_report() -> Tuple[bool, str]:
    """Verify progress report endpoint"""
    try:
        response = requests.get(
            f"{BASE_URL}/progress_report",
            headers=HEADERS
        )
        log_response(response, "progress_report")
        if response.status_code == 200:
            report_data = response.json()
            if 'report' in report_data and report_data['report'].strip():
                return True, "Progress report retrieved successfully"
            return False, "Progress report is empty"
        return False, f"Progress report failed with status {response.status_code}"
    except Exception as e:
        error_msg = f"Progress report verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_strategy_explanation() -> Tuple[bool, str]:
    """Verify strategy explanation endpoint"""
    try:
        payload = {"strategy_type": "UI Design"}
        response = requests.post(
            f"{BASE_URL}/explain_strategy",
            json=payload,
            headers=HEADERS
        )
        log_response(response, "explain_strategy")
        if response.status_code == 200:
            explanation_data = response.json()
            if 'explanation' in explanation_data and explanation_data['explanation'].strip():
                return True, "Strategy explanation retrieved successfully"
            return False, "Strategy explanation is empty"
        return False, f"Strategy explanation failed with status {response.status_code}"
    except Exception as e:
        error_msg = f"Strategy explanation verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_agent_response() -> Tuple[bool, str]:
    """Verify agent response endpoint"""
    try:
        payload = {
            "agent_type": "UI Design",
            "prompt": "Suggest a modern layout",
            "autonomy_level": 50
        }
        response = requests.post(
            f"{BASE_URL}/agent_response",
            json=payload,
            headers=HEADERS
        )
        log_response(response, "agent_response")
        if response.status_code == 200:
            agent_data = response.json()
            if 'response' in agent_data and agent_data['response'].strip():
                return True, "Agent response retrieved successfully"
            return False, "Agent response is empty"
        return False, f"Agent response failed with status {response.status_code}"
    except Exception as e:
        error_msg = f"Agent response verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_serve_website(workspace_id: str) -> Tuple[bool, str]:
    """Verify serve website endpoint"""
    try:
        response = requests.get(
            f"{BASE_URL}/serve/{workspace_id}/App.tsx",
            headers={'Accept': 'text/plain'}
        )
        log_response(response, "serve_website")
        if response.status_code == 200:
            if response.text.strip():
                return True, "Website content served successfully"
            return False, "Served content is empty"
        return False, f"Serve website failed with status {response.status_code}"
    except Exception as e:
        error_msg = f"Serve website verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def verify_shared_knowledge(consultation_data: Dict) -> Tuple[bool, str]:
    """Verify shared knowledge updates"""
    try:
        shared_knowledge = consultation_data.get('shared_knowledge', {})
        if not shared_knowledge:
            return False, "No shared knowledge found"
        
        # Check for expected categories
        expected_categories = ['UI Design', 'Monetization', 'SEO', 'Analytics', 'Deployment']
        missing_categories = [cat for cat in expected_categories if cat not in shared_knowledge]
        
        if missing_categories:
            return False, f"Missing knowledge categories: {missing_categories}"
        
        # Check if any category has content
        has_content = any(bool(content) for content in shared_knowledge.values())
        if not has_content:
            return False, "No content in shared knowledge categories"
            
        return True, "Shared knowledge verified successfully"
    except Exception as e:
        error_msg = f"Shared knowledge verification failed: {str(e)}"
        logging.error(error_msg)
        return False, error_msg

def cleanup_workspace(workspace_id: str) -> None:
    """Clean up created workspace"""
    try:
        workspace_path = os.path.join("workspaces", workspace_id)
        if os.path.exists(workspace_path):
            shutil.rmtree(workspace_path)
            logging.info(f"Cleaned up workspace: {workspace_id}")
    except Exception as e:
        logging.error(f"Failed to cleanup workspace {workspace_id}: {e}")

async def run_verification():
    """Run all verification checks"""
    results = {}
    workspace_id = None
    
    try:
        # Initial Checks
        results["Health Check"] = verify_health()
        results["Autonomy Setting"] = verify_autonomy()
        
        # Consultation and Related Checks
        success, msg, consultation_data = verify_consultation()
        results["Consultation"] = (success, msg)
        
        if consultation_data:
            workspace_id = consultation_data.get('workspace_id')
            if workspace_id:
                results["WebSocket"] = await verify_websocket(workspace_id)
                results["Preview"] = verify_preview(workspace_id)
                results["Serve Website"] = verify_serve_website(workspace_id)
                results["Shared Knowledge"] = verify_shared_knowledge(consultation_data)
        
        # Additional Endpoint Checks
        results["Progress Report"] = verify_progress_report()
        results["Strategy Explanation"] = verify_strategy_explanation()
        results["Agent Response"] = verify_agent_response()
        
        # Print Results
        print("\nBackend Verification Results:")
        print("=" * 50)
        
        all_passed = True
        for check, (success, message) in results.items():
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"{check}: {status}")
            print(f"  └─ {message}")
            all_passed = all_passed and success
            
        print("=" * 50)
        print(f"\nOverall Status: {'✅ ALL CHECKS PASSED' if all_passed else '❌ SOME CHECKS FAILED'}")
        print(f"\nDetailed logs available in: backend_verification.log")
        
        return all_passed
        
    except Exception as e:
        logging.error(f"Verification process failed: {e}")
        return False
        
    finally:
        # Cleanup
        if workspace_id:
            cleanup_workspace(workspace_id)

if __name__ == "__main__":
    print("Starting Backend Verification...")
    print("=" * 50)
    asyncio.run(run_verification())
