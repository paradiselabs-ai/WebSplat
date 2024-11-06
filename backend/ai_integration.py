import os
from openai import OpenAI
from google.cloud import aiplatform
from google.oauth2 import service_account
import google.generativeai as genai
import base64
import tempfile
import json
from datetime import datetime
from groundx import Groundx  # Fixed case sensitivity in import
import logging
import traceback
import requests

class AIIntegration:
    def __init__(self):
        print("\nInitializing AI Integration...")
        print(f"OpenRouter API Key: {os.environ.get('OPENROUTER_API_KEY')[:5]}...")  # Only print first 5 chars for security
        
        self.openai = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        
        # Decode and save Google Cloud credentials
        credentials_json = self._get_google_credentials()
        
        # Vertex AI setup
        aiplatform.init(credentials=credentials_json)
        
        # Gemini setup
        genai.configure(api_key=os.environ.get('GOOGLE_GEMINI_API_KEY'))

        # GroundX RAG setup
        self.groundx = Groundx(api_key=os.environ.get('GROUNDX_API_KEY'))

        # Initialize shared knowledge base
        self.shared_knowledge = {
            "UI Design": [],
            "Monetization": [],
            "SEO": [],
            "Analytics": [],
            "Deployment": []
        }

        # Create initial bucket if none exists
        try:
            bucket_response = self.groundx.buckets.list()
            if len(bucket_response.body["buckets"]) < 1:
                self.groundx.buckets.create(name="websplat-bucket")
                bucket_response = self.groundx.buckets.list()
            self.bucket_id = bucket_response.body["buckets"][0]["bucketId"]
        except Exception as e:
            print(f"Error setting up GroundX bucket: {e}")
            self.bucket_id = None

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

    def generate_text(self, prompt, model='liquid', autonomy_level=50):  # Changed default model to 'liquid'
        try:
            print(f"\nGenerating text with model: {model}")  # Debug print
            print(f"Prompt: {prompt[:200]}...")  # Print first 200 chars
            
            # Get relevant knowledge from GroundX
            relevant_knowledge = ""
            if self.bucket_id:
                try:
                    # List documents without bucket_id parameter
                    docs = self.groundx.documents.list()
                    if docs.body.get("documents"):
                        # Search through existing documents
                        search_results = self.groundx.search.content(
                            id=self.bucket_id,
                            query=prompt,
                            next_token=None
                        )
                        if search_results.body.get("results"):
                            relevant_knowledge = "\n".join([r.get("content", "") for r in search_results.body["results"]])
                except Exception as e:
                    print(f"Error retrieving knowledge from GroundX: {e}")
            
            # Combine the prompt with relevant knowledge
            enhanced_prompt = f"Relevant knowledge: {relevant_knowledge}\n\nUser prompt: {prompt}"
            print(f"Enhanced prompt: {enhanced_prompt[:200]}...")  # Debug print
            
            if model == 'liquid':
                response = self.liquid_reasoning(enhanced_prompt, autonomy_level)
            elif model == 'o1':
                response = self.o1_reasoning(enhanced_prompt, autonomy_level)
            elif model == 'openai':
                response = self.openai.completions.create(engine="text-davinci-002", prompt=enhanced_prompt, max_tokens=1000)
                response = response.choices[0].text.strip()
            elif model == 'vertex':
                response = self.vertex_ai_reasoning(enhanced_prompt, autonomy_level)
            elif model == 'gemini':
                response = self.gemini_reasoning(enhanced_prompt, autonomy_level)
            else:
                raise ValueError(f"Unsupported model: {model}")
            
            print(f"Response: {response[:200]}...")  # Debug print
            return response
        except Exception as e:
            error_msg = f"Error in generate_text: {e}"
            print(error_msg)  # Debug print
            print(f"Traceback: {traceback.format_exc()}")  # Debug print
            return f"I apologize, but I encountered an error: {error_msg}. Please try again."

    def liquid_reasoning(self, prompt, autonomy_level):
        """
        Use Liquid model through OpenRouter with NVIDIA fallback.
        """
        print("\nMaking Liquid model call...")  # Debug print
        print(f"Prompt: {prompt[:200]}...")  # Print first 200 chars
        
        try:
            headers = {
                "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "liquid/lfm-40b:free",
                "messages": [
                    {"role": "system", "content": f"You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration. Your autonomy level is set to {autonomy_level}%."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.7,
                "top_p": 0.9
            }
            
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data
            )
            
            print(f"OpenRouter response status: {response.status_code}")  # Debug print
            print(f"OpenRouter response: {response.text[:200]}...")  # Debug print
            
            if response.status_code != 200:
                print("Liquid call failed, falling back to NVIDIA...")  # Debug print
                return self.nvidia_reasoning(prompt, autonomy_level)
                
            response_json = response.json()
            response_text = response_json['choices'][0]['message']['content']
            
            if "error" in response_text.lower():
                print("Liquid call failed, falling back to NVIDIA...")  # Debug print
                return self.nvidia_reasoning(prompt, autonomy_level)
            return response_text
        except Exception as e:
            print(f"Liquid API call failed: {e}")  # Debug print
            print(f"Traceback: {traceback.format_exc()}")  # Debug print
            return self.nvidia_reasoning(prompt, autonomy_level)

    def nvidia_reasoning(self, prompt, autonomy_level):
        """
        Use NVIDIA model as fallback.
        """
        print("\nMaking NVIDIA model call...")  # Debug print
        print(f"Prompt: {prompt[:200]}...")  # Print first 200 chars
        
        try:
            client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=os.environ.get('NVIDIA_API_KEY')
            )
            completion = client.chat.completions.create(
                model="meta/llama-3.1-405b-instruct",
                messages=[
                    {"role": "system", "content": f"You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration. Your autonomy level is set to {autonomy_level}%."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                top_p=0.7,
                max_tokens=1024
            )
            response = completion.choices[0].message.content
            print(f"NVIDIA response: {response[:200]}...")  # Debug print
            return response
        except Exception as e:
            error_msg = f"NVIDIA API call failed: {e}"
            print(error_msg)  # Debug print
            print(f"Traceback: {traceback.format_exc()}")  # Debug print
            return error_msg

    def o1_reasoning(self, prompt, autonomy_level, model="openai/o1-mini"):
        """
        Use O1 model for advanced reasoning tasks with adjustable autonomy.
        """
        print("\nMaking O1 model call...")  # Debug print
        print(f"Prompt: {prompt[:200]}...")  # Print first 200 chars
        
        try:
            headers = {
                "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": f"You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration. Your autonomy level is set to {autonomy_level}%."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.7,
                "top_p": 0.9
            }
            
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenRouter API error: {response.text}")
                
            response_json = response.json()
            response_text = response_json['choices'][0]['message']['content']
            print(f"O1 response: {response_text[:200]}...")  # Debug print
            return response_text
        except Exception as e:
            error_msg = f"O1 API call failed: {e}"
            print(error_msg)  # Debug print
            print(f"Traceback: {traceback.format_exc()}")  # Debug print
            return error_msg

    def vertex_ai_reasoning(self, prompt, autonomy_level):
        """
        Use Vertex AI for reasoning tasks with adjustable autonomy.
        """
        print("\nMaking Vertex AI model call...")  # Debug print
        print(f"Prompt: {prompt[:200]}...")  # Print first 200 chars
        
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
        print(f"Vertex AI response: {response.predictions[0][:200]}...")  # Debug print
        return response.predictions[0]

    def gemini_reasoning(self, prompt, autonomy_level):
        """
        Use Gemini for reasoning tasks with adjustable autonomy.
        """
        print("\nMaking Gemini model call...")  # Debug print
        print(f"Prompt: {prompt[:200]}...")  # Print first 200 chars
        
        model = genai.GenerativeModel('gemini-pro')
        system_prompt = f"You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration. Your autonomy level is set to {autonomy_level}%."
        chat = model.start_chat(history=[])
        response = chat.send_message(f"{system_prompt}\n\n{prompt}", generation_config=genai.types.GenerationConfig(
            temperature=autonomy_level / 100,
            top_p=0.8,
            top_k=40,
            max_output_tokens=1024
        ))
        print(f"Gemini response: {response.text[:200]}...")  # Debug print
        return response.text

    def get_agent_response(self, agent_type, prompt, autonomy_level):
        """
        Get response from a specific agent type.
        """
        print(f"\nGetting response for agent type: {agent_type}")  # Debug print
        print(f"Prompt: {prompt[:200]}...")  # Print first 200 chars
        
        agent_prompts = {
            "UI Design": "As a UI Design expert, ",
            "Monetization": "As a Monetization strategist, ",
            "SEO": "As an SEO specialist, ",
            "Analytics": "As an Analytics expert, ",
            "Deployment": "As a Deployment specialist, "
        }
        
        # Get relevant knowledge from GroundX
        relevant_knowledge = ""
        if self.bucket_id:
            try:
                search_results = self.groundx.search.content(
                    id=self.bucket_id,
                    query=prompt,
                    next_token=None
                )
                if search_results.body.get("results"):
                    relevant_knowledge = "\n".join([r.get("content", "") for r in search_results.body["results"]])
            except Exception as e:
                print(f"Error retrieving knowledge from GroundX: {e}")
        
        full_prompt = f"{agent_prompts.get(agent_type, '')}{prompt}\n\nRelevant knowledge: {relevant_knowledge}"
        response = self.generate_text(full_prompt, model='liquid', autonomy_level=autonomy_level)  # Changed default model to 'liquid'
        
        # Update the shared knowledge base with the new response
        self.update_shared_knowledge(agent_type, response)
        
        return response

    def update_shared_knowledge(self, agent_type, new_knowledge):
        """
        Update the shared knowledge base with new information.
        """
        print(f"\nUpdating shared knowledge for {agent_type}")  # Debug print
        self.shared_knowledge[agent_type].append(new_knowledge)
        
        # Update GroundX knowledge base
        if self.bucket_id:
            try:
                # Create a temporary file with the new knowledge
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as temp_file:
                    temp_file.write(new_knowledge)
                    temp_file_path = temp_file.name

                # Upload the file to GroundX
                with open(temp_file_path, 'rb') as f:
                    self.groundx.documents.ingest_local(
                        body=[{
                            "blob": f,
                            "metadata": {
                                "bucketId": self.bucket_id,
                                "fileName": f"{agent_type.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                                "fileType": "txt",
                                "metadata": {
                                    "type": agent_type,
                                    "timestamp": datetime.now().isoformat()
                                }
                            }
                        }]
                    )

                # Clean up the temporary file
                os.unlink(temp_file_path)
            except Exception as e:
                print(f"Error updating GroundX knowledge base: {e}")

ai = AIIntegration()
