import os
import shutil
import uuid
import logging
import json
import time
import threading
import fcntl
import errno
from typing import Dict, Optional, Any, List
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from abc import ABC, abstractmethod

# Storage Provider Interface for future cloud integration
class StorageProvider(ABC):
    @abstractmethod
    def save(self, path: str, content: Any) -> bool:
        pass

    @abstractmethod
    def load(self, path: str) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, path: str) -> bool:
        pass

class LocalStorageProvider(StorageProvider):
    def save(self, path: str, content: Any) -> bool:
        try:
            with open(path, 'w') as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                if isinstance(content, (dict, list)):
                    json.dump(content, f)
                else:
                    f.write(str(content))
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
            return True
        except Exception as e:
            logging.error(f"Failed to save to {path}: {e}")
            return False

    def load(self, path: str) -> Optional[Any]:
        try:
            with open(path, 'r') as f:
                fcntl.flock(f.fileno(), fcntl.LOCK_SH)
                try:
                    content = json.load(f)
                except json.JSONDecodeError:
                    f.seek(0)
                    content = f.read()
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
            return content
        except Exception as e:
            logging.error(f"Failed to load from {path}: {e}")
            return None

    def delete(self, path: str) -> bool:
        try:
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
            return True
        except Exception as e:
            logging.error(f"Failed to delete {path}: {e}")
            return False

@dataclass
class WorkspaceMetadata:
    workspace_id: str
    created_at: float
    last_accessed: float
    status: str  # 'active', 'inactive', 'error'
    shared_knowledge: Dict[str, Any]
    files: Dict[str, str]  # filename -> last_modified timestamp
    expiration: Optional[float] = None
    error_count: int = 0
    recovery_attempts: int = 0
    cloud_synced: bool = False
    version: str = "1.0.0"

    def to_dict(self) -> dict:
        return asdict(self)

    def update_access(self):
        self.last_accessed = time.time()

    def is_expired(self) -> bool:
        if self.expiration is None:
            return False
        return time.time() > self.expiration

    def increment_error(self):
        self.error_count += 1
        if self.error_count > 3:
            self.status = 'error'

    def reset_errors(self):
        self.error_count = 0
        if self.status == 'error':
            self.status = 'active'

class WorkspaceManager:
    def __init__(self, base_path: str, cleanup_interval: int = 3600):
        self.base_path = base_path
        self.workspaces: Dict[str, str] = {}  # workspace_id -> path
        self.metadata: Dict[str, WorkspaceMetadata] = {}  # workspace_id -> metadata
        self.storage = LocalStorageProvider()
        self.cleanup_interval = cleanup_interval
        self._lock = threading.Lock()
        
        if not os.path.exists(base_path):
            os.makedirs(base_path)
        
        # Load existing workspaces
        self._load_existing_workspaces()
        
        # Start cleanup thread
        self._start_cleanup_thread()
        
        logging.info(f"WorkspaceManager initialized with base path: {base_path}")

    def _start_cleanup_thread(self):
        """Start the background cleanup thread."""
        def cleanup_task():
            while True:
                try:
                    self.cleanup_expired_workspaces()
                except Exception as e:
                    logging.error(f"Cleanup task error: {e}")
                time.sleep(self.cleanup_interval)

        cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
        cleanup_thread.start()

    def _load_existing_workspaces(self):
        """Load existing workspaces from disk and initialize metadata."""
        if os.path.exists(self.base_path):
            for workspace_id in os.listdir(self.base_path):
                workspace_path = os.path.join(self.base_path, workspace_id)
                if os.path.isdir(workspace_path):
                    # Check if workspace has any files before loading
                    files = [f for f in os.listdir(workspace_path) if f != 'metadata.json']
                    if files:  # Only load workspaces with actual files
                        self.workspaces[workspace_id] = workspace_path
                        self._load_or_create_metadata(workspace_id)
                    else:
                        # Clean up empty workspace
                        try:
                            shutil.rmtree(workspace_path)
                            logging.info(f"Cleaned up empty workspace: {workspace_id}")
                        except Exception as e:
                            logging.error(f"Failed to clean up empty workspace {workspace_id}: {e}")

    def _load_or_create_metadata(self, workspace_id: str):
        """Load existing metadata or create new metadata for a workspace."""
        metadata_path = os.path.join(self.workspaces[workspace_id], 'metadata.json')
        try:
            data = self.storage.load(metadata_path)
            if data:
                self.metadata[workspace_id] = WorkspaceMetadata(**data)
                # Version migration if needed
                if self.metadata[workspace_id].version != "1.0.0":
                    self._migrate_metadata(workspace_id)
            else:
                # Check workspace contents before creating metadata
                workspace_path = self.workspaces[workspace_id]
                files = [f for f in os.listdir(workspace_path) if f != 'metadata.json']
                if files:
                    # Create metadata for workspace with files
                    self._create_metadata(workspace_id)
                    # Update files in metadata
                    for file_name in files:
                        file_path = os.path.join(workspace_path, file_name)
                        if os.path.exists(file_path):
                            self.metadata[workspace_id].files[file_name] = os.path.getmtime(file_path)
                    self._save_metadata(workspace_id)
                else:
                    # Clean up empty workspace
                    self.delete_workspace(workspace_id)
        except Exception as e:
            logging.error(f"Failed to load metadata for workspace {workspace_id}: {e}")
            self._create_metadata(workspace_id)

    def _create_metadata(self, workspace_id: str):
        """Create new metadata for a workspace."""
        current_time = time.time()
        self.metadata[workspace_id] = WorkspaceMetadata(
            workspace_id=workspace_id,
            created_at=current_time,
            last_accessed=current_time,
            status='active',
            shared_knowledge={},
            files={},
            expiration=current_time + timedelta(days=7).total_seconds()
        )
        self._save_metadata(workspace_id)

    def _save_metadata(self, workspace_id: str):
        """Save metadata to disk with proper locking."""
        if workspace_id in self.metadata and workspace_id in self.workspaces:
            metadata_path = os.path.join(self.workspaces[workspace_id], 'metadata.json')
            with self._lock:
                self.storage.save(metadata_path, self.metadata[workspace_id].to_dict())

    def _migrate_metadata(self, workspace_id: str):
        """Migrate metadata to latest version."""
        metadata = self.metadata[workspace_id]
        # Add any migration logic here
        metadata.version = "1.0.0"
        self._save_metadata(workspace_id)

    def create_workspace(self) -> str:
        """Create a new workspace with atomic operations."""
        workspace_id = str(uuid.uuid4())
        workspace_path = os.path.join(self.base_path, workspace_id)
        
        with self._lock:
            try:
                os.makedirs(workspace_path, exist_ok=True)
                self.workspaces[workspace_id] = workspace_path
                self._create_metadata(workspace_id)
                logging.info(f"Created workspace: {workspace_id} at path: {workspace_path}")
                return workspace_id
            except Exception as e:
                logging.error(f"Failed to create workspace: {e}")
                if os.path.exists(workspace_path):
                    shutil.rmtree(workspace_path)
                if workspace_id in self.workspaces:
                    del self.workspaces[workspace_id]
                if workspace_id in self.metadata:
                    del self.metadata[workspace_id]
                raise

    def get_workspace_path(self, workspace_id: str) -> Optional[str]:
        """Get workspace path and update access time."""
        if workspace_id in self.workspaces:
            if workspace_id in self.metadata:
                self.metadata[workspace_id].update_access()
                self._save_metadata(workspace_id)
            workspace_path = self.workspaces.get(workspace_id)
            logging.info(f"Retrieved workspace path: {workspace_path} for workspace_id: {workspace_id}")
            return workspace_path
        
        logging.warning(f"Workspace not found: {workspace_id}")
        return None

    def delete_workspace(self, workspace_id: str):
        """Delete workspace with proper cleanup."""
        with self._lock:
            workspace_path = self.workspaces.pop(workspace_id, None)
            if workspace_path and os.path.exists(workspace_path):
                try:
                    self.storage.delete(workspace_path)
                    if workspace_id in self.metadata:
                        del self.metadata[workspace_id]
                    logging.info(f"Deleted workspace: {workspace_id}")
                except Exception as e:
                    logging.error(f"Failed to delete workspace {workspace_id}: {e}")
                    # Restore workspace entry if deletion failed
                    self.workspaces[workspace_id] = workspace_path
            else:
                logging.warning(f"Failed to delete workspace: {workspace_id}")

    def write_file(self, workspace_id: str, file_name: str, content: str):
        """Write file with atomic operations."""
        workspace_path = self.get_workspace_path(workspace_id)
        if not workspace_path:
            logging.error(f"Failed to write file: workspace {workspace_id} not found")
            return

        file_path = os.path.join(workspace_path, file_name)
        temp_path = f"{file_path}.tmp"

        try:
            # Write to temporary file first
            self.storage.save(temp_path, content)
            # Atomic rename
            os.replace(temp_path, file_path)
            
            # Update metadata
            if workspace_id in self.metadata:
                self.metadata[workspace_id].files[file_name] = time.time()
                self._save_metadata(workspace_id)
            
            logging.info(f"Wrote file: {file_path}")
        except Exception as e:
            logging.error(f"Failed to write file {file_path}: {e}")
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise

    def read_file(self, workspace_id: str, file_name: str) -> Optional[str]:
        """Read file with proper error handling."""
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            file_path = os.path.join(workspace_path, file_name)
            content = self.storage.load(file_path)
            if content is not None:
                logging.info(f"Read file: {file_path}")
                return content
            logging.warning(f"File not found: {file_path}")
        else:
            logging.error(f"Failed to read file: workspace {workspace_id} not found")
        return None

    def list_files(self, workspace_id: str) -> List[str]:
        """List files excluding metadata."""
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            try:
                files = [f for f in os.listdir(workspace_path) if f != 'metadata.json']
                logging.info(f"Listed files for workspace {workspace_id}: {files}")
                return files
            except Exception as e:
                logging.error(f"Failed to list files for workspace {workspace_id}: {e}")
        logging.warning(f"Failed to list files: workspace {workspace_id} not found")
        return []

    def get_file_path(self, workspace_id: str, file_name: str) -> Optional[str]:
        """Get file path with validation."""
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            file_path = os.path.join(workspace_path, file_name)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                logging.info(f"File path found: {file_path}")
                return file_path
            logging.warning(f"File not found: {file_path}")
        else:
            logging.error(f"Failed to get file path: workspace {workspace_id} not found")
        return None

    def update_shared_knowledge(self, workspace_id: str, category: str, knowledge: Any):
        """Update shared knowledge with proper locking."""
        with self._lock:
            if workspace_id in self.metadata:
                if category not in self.metadata[workspace_id].shared_knowledge:
                    self.metadata[workspace_id].shared_knowledge[category] = []
                self.metadata[workspace_id].shared_knowledge[category].append(knowledge)
                self._save_metadata(workspace_id)
                logging.info(f"Updated shared knowledge for workspace {workspace_id}")

    def get_shared_knowledge(self, workspace_id: str) -> Dict[str, Any]:
        """Get shared knowledge safely."""
        if workspace_id in self.metadata:
            return dict(self.metadata[workspace_id].shared_knowledge)  # Return a copy
        return {}

    def cleanup_expired_workspaces(self):
        """Clean up expired workspaces safely."""
        with self._lock:
            current_time = time.time()
            expired_workspaces = [
                workspace_id for workspace_id, metadata in self.metadata.items()
                if metadata.is_expired()
            ]
            for workspace_id in expired_workspaces:
                self.delete_workspace(workspace_id)
                logging.info(f"Cleaned up expired workspace: {workspace_id}")

    def get_workspace_status(self, workspace_id: str) -> Optional[str]:
        """Get workspace status."""
        if workspace_id in self.metadata:
            return self.metadata[workspace_id].status
        return None

    def set_workspace_status(self, workspace_id: str, status: str):
        """Set workspace status safely."""
        with self._lock:
            if workspace_id in self.metadata:
                self.metadata[workspace_id].status = status
                self._save_metadata(workspace_id)
                logging.info(f"Set workspace {workspace_id} status to {status}")

    def extend_workspace_expiration(self, workspace_id: str, days: int = 7):
        """Extend workspace expiration safely."""
        with self._lock:
            if workspace_id in self.metadata:
                self.metadata[workspace_id].expiration = time.time() + timedelta(days=days).total_seconds()
                self._save_metadata(workspace_id)
                logging.info(f"Extended workspace {workspace_id} expiration by {days} days")

    def prepare_for_cloud_migration(self, workspace_id: str) -> Dict[str, Any]:
        """Prepare workspace data for cloud migration."""
        if workspace_id not in self.metadata:
            return {}
        
        workspace_data = {
            'metadata': self.metadata[workspace_id].to_dict(),
            'files': {}
        }
        
        workspace_path = self.get_workspace_path(workspace_id)
        if workspace_path:
            for file_name in self.list_files(workspace_id):
                content = self.read_file(workspace_id, file_name)
                if content is not None:
                    workspace_data['files'][file_name] = content
        
        return workspace_data
