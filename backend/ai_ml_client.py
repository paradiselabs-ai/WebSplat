import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIMLClient:
    def __init__(self, use_versioned_url=True):
        base_url = "https://api.aimlapi.com/v1" if use_versioned_url else "https://api.aimlapi.com"
        self.api = OpenAI(
            api_key=os.getenv("AI_ML_API_KEY"),
            base_url=base_url
        )

    def generate_response(self, prompt, model="mistralai/Mistral-7B-Instruct-v0.2", max_tokens=1000):
        try:
            completion = self.api.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in web development and project management."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return None

    def choose_model(self, task_complexity):
        if task_complexity == "high":
            return "gpt-4o"  # High complexity tasks use GPT-4 equivalent
        else:
            return "mistralai/Mistral-7B-Instruct-v0.2"  # Default model for most tasks

    def use_vertex_ai(self, task):
        # Placeholder for Vertex AI integration
        # This method should be implemented to use Vertex AI for specific tasks
        logger.info(f"Using Vertex AI for task: {task}")
        # Implement Vertex AI logic here
        pass

ai_ml_client = AIMLClient()

# Example usage
if __name__ == "__main__":
    prompt = "Explain the key components of a modern web application architecture."
    model = ai_ml_client.choose_model("high")
    response = ai_ml_client.generate_response(prompt, model)
    print(response)

    # Example of using Vertex AI
    ai_ml_client.use_vertex_ai("complex_task")
