import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AIMLClient:
    def __init__(self):
        self.api = OpenAI(
            api_key=os.getenv("AI_ML_API_KEY"),
            base_url="https://api.aimlapi.com/v1"
        )

    def generate_response(self, prompt, model="o1-preview", max_tokens=1000):
        try:
            completion = self.api.chat.completions.create(
                model=model,  # Placeholder, replace with actual model name when available
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in web development and project management."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error generating response: {str(e)}")
            return None

    def choose_model(self, task_complexity):
        if task_complexity == "high":
            return "o1-preview"  # Placeholder
        else:
            return "o1-mini"  # Placeholder

ai_ml_client = AIMLClient()

# Example usage
if __name__ == "__main__":
    prompt = "Explain the key components of a modern web application architecture."
    model = ai_ml_client.choose_model("high")
    response = ai_ml_client.generate_response(prompt, model)
    print(response)