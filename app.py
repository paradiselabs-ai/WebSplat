from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
import os
import json
import base64
import logging
from google.cloud import aiplatform
from google.oauth2 import service_account
from ai_agents import AgentCoordinator

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set up credentials
credentials_base64 = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_BASE64')
if credentials_base64 is None:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable not set.")

try:
    credentials_json = base64.b64decode(credentials_base64).decode('utf-8')
    credentials_info = json.loads(credentials_json)
    credentials = service_account.Credentials.from_service_account_info(credentials_info)
    project_id = credentials_info.get('project_id')
    if not project_id:
        raise ValueError("Project ID not found in credentials JSON.")
except Exception as e:
    logger.error(f"Error decoding or parsing credentials: {str(e)}")
    raise

# Initialize AI Platform with credentials
aiplatform.init(project=project_id, location="us-central1", credentials=credentials)

app = Flask(__name__)

# Initialize AgentCoordinator
coordinator = AgentCoordinator()

@app.route('/')
def home():
    return render_template('index.html', project_state=coordinator.project_state)

@app.route('/initialize-project', methods=['POST'])
def initialize_project():
    try:
        coordinator.initialize_project()
        logger.info("Project initialized successfully")
        return jsonify({
            "success": True,
            "project_state": coordinator.project_state,
            "performance_logs": coordinator.get_performance_logs(),
            "aggregated_metrics": coordinator.get_aggregated_metrics()
        })
    except Exception as e:
        logger.error(f"Error initializing project: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/next-step', methods=['POST'])
def next_step():
    try:
        coordinator.next_step()
        logger.info("Next step executed successfully")
        return jsonify({
            "success": True,
            "project_state": coordinator.project_state,
            "performance_logs": coordinator.get_performance_logs(),
            "aggregated_metrics": coordinator.get_aggregated_metrics()
        })
    except Exception as e:
        logger.error(f"Error executing next step: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get-project-state')
def get_project_state():
    return jsonify({
        "success": True,
        "project_state": coordinator.project_state,
        "performance_logs": coordinator.get_performance_logs(),
        "aggregated_metrics": coordinator.get_aggregated_metrics()
    })

@app.route('/agent-action', methods=['POST'])
def agent_action():
    action = request.json.get('action')
    agent_role = request.json.get('agent_role')
    force_model = request.json.get('force_model')
    
    try:
        if action == 'make_decision':
            context = request.json.get('context', '')
            decision, model_used, metrics = coordinator.agents[agent_role].make_decision(context, force_model=force_model)
            logger.info(f"Decision made by {agent_role} using {model_used}")
            return jsonify({
                "success": True,
                "decision": decision,
                "model_used": model_used,
                "metrics": metrics,
                "performance_logs": coordinator.get_performance_logs(),
                "aggregated_metrics": coordinator.get_aggregated_metrics()
            })
        elif action == 'execute_task':
            task = request.json.get('task', '')
            result, model_used, metrics = coordinator.agents[agent_role].execute_task(task, force_model=force_model)
            logger.info(f"Task executed by {agent_role} using {model_used}")
            return jsonify({
                "success": True,
                "result": result,
                "model_used": model_used,
                "metrics": metrics,
                "performance_logs": coordinator.get_performance_logs(),
                "aggregated_metrics": coordinator.get_aggregated_metrics()
            })
        else:
            return jsonify({"success": False, "error": "Invalid action"}), 400
    except Exception as e:
        logger.error(f"Error in agent action: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/update-website', methods=['POST'])
def update_website():
    content = request.json.get('content', '')
    design = request.json.get('design', '')
    coordinator.project_state['content'] = content
    coordinator.project_state['design'] = design
    logger.info("Website state updated")
    return jsonify({
        "success": True,
        "status": "Website updated",
        "project_state": coordinator.project_state,
        "performance_logs": coordinator.get_performance_logs(),
        "aggregated_metrics": coordinator.get_aggregated_metrics()
    })

@app.route('/get-performance-logs')
def get_performance_logs():
    return jsonify({"success": True, "performance_logs": coordinator.get_performance_logs()})

@app.route('/get-aggregated-metrics')
def get_aggregated_metrics():
    return jsonify({"success": True, "aggregated_metrics": coordinator.get_aggregated_metrics()})

@app.route('/dashboard-data')
def dashboard_data():
    return jsonify({
        "success": True,
        "project_state": coordinator.project_state,
        "performance_logs": coordinator.get_performance_logs(),
        "aggregated_metrics": coordinator.get_aggregated_metrics()
    })

@app.route('/get-agent-statuses')
def get_agent_statuses():
    agent_statuses = {role: agent.get_status() for role, agent in coordinator.agents.items()}
    return jsonify({"success": True, "agent_statuses": agent_statuses})

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)