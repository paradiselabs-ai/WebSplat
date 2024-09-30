import os
from openai import OpenAI

class AIIntegration:
    def __init__(self):
        self.o1_client = OpenAI(
            api_key=os.environ.get('AIML_API_KEY'),
            base_url="https://api.aimlapi.com"
        )
        self.openai = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

    def generate_text(self, prompt, model='o1'):
        if model == 'o1':
            return self.o1_reasoning(prompt)
        elif model == 'openai':
            response = self.openai.completions.create(engine="text-davinci-002", prompt=prompt, max_tokens=1000)
            return response.choices[0].text.strip()
        else:
            raise ValueError(f"Unsupported model: {model}")

    def o1_reasoning(self, prompt, model="o1-preview"):
        """
        Use O1 model for advanced reasoning tasks.
        """
        response = self.o1_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an AI assistant with advanced reasoning capabilities, specialized in web development and AI integration."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000  # Adjust as needed, considering both visible and reasoning tokens
        )
        return response.choices[0].message.content

ai = AIIntegration()