from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

base_url = "https://api.aimlapi.com/v1"
api_key = os.getenv("AI_ML_API_KEY")

class AiMlClient:
    def __init__(self):
        self.api = OpenAI(api_key=api_key, base_url=base_url)

    def generate_response(self, prompt: str, model: str = "o1-mini") -> str:
        try:
            completion = self.api.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=256,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error in generate_response: {e}")
            return f"Error: Unable to generate response using model {model}"

ai_ml_client = AiMlClient()
