tafrom autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from typing import Dict, Any
import os
from dotenv import load_dotenv
from ai_ml_client import ai_ml_client
from google.cloud import aiplatform
import openai

# Load environment variables
load_dotenv()

# Initialize AI Platform
aiplatform.init(project=os.getenv("GOOGLE_CLOUD_PROJECT"), location="us-central1")

# Initialize OpenRouter client
openai.api_key = os.getenv("OPENROUTER_API_KEY")
openai.api_base = "https://openrouter.ai/api/v1"

# Global variable to store autonomy level
AUTONOMY_LEVEL = 50

def set_autonomy_level(level: int):
    global AUTONOMY_LEVEL
    AUTONOMY_LEVEL = level

def o1_mini_call(prompt: str) -> str:
    return ai_ml_client.generate_response(prompt, "o1-mini")

def claude_vertex_call(prompt: str) -> str:
    response = aiplatform.ChatModel.from_pretrained("claude-3-sonnet@001").predict(prompt=prompt)
    return response.text

def vertex_ai_call(prompt: str) -> str:
    response = aiplatform.ChatModel.from_pretrained("chat-bison@001").predict(prompt=prompt)
    return response.text

def perplexity_call(prompt: str) -> str:
    try:
        response = openai.ChatCompletion.create(
            model="perplexity/llama-3.1-sonar-huge-128k-online",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenRouter call failed: {e}")
        # Fallback to native Perplexity API
        # Implement native Perplexity API call here
        return "Perplexity API call failed"

# Create agent instances
head_project_manager = AssistantAgent(
    name="Head_Project_Manager",
    system_message="You are the head project manager overseeing the website creation process. Coordinate all other agents and ensure the project meets the user's requirements.",
    llm_config={"function": o1_mini_call}
)

frontend_designer = AssistantAgent(
    name="Frontend_Designer",
    system_message="Create the visual design and layout of the website based on user requirements and best UX/UI practices.",
    llm_config={"function": vertex_ai_call}
)

lead_developer = AssistantAgent(
    name="Lead_Developer",
    system_message="Translate designs into functional code and oversee the technical implementation of the website.",
    llm_config={"function": claude_vertex_call}
)

consultation_agent = AssistantAgent(
    name="Consultation_Agent",
    system_message="You are the primary interface with the user. Gather requirements, provide updates on the website creation process, and communicate major milestones in natural language.",
    llm_config={"function": claude_vertex_call}
)

user_content_manager = AssistantAgent(
    name="User_Content_Manager",
    system_message="Manage and integrate user-provided content into the website, including text and media.",
    llm_config={"function": claude_vertex_call}
)

monetization_agent = AssistantAgent(
    name="Monetization_Agent",
    system_message="Develop monetization strategies for the website based on its purpose and target audience.",
    llm_config={"function": perplexity_call}
)

seo_agent = AssistantAgent(
    name="SEO_Agent",
    system_message="Optimize the website for search engines, providing recommendations for improved visibility and ranking.",
    llm_config={"function": perplexity_call}
)

user_proxy = UserProxyAgent(
    name="User_Proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    code_execution_config={"work_dir": "web_project"},
    system_message="You are a proxy for the end-user, initiating the website creation process and providing necessary information and feedback."
)

def create_website(user_requirements: str, autonomy_level: int) -> Dict[str, Any]:
    global AUTONOMY_LEVEL
    AUTONOMY_LEVEL = autonomy_level

    groupchat = GroupChat(
        agents=[user_proxy, head_project_manager, frontend_designer, lead_developer, consultation_agent, user_content_manager, monetization_agent, seo_agent],
        messages=[],
        max_round=50
    )
    manager = GroupChatManager(groupchat=groupchat)

    # Initiate the chat with user requirements
    user_proxy.initiate_chat(
        manager,
        message=f"Create a website with the following requirements: {user_requirements}"
    )

    # Extract relevant information from the chat history
    consultation_response = extract_consultation_response(groupchat.messages)
    tsx_preview = extract_tsx_preview(groupchat.messages)

    return {
        "message": consultation_response,
        "tsx_preview": tsx_preview
    }

def extract_consultation_response(messages: list) -> str:
    # Extract the last message from the Consultation_Agent
    for message in reversed(messages):
        if message["sender"] == "Consultation_Agent":
            return message["content"]
    return "No consultation response available."

def extract_tsx_preview(messages: list) -> str:
    # Extract the last TSX code snippet from the Frontend_Designer
    for message in reversed(messages):
        if message["sender"] == "Frontend_Designer" and "```tsx" in message["content"]:
            start = message["content"].index("```tsx") + 6
            end = message["content"].index("```", start)
            return message["content"][start:end].strip()
    return "() => <div>No TSX preview available yet.</div>"

if __name__ == "__main__":
    # Test the create_website function
    result = create_website("Create a landing page for a new fitness app targeting young professionals.", 50)
    print(result)