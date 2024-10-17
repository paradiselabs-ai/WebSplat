from google.cloud import aiplatform
from google.oauth2 import service_account
import os
import json
import base64
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Decode the base64-encoded credentials
credentials_json = base64.b64decode(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_BASE64")).decode('utf-8')
credentials_dict = json.loads(credentials_json)

# Create credentials object
credentials = service_account.Credentials.from_service_account_info(credentials_dict)

# Initialize Vertex AI with the credentials
aiplatform.init(credentials=credentials)

# Configure the Gemini API
genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))

def generate_vertex_ai_response(input_text, project_id):
    client_options = {"api_endpoint": "us-central1-aiplatform.googleapis.com"}
    client = aiplatform.gapic.PredictionServiceClient(client_options=client_options, credentials=credentials)
    
    instance = {
        "content": input_text
    }

    instances = [instance]
    
    parameters = {
        "temperature": 0.2,
        "maxOutputTokens": 256,
        "topP": 0.95,
        "topK": 40
    }

    endpoint = f"projects/{project_id}/locations/us-central1/publishers/google/models/text-bison"
    
    response = client.predict(
        endpoint=endpoint,
        instances=instances,
        parameters=parameters,
    )
    
    # Handle the response based on its structure
    if response.predictions:
        # Assuming the first prediction contains the generated text
        return response.predictions[0]['content']
    else:
        return "No prediction generated"

def generate_gemini_response(input_text):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(input_text)
    return response.text

app = Flask(__name__)

@app.route('/api/vertex-ai', methods=['POST'])
def vertex_ai_endpoint():
    data = request.json
    input_text = data.get('input')
    project_id = data.get('projectId')
    
    if not input_text or not project_id:
        return jsonify({"error": "Missing input or projectId"}), 400
    
    try:
        response = generate_vertex_ai_response(input_text, project_id)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gemini', methods=['POST'])
def gemini_endpoint():
    data = request.json
    input_text = data.get('input')
    
    if not input_text:
        return jsonify({"error": "Missing input"}), 400
    
    try:
        response = generate_gemini_response(input_text)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
