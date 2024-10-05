import random
import json
import os
import time
from dotenv import load_dotenv
from google.cloud import aiplatform
import vertexai
from vertexai.language_models import TextGenerationModel
from google.oauth2 import service_account
from ai_ml_client import ai_ml_client
import re
from functools import lru_cache
import logging
from datetime import datetime

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load credentials and project ID
credentials_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
if credentials_json is None:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
credentials_dict = json.loads(credentials_json)
project_id = credentials_dict

logger.info(f"AI Agents - Project ID: {credentials_dict}")
logger.info(f"AI Agents - Credentials path: {credentials_json}")

# Initialize Vertex AI
try:
    credentials = service_account.Credentials.from_service_account_info(credentials_dict)
    vertexai.init(project=project_id, location="us-central1", credentials=credentials)
    aiplatform.init(credentials=credentials)
    logger.info("AI Agents - Vertex AI initialized successfully")
except Exception as e:
    logger.error(f"AI Agents - Error initializing Vertex AI: {str(e)}")
    raise

class AIAgent:
    def __init__(self, role):
        self.role = role
        self.vertex_model = TextGenerationModel.from_pretrained("text-bison@001")
        self.performance_logs = []
        self.current_task = None
        self.last_action_timestamp = None

    def estimate_complexity(self, text):
        words = re.findall(r'\w+', text.lower())
        unique_words = set(words)
        complexity = len(words) * len(unique_words) / 1000
        return min(complexity, 10)

    @lru_cache(maxsize=100)
    def cached_ai_call(self, model, prompt):
        start_time = time.time()
        try:
            if model == "o1":
                response = ai_ml_client.generate_response(prompt, "o1-preview", max_tokens=1500)
            else:
                response = self.vertex_model.predict(prompt, max_output_tokens=1500)
                response = response.text
            end_time = time.time()
            
            execution_time = end_time - start_time
            token_count = len(response.split())  # Rough estimate of token count
            
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "model": model,
                "execution_time": execution_time,
                "estimated_tokens": token_count,
                "prompt_length": len(prompt),
                "response_length": len(response),
                "status": "success"
            }
            self.performance_logs.append(log_entry)
            
            logger.info(f"AI Call - Model: {model}, Execution Time: {execution_time:.2f}s, Estimated Tokens: {token_count}")
            
            return response, execution_time, token_count
        except Exception as e:
            logger.error(f"AI Call Error - Model: {model}, Error: {str(e)}")
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "model": model,
                "status": "error",
                "error_message": str(e)
            }
            self.performance_logs.append(log_entry)
            raise

    def make_decision(self, context, force_model=None):
        self.current_task = "Making decision"
        self.last_action_timestamp = datetime.now()
        
        prompt = f"As an AI agent with the role of {self.role}, given the following context: {context}, what decision would you make or action would you take? Provide a detailed response with step-by-step reasoning."
        
        complexity = self.estimate_complexity(context)
        use_o1 = force_model == "o1" or (force_model is None and complexity > 5)

        model = "o1" if use_o1 else "vertex"
        response, execution_time, token_count = self.cached_ai_call(model, prompt)

        metrics = {
            "execution_time": execution_time,
            "token_count": token_count,
            "complexity": complexity,
            "prompt_length": len(prompt),
            "response_length": len(response)
        }

        self.current_task = None
        return response, model, metrics

    def execute_task(self, task, force_model=None):
        self.current_task = task
        self.last_action_timestamp = datetime.now()
        
        prompt = f"As an AI agent with the role of {self.role}, execute the following task: {task}. Provide the result or output of the task execution with detailed explanations."
        
        complexity = self.estimate_complexity(task)
        use_o1 = force_model == "o1" or (force_model is None and complexity > 5)

        model = "o1" if use_o1 else "vertex"
        response, execution_time, token_count = self.cached_ai_call(model, prompt)

        metrics = {
            "execution_time": execution_time,
            "token_count": token_count,
            "complexity": complexity,
            "prompt_length": len(prompt),
            "response_length": len(response)
        }

        self.current_task = None
        return response, model, metrics

    def get_performance_logs(self):
        return self.performance_logs

    def get_status(self):
        return {
            "role": self.role,
            "current_task": self.current_task,
            "last_action": self.last_action_timestamp.isoformat() if self.last_action_timestamp else None,
            "total_calls": len(self.performance_logs),
            "successful_calls": sum(1 for log in self.performance_logs if log.get("status") == "success"),
            "error_calls": sum(1 for log in self.performance_logs if log.get("status") == "error"),
            "average_execution_time": sum(log.get("execution_time", 0) for log in self.performance_logs) / len(self.performance_logs) if self.performance_logs else 0
        }

class AgentCoordinator:
    def __init__(self):
        self.agents = {
            "project_manager": AIAgent("project manager"),
            "web_developer": AIAgent("web developer"),
            "content_creator": AIAgent("content creator"),
            "designer": AIAgent("designer"),
            "seo_specialist": AIAgent("SEO specialist"),
            "monetization_expert": AIAgent("monetization expert")
        }
        self.project_state = {
            "website_type": None,
            "content_theme": None,
            "design_style": None,
            "monetization_strategy": None,
            "current_tasks": []
        }
        self.performance_logs = []

    def initialize_project(self):
        context = "We need to create a website that generates passive income. It should be unique, innovative, and showcase AI capabilities. Consider current trends and potential market gaps."
        
        decisions = {}
        for role, agent in self.agents.items():
            decision, model, metrics = agent.make_decision(context)
            decisions[role] = {"decision": decision, "model": model, "metrics": metrics}
            logger.info(f"{role.capitalize()} suggests (using {model}): {decision}")
            self.performance_logs.append({
                "timestamp": datetime.now().isoformat(),
                "agent": role,
                "action": "make_decision",
                "model": model,
                "metrics": metrics
            })

        aggregate_context = f"Individual agent decisions: {json.dumps(decisions, indent=2)}"
        final_decision, model, metrics = self.agents["project_manager"].make_decision(f"{context}\n\n{aggregate_context}\n\nBased on these inputs, make a final decision on the website type and initial project direction.")

        self.project_state["website_type"] = final_decision
        logger.info(f"Decided website type and direction (using {model}): {self.project_state['website_type']}")
        self.performance_logs.append({
            "timestamp": datetime.now().isoformat(),
            "agent": "project_manager",
            "action": "final_decision",
            "model": model,
            "metrics": metrics
        })

    def next_step(self):
        context = f"Current project state: {json.dumps(self.project_state, indent=2)}"
        task, model, metrics = self.agents["project_manager"].make_decision(f"Given the current project state, what should be the next task? Provide a specific, actionable task. {context}")
        logger.info(f"Next task (using {model}): {task}")
        self.performance_logs.append({
            "timestamp": datetime.now().isoformat(),
            "agent": "project_manager",
            "action": "next_step",
            "model": model,
            "metrics": metrics
        })

        responsible_agent_role = self._determine_responsible_agent(task)
        result, model, metrics = self.agents[responsible_agent_role].execute_task(task)
        logger.info(f"Task result from {responsible_agent_role} (using {model}): {result}")
        self.performance_logs.append({
            "timestamp": datetime.now().isoformat(),
            "agent": responsible_agent_role,
            "action": "execute_task",
            "model": model,
            "metrics": metrics
        })

        self.update_project_state(task, result)

    def _determine_responsible_agent(self, task):
        task_lower = task.lower()
        if "content" in task_lower:
            return "content_creator"
        elif "develop" in task_lower or "code" in task_lower:
            return "web_developer"
        elif "design" in task_lower:
            return "designer"
        elif "seo" in task_lower:
            return "seo_specialist"
        elif "monetize" in task_lower or "income" in task_lower:
            return "monetization_expert"
        else:
            return "project_manager"

    def update_project_state(self, task, result):
        task_lower = task.lower()
        if "content" in task_lower:
            self.project_state["content_theme"] = result
        elif "design" in task_lower:
            self.project_state["design_style"] = result
        elif "monetization" in task_lower:
            self.project_state["monetization_strategy"] = result
        
        self.project_state["current_tasks"].append({"task": task, "result": result})

    def get_performance_logs(self):
        all_logs = self.performance_logs.copy()
        for agent in self.agents.values():
            all_logs.extend(agent.get_performance_logs())
        return all_logs

    def get_aggregated_metrics(self):
        logs = self.get_performance_logs()
        aggregated_metrics = {
            "total_calls": len(logs),
            "o1_calls": sum(1 for log in logs if log.get("model") == "o1"),
            "vertex_calls": sum(1 for log in logs if log.get("model") == "vertex"),
            "average_execution_time": sum(log["metrics"]["execution_time"] for log in logs if "metrics" in log) / len(logs) if logs else 0,
            "total_tokens": sum(log["metrics"]["token_count"] for log in logs if "metrics" in log),
            "error_count": sum(1 for log in logs if log.get("status") == "error")
        }
        return aggregated_metrics

# Initialize the coordinator
coordinator = AgentCoordinator()