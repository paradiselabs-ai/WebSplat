import os
from openai import OpenAI
from google.cloud import aiplatform
from google.oauth2 import service_account
import google.generativeai as genai
import base64
import tempfile
import json
from groundx import GroundX  # Import the GroundX RAG system

class AIIntegration:
    def __init__(self):
        self.openrouter_client = OpenAI(
            api_key=os.environ.get('OPENROUTER_API_KEY'),
            base_url="https://openrouter.ai/api/v1"
        )
        self.openai = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        
        # Decode and save Google Cloud credentials
        credentials_json = self._get_google_credentials()
        
        # Vertex AI setup
        aiplatform.init(credentials=credentials_json)
        
        # Gemini setup
        genai.configure(api_key=os.environ.get('GOOGLE_GEMINI_API_KEY'))

        # GroundX RAG setup
        self.groundx = GroundX(api_key=os.environ.get('GROUNDX_API_KEY'))

        # Initialize shared knowledge base
        self.shared_knowledge = {
            "UI Design": [],
            "Monetization": [],
            "SEO": [],
            "Analytics": [],
            "Deployment": []
        }

    def _get_google_credentials(self):
        credentials_base64 = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS_BASE64')
        if not credentials_base64:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable is not set")
        
        credentials_json = base64.b64decode(credentials_base64).decode('utf-8')
        credentials_dict = json.loads(credentials_json)
        
        # Create a temporary file to store the credentials
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_file:
            json.dump(credentials_dict, temp_file)
            temp_file_path = temp_file.name
        
        # Use the temporary file to create credentials
        credentials = service_account.Credentials.from_service_account_file(temp_file_path)
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        
        return credentials

    def generate_text(self, prompt, model='o1', autonomy_level=50):
        # Retrieve relevant information from the shared knowledge base
        relevant_knowledge = self.groundx.retrieve(prompt, self.shared_knowledge)
        
        # Combine the prompt with relevant knowledge
        enhanced_prompt = f"Relevant knowledge: {relevant_knowledge}\n\nUser prompt: {prompt}"
        
        if model == 'o1':
            return self.o1_reasoning(enhanced_prompt, autonomy_level)
        elif model == 'openai':
            response = self.openai.completions.create(engine="text-davinci-002", prompt=enhanced_prompt, max_tokens=1000)
            return response.choices[0].text.strip()
        elif model == 'vertex':
            return self.vertex_ai_reasoning(enhanced_prompt, autonomy_level)
        elif model == 'gemini':
            return self.gemini_reasoning(enhanced_prompt, autonomy_level)
        else:
            raise ValueError(f"Unsupported model: {model}")

    def o1_reasoning(self, prompt, autonomy_level, model="openai/o1-mini"):
        """
        Use O1 model for advanced reasoning tasks with adjustable autonomy.
        """
        system_prompt = f"You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration. Your autonomy level is set to {autonomy_level}%."
        response = self.openrouter_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000
        )
        return response.choices[0].message.content

    def vertex_ai_reasoning(self, prompt, autonomy_level):
        """
        Use Vertex AI for reasoning tasks with adjustable autonomy.
        """
        parameters = {
            "temperature": autonomy_level / 100,
            "max_output_tokens": 1024,
            "top_p": 0.8,
            "top_k": 40
        }
        model = aiplatform.Model("text-bison@001")
        system_prompt = f"You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration. Your autonomy level is set to {autonomy_level}%."
        full_prompt = f"{system_prompt}\n\nUser: {prompt}\n\nAssistant:"
        response = model.predict(full_prompt, **parameters)
        return response.predictions[0]

    def gemini_reasoning(self, prompt, autonomy_level):
        """
        Use Gemini for reasoning tasks with adjustable autonomy.
        """
        model = genai.GenerativeModel('gemini-pro')
        system_prompt = f"You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration. Your autonomy level is set to {autonomy_level}%."
        chat = model.start_chat(history=[])
        response = chat.send_message(f"{system_prompt}\n\n{prompt}", generation_config=genai.types.GenerationConfig(
            temperature=autonomy_level / 100,
            top_p=0.8,
            top_k=40,
            max_output_tokens=1024
        ))
        return response.text

    def get_agent_response(self, agent_type, prompt, autonomy_level):
        """
        Get response from a specific agent type.
        """
        agent_prompts = {
            "UI Design": "As a UI Design expert, ",
            "Monetization": "As a Monetization strategist, ",
            "SEO": "As an SEO specialist, ",
            "Analytics": "As an Analytics expert, ",
            "Deployment": "As a Deployment specialist, "
        }
        
        # Retrieve relevant information from the shared knowledge base
        relevant_knowledge = self.groundx.retrieve(prompt, self.shared_knowledge[agent_type])
        
        full_prompt = f"{agent_prompts.get(agent_type, '')}{prompt}\n\nRelevant knowledge: {relevant_knowledge}"
        response = self.generate_text(full_prompt, model='gemini', autonomy_level=autonomy_level)
        
        # Update the shared knowledge base with the new response
        self.update_shared_knowledge(agent_type, response)
        
        return response

    def update_shared_knowledge(self, agent_type, new_knowledge):
        """
        Update the shared knowledge base with new information.
        """
        self.shared_knowledge[agent_type].append(new_knowledge)
        # Use GroundX to index the new knowledge
        self.groundx.index(agent_type, new_knowledge)

ai = AIIntegration()
