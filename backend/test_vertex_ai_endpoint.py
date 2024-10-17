import requests
import os

def test_vertex_ai_endpoint():
    url = "http://localhost:8000/api/vertex-ai"
    
    # Ensure the GOOGLE_CLOUD_PROJECT environment variable is set
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if not project_id:
        raise ValueError("GOOGLE_CLOUD_PROJECT environment variable is not set")

    payload = {
        "input": "What are the key components of a modern web application?",
        "projectId": project_id
    }

    try:
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"Response Content: {response.text}")
        
        response.raise_for_status()  # Raise an exception for bad status codes
        
        result = response.json()
        
        print("Vertex AI Response:")
        print(result['response'])
        
        assert 'response' in result, "Response does not contain 'response' key"
        assert isinstance(result['response'], str), "Response is not a string"
        assert len(result['response']) > 0, "Response is empty"
        
        print("Test passed successfully!")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error occurred while making the request: {e}")
        if hasattr(e, 'response'):
            print(f"Response content: {e.response.text}")
        return False
    except AssertionError as e:
        print(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    test_vertex_ai_endpoint()
