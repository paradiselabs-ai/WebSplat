import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://127.0.0.1:5000"  # Changed from localhost to 127.0.0.1

def test_vertex_ai_endpoint():
    url = f"{BASE_URL}/api/vertex-ai"
    payload = {
        "input": "What are the key components of a modern web application?",
        "projectId": os.getenv("GOOGLE_CLOUD_PROJECT")
    }
    
    try:
        print(f"Sending request to {url}")
        print(f"Payload: {payload}")
        response = requests.post(url, json=payload)
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {response.headers}")
        print(f"Response content: {response.text}")
        
        response.raise_for_status()
        result = response.json()
        
        print("Vertex AI Response:")
        print(result['response'])
        
        assert 'response' in result, "Response does not contain 'response' key"
        assert isinstance(result['response'], str), "Response is not a string"
        assert len(result['response']) > 0, "Response is empty"
        
        print("Vertex AI test passed successfully!")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error occurred while making the request to Vertex AI endpoint: {e}")
        if hasattr(e, 'response'):
            print(f"Response content: {e.response.text}")
        return False
    except AssertionError as e:
        print(f"Vertex AI test failed: {e}")
        return False

def test_gemini_endpoint():
    url = f"{BASE_URL}/api/gemini"
    payload = {
        "input": "Explain the concept of serverless computing."
    }
    
    try:
        print(f"Sending request to {url}")
        print(f"Payload: {payload}")
        response = requests.post(url, json=payload)
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {response.headers}")
        print(f"Response content: {response.text}")
        
        response.raise_for_status()
        result = response.json()
        
        print("Gemini API Response:")
        print(result['response'])
        
        assert 'response' in result, "Response does not contain 'response' key"
        assert isinstance(result['response'], str), "Response is not a string"
        assert len(result['response']) > 0, "Response is empty"
        
        print("Gemini API test passed successfully!")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error occurred while making the request to Gemini API endpoint: {e}")
        if hasattr(e, 'response'):
            print(f"Response content: {e.response.text}")
        return False
    except AssertionError as e:
        print(f"Gemini API test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Vertex AI Endpoint:")
    vertex_ai_result = test_vertex_ai_endpoint()
    print("\nTesting Gemini API Endpoint:")
    gemini_result = test_gemini_endpoint()
    
    if vertex_ai_result and gemini_result:
        print("\nAll tests passed successfully!")
    else:
        print("\nSome tests failed. Please check the output above for details.")
