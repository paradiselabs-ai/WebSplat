from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from typing import Dict, Any, List
import os
import logging
from dotenv import load_dotenv
from ai_ml_client import ai_ml_client
from google.cloud import aiplatform
import openai
from tavily import TavilyClient

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

# Initialize AI Platform
aiplatform.init(project=os.getenv("GOOGLE_CLOUD_PROJECT"), location="us-central1")

# Initialize OpenRouter client
openai.api_key = os.getenv("OPENROUTER_API_KEY")
openai.api_base = "https://openrouter.ai/api/v1"

# Initialize Tavily client
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# Global variables
AUTONOMY_LEVEL = 50
SHARED_KNOWLEDGE = {}
TASK_QUEUE = []

def set_autonomy_level(level: int):
    global AUTONOMY_LEVEL
    AUTONOMY_LEVEL = level
    logging.info(f"Autonomy level set to {AUTONOMY_LEVEL}")

def o1_mini_call(prompt: str) -> str:
    try:
        return ai_ml_client.generate_response(prompt, "o1-mini")
    except Exception as e:
        logging.error(f"Error in o1_mini_call: {e}")
        return "Error in o1_mini_call"

def claude_vertex_call(prompt: str) -> str:
    try:
        response = aiplatform.ChatModel.from_pretrained("claude-3-sonnet@001").predict(prompt=prompt)
        return response.text
    except Exception as e:
        logging.error(f"Error in claude_vertex_call: {e}")
        return "Error in claude_vertex_call"

def vertex_ai_call(prompt: str) -> str:
    try:
        response = aiplatform.ChatModel.from_pretrained("chat-bison@001").predict(prompt=prompt)
        return response.text
    except Exception as e:
        logging.error(f"Error in vertex_ai_call: {e}")
        return "Error in vertex_ai_call"

def perplexity_call(prompt: str) -> str:
    try:
        response = openai.ChatCompletion.create(
            model="perplexity/llama-3.1-sonar-huge-128k-online",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"OpenRouter call failed: {e}")
        return "Perplexity API call failed"

def web_search(query: str) -> List[Dict[str, str]]:
    try:
        search_result = tavily_client.search(query=query)
        return [{"title": result["title"], "content": result["content"]} for result in search_result["results"]]
    except Exception as e:
        logging.error(f"Tavily search failed: {e}")
        return []

class EnhancedAssistantAgent(AssistantAgent):
    def __init__(self, name: str, system_message: str, llm_config: Dict[str, Any]):
        super().__init__(name=name, system_message=system_message, llm_config=llm_config)
        self.tasks = []

    def add_task(self, task: str, priority: int = 1):
        self.tasks.append({"task": task, "priority": priority})
        self.tasks.sort(key=lambda x: x["priority"], reverse=True)

    def get_next_task(self):
        return self.tasks.pop(0) if self.tasks else None

    def update_shared_knowledge(self, key: str, value: Any):
        SHARED_KNOWLEDGE[key] = value

    def get_shared_knowledge(self, key: str) -> Any:
        return SHARED_KNOWLEDGE.get(key)

# Create enhanced agent instances
head_project_manager = EnhancedAssistantAgent(
    name="Head_Project_Manager",
    system_message="You are the head project manager overseeing the website creation process. Coordinate all other agents and ensure the project meets the user's requirements.",
    llm_config={"function": o1_mini_call}
)

frontend_designer = EnhancedAssistantAgent(
    name="Frontend_Designer",
    system_message="Create the visual design and layout of the website based on user requirements and best UX/UI practices.",
    llm_config={"function": vertex_ai_call}
)

lead_developer = EnhancedAssistantAgent(
    name="Lead_Developer",
    system_message="Translate designs into functional code and oversee the technical implementation of the website.",
    llm_config={"function": claude_vertex_call}
)

consultation_agent = EnhancedAssistantAgent(
    name="Consultation_Agent",
    system_message="You are the primary interface with the user. Gather requirements, provide updates on the website creation process, and communicate major milestones in natural language.",
    llm_config={"function": claude_vertex_call}
)

user_content_manager = EnhancedAssistantAgent(
    name="User_Content_Manager",
    system_message="Manage and integrate user-provided content into the website, including text and media.",
    llm_config={"function": claude_vertex_call}
)

monetization_agent = EnhancedAssistantAgent(
    name="Monetization_Agent",
    system_message="Develop monetization strategies for the website based on its purpose and target audience.",
    llm_config={"function": perplexity_call}
)

seo_agent = EnhancedAssistantAgent(
    name="SEO_Agent",
    system_message="Optimize the website for search engines, providing recommendations for improved visibility and ranking.",
    llm_config={"function": perplexity_call}
)

research_agent = EnhancedAssistantAgent(
    name="Research_Agent",
    system_message="Conduct web searches to gather relevant information for the website creation process.",
    llm_config={"function": web_search}
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
    logging.info(f"Starting website creation with autonomy level: {AUTONOMY_LEVEL}")

    # Adjust agent behavior based on autonomy level
    if AUTONOMY_LEVEL < 30:
        consultation_agent.system_message += " Frequently ask for user input and confirmation."
    elif AUTONOMY_LEVEL > 70:
        consultation_agent.system_message += " Make more autonomous decisions with minimal user input."

    # Initialize task queue
    head_project_manager.add_task("Analyze user requirements", 3)
    head_project_manager.add_task("Create project plan", 2)
    head_project_manager.add_task("Assign tasks to agents", 1)

    groupchat = GroupChat(
        agents=[user_proxy, head_project_manager, frontend_designer, lead_developer, consultation_agent, user_content_manager, monetization_agent, seo_agent, research_agent],
        messages=[],
        max_round=50
    )
    manager = GroupChatManager(groupchat=groupchat)

    try:
        # Initiate the chat with user requirements
        user_proxy.initiate_chat(
            manager,
            message=f"Create a website with the following requirements: {user_requirements}"
        )

        # Process tasks in the queue
        while TASK_QUEUE:
            current_task = TASK_QUEUE.pop(0)
            agent = current_task["agent"]
            task = current_task["task"]
            agent.add_task(task)
            next_task = agent.get_next_task()
            if next_task:
                result = agent.llm_config["function"](next_task["task"])
                agent.update_shared_knowledge(next_task["task"], result)

        # Extract relevant information from the chat history
        consultation_response = extract_consultation_response(groupchat.messages)
        tsx_preview = extract_tsx_preview(groupchat.messages)

        return {
            "message": consultation_response,
            "tsx_preview": tsx_preview,
            "shared_knowledge": SHARED_KNOWLEDGE
        }
    except Exception as e:
        logging.error(f"Error in create_website: {e}")
        return {
            "message": "An error occurred while creating the website.",
            "tsx_preview": "() => <div>Error: Unable to generate preview</div>",
            "shared_knowledge": {}
        }

def extract_consultation_response(messages: list) -> str:
    for message in reversed(messages):
        if message["sender"] == "Consultation_Agent":
            return message["content"]
    return "No consultation response available."

def extract_tsx_preview(messages: list) -> str:
    for message in reversed(messages):
        if message["sender"] == "Frontend_Designer" and "```tsx" in message["content"]:
            start = message["content"].index("```tsx") + 6
            end = message["content"].index("```", start)
            return message["content"][start:end].strip()
    return "() => <div>No TSX preview available yet.</div>"

if __name__ == "__main__":
    result = create_website("Create a landing page for a new fitness app targeting young professionals.", 50)
    print(result)