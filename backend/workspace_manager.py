import os
import shutil
import uuid
import logging

class WorkspaceManager:
    def __init__(self, base_path):
        self.base_path = base_path
        self.workspaces = {}
        if not os.path.exists(base_path):
            os.makedirs(base_path)
        logging.info(f"WorkspaceManager initialized with base path: {base_path}")

    def create_workspace(self):
        workspace_id = str(uuid.uuid4())
        workspace_path = os.path.join(self.base_path, workspace_id)
        os.makedirs(workspace_path, exist_ok=True)
        self.workspaces[workspace_id] = workspace_path
        logging.info(f"Created workspace: {workspace_id} at path: {workspace_path}")
        return workspace_id

    def get_workspace_path(self, workspace_id):
        workspace_path = self.workspaces.get(workspace_id)
        if not workspace_path:
            logging.warning(f"Workspace not found: {workspace_id}")
            logging.debug(f"Current workspaces: {self.workspaces}")
        else:
            logging.info(f"Retrieved workspace path: {workspace_path} for workspace_id: {workspace_id}")
        return workspace_path

    def delete_workspace(self, workspace_id):
        workspace_path = self.workspaces.pop(workspace_id, None)
        if workspace_path and os.path.exists(workspace_path):
            shutil.rmtree(workspace_path)
            logging.info(f"Deleted workspace: {workspace_id} at path: {workspace_path}")
        else:
            logging.warning(f"Failed to delete workspace: {workspace_id}")

    def write_file(self, workspace_id, file_name, content):
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            file_path = os.path.join(workspace_path, file_name)
            with open(file_path, 'w') as f:
                f.write(content)
            logging.info(f"Wrote file: {file_path}")
        else:
            logging.error(f"Failed to write file: workspace {workspace_id} not found")

    def read_file(self, workspace_id, file_name):
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            file_path = os.path.join(workspace_path, file_name)
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    content = f.read()
                logging.info(f"Read file: {file_path}")
                return content
            else:
                logging.warning(f"File not found: {file_path}")
        else:
            logging.error(f"Failed to read file: workspace {workspace_id} not found")
        return None

    def list_files(self, workspace_id):
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            files = os.listdir(workspace_path)
            logging.info(f"Listed files for workspace {workspace_id}: {files}")
            return files
        logging.warning(f"Failed to list files: workspace {workspace_id} not found")
        return []

    def get_file_path(self, workspace_id, file_name):
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            file_path = os.path.join(workspace_path, file_name)
            if os.path.exists(file_path):
                logging.info(f"File path found: {file_path}")
                return file_path
            else:
                logging.warning(f"File not found: {file_path}")
        else:
            logging.error(f"Failed to get file path: workspace {workspace_id} not found")
        return None
