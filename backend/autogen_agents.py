import sys
import os
import json 
import inspect
import traceback
import requests

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from typing import Dict, Any, List
import os
import logging
from dotenv import load_dotenv
from langchain_google_vertexai import ChatVertexAI
import openai
from tavily import TavilyClient
import anthropic

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

# Initialize AI Platform
project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
if not project_id:
    logging.warning("GOOGLE_CLOUD_PROJECT not found in environment variables. ChatVertexAI may not work properly.")

# Initialize OpenRouter client
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
if not openrouter_api_key:
    logging.error("OPENROUTER_API_KEY not found in environment variables")
    raise ValueError("OPENROUTER_API_KEY not found in environment variables")

# Initialize Tavily client
tavily_api_key = os.getenv("TAVILY_API_KEY")
if tavily_api_key:
    tavily_client = TavilyClient(api_key=tavily_api_key)
else:
    logging.warning("TAVILY_API_KEY not found in environment variables. Tavily search will not be available.")
    tavily_client = None

# Initialize Anthropic client
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
if anthropic_api_key:
    anthropic_client = anthropic.Anthropic(api_key=anthropic_api_key)
else:
    logging.warning("ANTHROPIC_API_KEY not found in environment variables. Claude API will not be available.")
    anthropic_client = None

# Initialize Perplexity client
perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")

# Global variables
AUTONOMY_LEVEL = 50
SHARED_KNOWLEDGE = {}
TASK_QUEUE = []

# Define a separate, simplified config for GroupChatManager without 'function'
manager_llm_config = {
    "config_list": [{"model": "gpt-3.5-turbo"}],
    "temperature": 0.7,
    "request_timeout": 120
}

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if callable(obj):
            return f"<function {obj.__name__}>"
        elif inspect.isclass(obj):
            return f"<class {obj.__name__}>"
        elif isinstance(obj, AssistantAgent):
            return f"<AssistantAgent {obj.name}>"
        elif isinstance(obj, UserProxyAgent):
            return f"<UserProxyAgent {obj.name}>"
        elif isinstance(obj, GroupChat):
            return self.serialize_groupchat(obj)
        return super().default(obj)
        
def set_autonomy_level(level: int):
    global AUTONOMY_LEVEL
    AUTONOMY_LEVEL = level
    logging.info(f"Autonomy level set to {AUTONOMY_LEVEL}")

def openrouter_call(prompt: str, model: str) -> str:
    try:
        logging.info(f"Making OpenRouter API call to model: {model}")
        headers = {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://websplat.ai",
            "X-Title": "WebSplat AI"
        }
        
        # Optimize prompt by removing unnecessary whitespace while preserving structure
        prompt_lines = prompt.split('\n')
        optimized_lines = [' '.join(line.split()) for line in prompt_lines if line.strip()]
        prompt = '\n'.join(optimized_lines)
        
        # Configure request with token management
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 2000,  # Limit response length
            "temperature": 0.7,   # Control response randomness
            "top_p": 0.9,        # Focus on more likely tokens
            "frequency_penalty": 0.0,  # Reduce repetition
            "presence_penalty": 0.0    # Encourage topic focus
        }
        
        logging.info(f"OpenRouter request headers: {headers}")
        logging.info(f"OpenRouter request data: {data}")
        
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
        logging.info(f"OpenRouter response status: {response.status_code}")
        logging.info(f"OpenRouter response: {response.text}")
        
        response_json = response.json()
        if 'error' in response_json:
            error_message = response_json['error'].get('message', 'Unknown error')
            logging.error(f"OpenRouter API error: {error_message}")
            
            if 'max_tokens limit exceeded' in error_message:
                # Try with reduced token limits
                data["max_tokens"] = 1000
                # Keep system message but reduce user message length if needed
                if len(prompt) > 3000:  # Approximate token limit
                    user_lines = [line for line in prompt_lines if "user has requested:" in line.lower()]
                    system_lines = [line for line in prompt_lines if "system message:" in line.lower()]
                    other_lines = [line for line in prompt_lines if "generate" in line.lower() or "create" in line.lower()]
                    reduced_prompt = '\n'.join(system_lines + user_lines + other_lines[:2])
                    data["messages"][0]["content"] = reduced_prompt
                
                response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
                response_json = response.json()
                if 'choices' in response_json:
                    return response_json['choices'][0]['message']['content']
            
            return f"I apologize, but I encountered an error: {error_message}. Please try breaking your request into smaller parts."
        
        return response_json['choices'][0]['message']['content']
    except Exception as e:
        logging.error(f"OpenRouter API call failed: {e}")
        logging.error(f"Error details: {traceback.format_exc()}")
        return "I apologize, but I encountered an error. Please try again with a simpler request."

def o1_mini_call(prompt: str) -> str:
    return openrouter_call(prompt, "mistralai/mistral-7b-instruct")

def o1_call(prompt: str) -> str:
    return openrouter_call(prompt, "openai/gpt-4")

def claude_opus_call(prompt: str) -> str:
    return openrouter_call(prompt, "anthropic/claude-3-opus:beta")

def claude_vertex_call(prompt: str) -> str:
    if not anthropic_client:
        return "Claude API is not available due to missing API key."
    try:
        completion = anthropic_client.completions.create(
            model="claude-3-sonnet-20240229-v1:0",
            max_tokens_to_sample=1000,
            prompt=f"\n\nHuman: {prompt}\n\nAssistant:",
        )
        return completion.completion
    except Exception as e:
        logging.error(f"Error in claude_vertex_call: {e}")
        return f"Error in claude_vertex_call: {str(e)}"

def vertex_ai_call(prompt: str) -> str:
    try:
        chat = ChatVertexAI(model_name="chat-bison@001", project=project_id)
        response = chat.predict(prompt)
        return response
    except Exception as e:
        logging.error(f"Error in vertex_ai_call: {e}")
        return f"Error in vertex_ai_call: {str(e)}"

def perplexity_call(prompt: str) -> str:
    if not perplexity_api_key:
        return "Perplexity API is not available due to missing API key."
    try:
        headers = {
            "Authorization": f"Bearer {perplexity_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "sonar-medium-online",
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post("https://api.perplexity.ai/chat/completions", headers=headers, json=data)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        logging.error(f"Perplexity API call failed: {e}")
        return f"Perplexity API call failed: {str(e)}"

def web_search(query: str) -> List[Dict[str, str]]:
    if not tavily_client:
        return [{"title": "Web search unavailable", "content": "Tavily API is not available due to missing API key."}]
    try:
        search_result = tavily_client.search(query=query)
        return [{"title": result["title"], "content": result["content"]} for result in search_result["results"]]
    except Exception as e:
        logging.error(f"Tavily search failed: {e}")
        return [{"title": "Search error", "content": f"Tavily search failed: {str(e)}"}]
    
# Define a dictionary to map function names to actual functions
FUNCTION_MAP = {
    "o1_call": o1_call,
    "o1_mini_call": o1_mini_call,
    "claude_vertex_call": claude_vertex_call,
    "claude_opus_call": claude_opus_call,
    "vertex_ai_call": vertex_ai_call,
    "perplexity_call": perplexity_call,
    "web_search": web_search
}

def is_termination_msg(x):
    """Check if a message indicates termination of the conversation."""
    try:
        if isinstance(x, dict):
            content = x.get("content", "")
            if isinstance(content, str):
                return content.rstrip().endswith("TERMINATE")
            elif isinstance(content, list):
                return any(isinstance(item, str) and item.rstrip().endswith("TERMINATE") for item in content)
        elif isinstance(x, str):
            return x.rstrip().endswith("TERMINATE")
        return False
    except Exception as e:
        logging.error(f"Error in is_termination_msg: {e}")
        return False

class EnhancedAssistantAgent(AssistantAgent):
    def __init__(self, name: str, system_message: str, llm_config: Dict[str, Any]):
        # Convert the function to a string identifier
        if "function" in llm_config and callable(llm_config["function"]):
            llm_config["function"] = next(
                (name for name, func in FUNCTION_MAP.items() if func == llm_config["function"]),
                "unknown_function"
            )
        
        # Ensure the llm_config has the required fields
        llm_config.setdefault("model", "gpt-3.5-turbo")  # Default model
        llm_config.setdefault("temperature", 0.7)  # Default temperature
        
        # Remove the 'function' key from llm_config before passing it to the parent class
        self.function_name = llm_config.pop("function", None)
        
        # Create a custom config that doesn't rely on OpenAI's API
        custom_llm_config = {
            "config_list": [{"model": llm_config["model"]}],
            "temperature": llm_config["temperature"],
            "request_timeout": 120,
        }
        
        super().__init__(name=name, system_message=system_message, llm_config=custom_llm_config)
        self.tasks = []
        self.completed_tasks = []
        self.confidence_score = 0  # Initialize confidence score

    def generate_reply(self, messages: List[Dict[str, Any]], sender: Any, config: Dict[str, Any]) -> str:
        try:
            function = FUNCTION_MAP.get(self.function_name)
            if function:
                prompt = self.system_message + "\n\n" + "\n".join([f"{m['role']}: {m['content']}" for m in messages])
                return function(prompt)
            else:
                logging.error(f"Unknown function: {self.function_name}")
                return f"Error: Unknown function {self.function_name}"
        except Exception as e:
            logging.error(f"Error in generate_reply: {e}")
            return f"Error in generate_reply: {str(e)}"

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
        function = FUNCTION_MAP.get(self.function_name)
        if function:
            result = function(query)
            self.update_shared_knowledge(query, result)
            return result
        else:
            logging.error(f"Unknown function: {self.function_name}")
            return f"Error: Unknown function {self.function_name}"

    def request_reasoning(self, query: str, o1_agent: 'EnhancedAssistantAgent') -> str:
        function = FUNCTION_MAP.get(o1_agent.function_name)
        if function:
            response = function(f"Reasoning request from {self.name}: {query}")
            logging.info(f"{self.name} requested reasoning from O1 agent: {query}")
            return response
        else:
            logging.error(f"Unknown function: {o1_agent.function_name}")
            return f"Error: Unknown function {o1_agent.function_name}"
    
    def serialize_groupchat(self, groupchat):
        return {
            "agents": [agent.name for agent in groupchat.agents],
            "messages": [self.serialize_message(msg) for msg in groupchat.messages],
            "max_round": groupchat.max_round
        }

    def serialize_message(self, message):
        return {
            "sender": message.get("sender", "Unknown"),
            "content": message.get("content", "")
        }
        
    def select_speaker(self, agents=None):
        agents = agents if agents is not None else self.agents
        selected_agent = max(agents, key=lambda agent: agent.confidence_score)
        return selected_agent

def serialize_shared_knowledge(shared_knowledge: Dict[str, Any]) -> Dict[str, Any]:
    try:
        return json.loads(json.dumps(shared_knowledge, cls=CustomJSONEncoder))
    except Exception as e:
        logging.error(f"Error serializing shared knowledge: {e}")
        return {"error": "Failed to serialize shared knowledge"}

class DevelopmentEnvironment:
    def __init__(self):
        self.updates = {}

    def receive_update(self, agent_name: str, update: str):
        self.updates[agent_name] = update

    def get_updates(self) -> Dict[str, str]:
        return self.updates

# Create enhanced agent instances with updated llm_config
llm_config = {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "function": o1_call  # Set this based on your specific function
}

o1_agent = EnhancedAssistantAgent(
    name="O1_Agent",
    system_message="You are the central reasoning agent powered by the O1 model. Your role is to provide high-level reasoning, strategic planning, and decision-making support for the website creation process. You cannot process images, search the web, or use external tools. Focus on analyzing information, providing insights, and guiding the overall strategy.",
    llm_config=llm_config
)

head_project_manager = EnhancedAssistantAgent(
    name="Head_Project_Manager",
    system_message="You are the head project manager overseeing the website creation process. Coordinate with the O1 agent for high-level reasoning and strategic decisions. Manage task delegation and ensure the project meets the user's requirements.",
    llm_config={"function": o1_mini_call, "model": "mistralai/mistral-7b-instruct"}
)

frontend_designer = EnhancedAssistantAgent(
    name="Frontend_Designer",
    system_message="Create the visual design and layout of the website based on user requirements and best UX/UI practices.",
    llm_config={"function": vertex_ai_call, "model": "chat-bison@001"}
)

lead_developer = EnhancedAssistantAgent(
    name="Lead_Developer",
    system_message="Translate designs into functional code and oversee the technical implementation of the website.",
    llm_config={"function": claude_vertex_call, "model": "claude-3-sonnet-20240229"}
)

consultation_agent = EnhancedAssistantAgent(
    name="Consultation_Agent",
    system_message="""You are the primary interface with the user, responsible for guiding them through the website creation process.
    When the user requests website changes or creation:
    1. First understand their requirements
    2. If UI changes are needed, generate a TSX component (wrap the code with TSX_START and TSX_END markers)
    3. Provide clear, friendly explanations of what you're doing
    4. Only delegate to other agents when specifically needed for specialized tasks
    
    Your responses should be conversational and encouraging, similar to Vercel's v0 AI.
    Always maintain a helpful and professional tone.
    
    When generating TSX code:
    - Start with 'import React from "react";'
    - Use modern React practices
    - Include basic styling
    - Make components responsive
    - Wrap the code with TSX_START and TSX_END markers""",
    llm_config={"function": claude_opus_call, "model": "anthropic/claude-3-opus:beta"}
)

user_content_manager = EnhancedAssistantAgent(
    name="User_Content_Manager",
    system_message="Manage and integrate user-provided content into the website, including text and media.",
    llm_config={"function": claude_vertex_call, "model": "claude-3-sonnet-20240229"}
)

monetization_agent = EnhancedAssistantAgent(
    name="Monetization_Agent",
    system_message="Develop monetization strategies for the website based on its purpose and target audience.",
    llm_config={"function": perplexity_call, "model": "sonar-medium-online"}
)

seo_agent = EnhancedAssistantAgent(
    name="SEO_Agent",
    system_message="Optimize the website for search engines, providing recommendations for improved visibility and ranking.",
    llm_config={"function": perplexity_call, "model": "sonar-medium-online"}
)

research_agent = EnhancedAssistantAgent(
    name="Research_Agent",
    system_message="Conduct web searches to gather relevant information for the website creation process.",
    llm_config={"function": web_search, "model": "web_search"}
)
        
user_proxy = UserProxyAgent(
    name="User_Proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    is_termination_msg=is_termination_msg,
    code_execution_config={"work_dir": "web_project", "use_docker": False},  # Disable Docker usage
    system_message="You are a proxy for the end-user, initiating the website creation process and providing necessary information and feedback."
)

def create_website(user_requirements: str, autonomy_level: int) -> Dict[str, Any]:
    global AUTONOMY_LEVEL, SHARED_KNOWLEDGE
    AUTONOMY_LEVEL = autonomy_level
    logging.info(f"Starting website creation with autonomy level: {AUTONOMY_LEVEL}")

    dev_env = DevelopmentEnvironment()

    # Adjust agent behavior based on autonomy level
    if AUTONOMY_LEVEL < 30:
        head_project_manager.system_message += " Frequently consult with other agents and ask for user input when making decisions."
    elif AUTONOMY_LEVEL > 70:
        head_project_manager.system_message += " Make more autonomous decisions with minimal consultation."

    # Create a list of agents
    agents = [user_proxy, o1_agent, head_project_manager, frontend_designer, lead_developer, consultation_agent, user_content_manager, monetization_agent, seo_agent, research_agent]

    try:
        # Initialize the chat with user requirements
        chat_messages = [{"role": "user", "content": f"Create a website with the following requirements: {user_requirements}"}]
        
        # Simulate the group chat
        for _ in range(50):  # Max 50 rounds
            for agent in agents:
                if isinstance(agent, EnhancedAssistantAgent):
                    # Generate reply
                    reply = agent.generate_reply(chat_messages, sender=user_proxy, config={})
                    chat_messages.append({"role": "assistant", "content": reply, "name": agent.name})
                    
                    # Process tasks
                    while agent.tasks:
                        task = agent.get_next_task()
                        logging.info(f"{agent.name} is working on task: {task['task']}")
                        
                        # Execute the task
                        result = FUNCTION_MAP.get(agent.function_name, lambda x: f"Error: Unknown function {agent.function_name}")(task['task'])
                        
                        # Update shared knowledge and development environment
                        agent.update_shared_knowledge(task['task'], result)
                        dev_env.receive_update(agent.name, result)
                        
                        # Complete the task
                        agent.complete_task(task)
                
                # Check for termination condition
                if isinstance(agent, UserProxyAgent):
                    last_message = chat_messages[-1]
                    if is_termination_msg(last_message):
                        break
            
            # Check for overall termination
            if is_termination_msg(chat_messages[-1]):
                break

        # Compile results
        compiled_results = consultation_agent.get_shared_knowledge("compiled_results")
        if not compiled_results:
            compiled_results = FUNCTION_MAP[consultation_agent.function_name]("Compile the final results of the website creation process based on all agent updates and shared knowledge.")
            consultation_agent.update_shared_knowledge("compiled_results", compiled_results)

        # Extract relevant information
        consultation_response = extract_consultation_response(chat_messages)
        tsx_preview = extract_tsx_preview(chat_messages)
        serialized_knowledge = serialize_shared_knowledge(SHARED_KNOWLEDGE)
        
        result = {
            "message": consultation_response,
            "tsx_preview": tsx_preview,
            "shared_knowledge": serialized_knowledge,
            "compiled_results": compiled_results
        }

        # Attempt to serialize the result
        try:
            json.dumps(result, cls=CustomJSONEncoder)
        except TypeError as e:
            logging.error(f"JSON serialization error: {e}")
            logging.error(f"Traceback: {traceback.format_exc()}")
            return {
                "message": f"An error occurred while serializing the result: {str(e)}",
                "tsx_preview": "No TSX preview available.",
                "shared_knowledge": {},
                "compiled_results": "Error in compiling results.",
                "error_details": traceback.format_exc()
            }

        return result
    except Exception as e:
        logging.error(f"Error in create_website: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        return {
            "message": f"An error occurred while creating the website: {str(e)}",
            "tsx_preview": "No TSX preview available yet.",
            "shared_knowledge": {},
            "compiled_results": "Error in compiling results.",
            "error_details": traceback.format_exc()
        }

def extract_consultation_response(messages: list) -> str:
    for message in reversed(messages):
        if message.get("name") == "Consultation_Agent":
            return message["content"]
    return "No consultation response available."

def extract_tsx_preview(messages: list) -> str:
    for message in reversed(messages):
        if message.get("name") == "Frontend_Designer" and "```tsx" in message["content"]:
            start = message["content"].index("```tsx") + 6
            end = message["content"].index("```", start)
            return message["content"][start:end].strip()
    return "No TSX preview available yet."

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
        "monetization": FUNCTION_MAP[monetization_agent.function_name]("Explain the current monetization strategy for the website"),
        "seo": FUNCTION_MAP[seo_agent.function_name]("Explain the current SEO strategy for the website"),
        "ui_design": FUNCTION_MAP[frontend_designer.function_name]("Explain the current UI design strategy for the website"),
        "development": FUNCTION_MAP[lead_developer.function_name]("Explain the current development strategy for the website"),
        "content": FUNCTION_MAP[user_content_manager.function_name]("Explain the current content management strategy for the website"),
    }
    
    return strategy_explanations.get(strategy_type.lower(), "Strategy type not recognized. Available types are: monetization, seo, ui_design, development, content.")

if __name__ == "__main__":
    try:
        logging.debug(f"OpenRouter API Key: {openrouter_api_key[:5]}...{openrouter_api_key[-5:]}")  # Log first and last 5 characters of the API key
        result = create_website("Create a landing page for a new fitness app targeting young professionals.", 50)
        print(json.dumps(result, indent=2, cls=CustomJSONEncoder))
        print("\nProgress Report:")
        print(generate_progress_report())
        print("\nMonetization Strategy Explanation:")
        print(explain_strategy("monetization"))
    except Exception as e:
        logging.error(f"Main execution error: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        print(f"An error occurred: {str(e)}")
        print(f"Error details:\n{traceback.format_exc()}")
