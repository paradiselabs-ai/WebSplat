import unittest
from unittest.mock import patch, MagicMock
from app import app
import json

class TestApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_home_route(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'WebDevML', response.data)

    @patch('app.coordinator')
    def test_initialize_project(self, mock_coordinator):
        mock_coordinator.initialize_project.return_value = None
        mock_coordinator.project_state = {"test": "state"}
        mock_coordinator.get_performance_logs.return_value = [{"test": "log"}]
        mock_coordinator.get_aggregated_metrics.return_value = {"test": "metrics"}

        response = self.app.post('/initialize-project')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('project_state', data)
        self.assertIn('performance_logs', data)
        self.assertIn('aggregated_metrics', data)

    @patch('app.coordinator')
    def test_next_step(self, mock_coordinator):
        mock_coordinator.next_step.return_value = None
        mock_coordinator.project_state = {"test": "state"}
        mock_coordinator.get_performance_logs.return_value = [{"test": "log"}]
        mock_coordinator.get_aggregated_metrics.return_value = {"test": "metrics"}

        response = self.app.post('/next-step')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('project_state', data)
        self.assertIn('performance_logs', data)
        self.assertIn('aggregated_metrics', data)

    @patch('app.coordinator')
    def test_get_project_state(self, mock_coordinator):
        mock_coordinator.project_state = {"test": "state"}
        mock_coordinator.get_performance_logs.return_value = [{"test": "log"}]
        mock_coordinator.get_aggregated_metrics.return_value = {"test": "metrics"}

        response = self.app.get('/get-project-state')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('project_state', data)
        self.assertIn('performance_logs', data)
        self.assertIn('aggregated_metrics', data)

    @patch('app.coordinator')
    def test_agent_action(self, mock_coordinator):
        mock_agent = MagicMock()
        mock_agent.make_decision.return_value = ("decision", "o1", {"test": "metrics"})
        mock_coordinator.agents = {"test_agent": mock_agent}
        mock_coordinator.get_performance_logs.return_value = [{"test": "log"}]

        response = self.app.post('/agent-action', json={
            "action": "make_decision",
            "agent_role": "test_agent",
            "context": "test context",
            "force_model": None
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('decision', data)
        self.assertIn('model_used', data)
        self.assertIn('metrics', data)
        self.assertIn('performance_logs', data)

    @patch('app.coordinator')
    def test_update_website(self, mock_coordinator):
        mock_coordinator.project_state = {}
        mock_coordinator.get_performance_logs.return_value = [{"test": "log"}]

        response = self.app.post('/update-website', json={
            "content": "test content",
            "design": "test design"
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('status', data)
        self.assertIn('project_state', data)
        self.assertIn('performance_logs', data)

    @patch('app.coordinator')
    def test_get_performance_logs(self, mock_coordinator):
        mock_coordinator.get_performance_logs.return_value = [{"test": "log"}]

        response = self.app.get('/get-performance-logs')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertIn('test', data[0])

    @patch('app.coordinator')
    def test_get_aggregated_metrics(self, mock_coordinator):
        mock_coordinator.get_aggregated_metrics.return_value = {"test": "metrics"}

        response = self.app.get('/get-aggregated-metrics')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, dict)
        self.assertIn('test', data)

    @patch('app.coordinator')
    def test_dashboard_data(self, mock_coordinator):
        mock_coordinator.project_state = {"test": "state"}
        mock_coordinator.get_performance_logs.return_value = [{"test": "log"}]
        mock_coordinator.get_aggregated_metrics.return_value = {"test": "metrics"}

        response = self.app.get('/dashboard-data')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('project_state', data)
        self.assertIn('performance_logs', data)
        self.assertIn('aggregated_metrics', data)

if __name__ == '__main__':
    unittest.main()