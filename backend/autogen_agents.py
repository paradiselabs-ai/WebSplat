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

def o1_call(prompt: str) -> str:
    try:
        return ai_ml_client.generate_response(prompt, "o1")
    except Exception as e:
        logging.error(f"Error in o1_call: {e}")
        return "Error in o1_call"

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
        self.completed_tasks = []

    def add_task(self, task: str, priority: int = 1):
        self.tasks.append({"task": task, "priority": priority})
        self.tasks.sort(key=lambda x: x["priority"], reverse=True)

    def get_next_task(self):
        return self.tasks.pop(0) if self.tasks else None

    def complete_task(self, task: Dict[str, Any]):
        self.completed_tasks.append(task)

    def update_shared_knowledge(self, key: str, value: Any):
        SHARED_KNOWLEDGE[key] = value

    def get_shared_knowledge(self, key: str) -> Any:
        return SHARED_KNOWLEDGE.get(key)

    def delegate_task(self, task: str, target_agent: 'EnhancedAssistantAgent', priority: int = 1):
        target_agent.add_task(task, priority)
        logging.info(f"{self.name} delegated task '{task}' to {target_agent.name}")

    def request_information(self, query: str, target_agent: 'EnhancedAssistantAgent') -> str:
        response = target_agent.llm_config["function"](f"{self.name} requests: {query}")
        logging.info(f"{self.name} requested information from {target_agent.name}: {query}")
        return response

    def request_reasoning(self, query: str, o1_agent: 'EnhancedAssistantAgent') -> str:
        response = o1_agent.llm_config["function"](f"Reasoning request from {self.name}: {query}")
        logging.info(f"{self.name} requested reasoning from O1 agent: {query}")
        return response

# Create enhanced agent instances
o1_agent = EnhancedAssistantAgent(
    name="O1_Agent",
    system_message="You are the central reasoning agent powered by the O1 model. Your role is to provide high-level reasoning, strategic planning, and decision-making support for the website creation process. You cannot process images, search the web, or use external tools. Focus on analyzing information, providing insights, and guiding the overall strategy.",
    llm_config={"function": o1_call}
)

head_project_manager = EnhancedAssistantAgent(
    name="Head_Project_Manager",
    system_message="You are the head project manager overseeing the website creation process. Coordinate with the O1 agent for high-level reasoning and strategic decisions. Manage task delegation and ensure the project meets the user's requirements.",
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
        head_project_manager.system_message += " Frequently consult with other agents and ask for user input when making decisions."
    elif AUTONOMY_LEVEL > 70:
        head_project_manager.system_message += " Make more autonomous decisions with minimal consultation."

    # Initialize task queue
    head_project_manager.add_task("Analyze user requirements and create high-level project plan", 3)
    head_project_manager.add_task("Delegate initial tasks to appropriate agents", 2)

    groupchat = GroupChat(
        agents=[user_proxy, o1_agent, head_project_manager, frontend_designer, lead_developer, consultation_agent, user_content_manager, monetization_agent, seo_agent, research_agent],
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
        while True:
            active_agents = [agent for agent in groupchat.agents if isinstance(agent, EnhancedAssistantAgent) and agent.tasks]
            if not active_agents:
                break

            for agent in active_agents:
                next_task = agent.get_next_task()
                if next_task:
                    task_description = next_task["task"]
                    logging.info(f"{agent.name} is working on task: {task_description}")
                    
                    # Request reasoning from O1 agent for complex tasks
                    if agent != o1_agent and "analyze" in task_description.lower() or "strategy" in task_description.lower():
                        reasoning = agent.request_reasoning(task_description, o1_agent)
                        logging.info(f"O1 reasoning for {agent.name}'s task: {reasoning}")
                    
                    # Check if the agent needs information from another agent
                    if "request information from" in task_description.lower():
                        target_agent_name = task_description.split("from")[-1].strip()
                        target_agent = next((a for a in groupchat.agents if a.name == target_agent_name), None)
                        if target_agent:
                            info = agent.request_information(task_description, target_agent)
                            agent.update_shared_knowledge(task_description, info)
                    else:
                        result = agent.llm_config["function"](task_description)
                        agent.update_shared_knowledge(task_description, result)
                    
                    agent.complete_task(next_task)
                    
                    # Check if the agent needs to delegate a task
                    if "delegate" in result.lower():
                        delegation_info = result.split("delegate")[-1].strip()
                        target_agent_name, delegated_task = delegation_info.split(":", 1)
                        target_agent = next((a for a in groupchat.agents if a.name == target_agent_name.strip()), None)
                        if target_agent:
                            agent.delegate_task(delegated_task.strip(), target_agent)

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

# New functions for progress report and strategy explanation
def generate_progress_report() -> str:
    report = "Current Progress Report:\n\n"
    
    for agent in [head_project_manager, frontend_designer, lead_developer, consultation_agent, user_content_manager, monetization_agent, seo_agent]:
        report += f"{agent.name}:\n"
        report += f"  Completed tasks: {len(agent.completed_tasks)}\n"
        report += f"  Pending tasks: {len(agent.tasks)}\n"
        if agent.completed_tasks:
            report += "  Last completed task: " + agent.completed_tasks[-1]["task"] + "\n"
        if agent.tasks:
            report += "  Next task: " + agent.tasks[0]["task"] + "\n"
        report += "\n"
    
    report += f"Shared Knowledge Items: {len(SHARED_KNOWLEDGE)}\n"
    report += f"Current Autonomy Level: {AUTONOMY_LEVEL}\n"
    
    return report

def explain_strategy(strategy_type: str) -> str:
    strategy_explanations = {
        "monetization": monetization_agent.llm_config["function"]("Explain the current monetization strategy for the website"),
        "seo": seo_agent.llm_config["function"]("Explain the current SEO strategy for the website"),
        "ui_design": frontend_designer.llm_config["function"]("Explain the current UI design strategy for the website"),
        "development": lead_developer.llm_config["function"]("Explain the current development strategy for the website"),
        "content": user_content_manager.llm_config["function"]("Explain the current content management strategy for the website"),
    }
    
    return strategy_explanations.get(strategy_type.lower(), "Strategy type not recognized. Available types are: monetization, seo, ui_design, development, content.")

if __name__ == "__main__":
    result = create_website("Create a landing page for a new fitness app targeting young professionals.", 50)
    print(result)
    print("\nProgress Report:")
    print(generate_progress_report())
    print("\nMonetization Strategy Explanation:")
    print(explain_strategy("monetization"))
