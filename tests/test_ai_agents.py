import unittest
from unittest.mock import patch, MagicMock
from ai_agents import AIAgent, AgentCoordinator

class TestAIAgent(unittest.TestCase):
    def setUp(self):
        self.agent = AIAgent("test_agent")

    def test_estimate_complexity(self):
        simple_text = "This is a simple text."
        complex_text = "This is a more complex text with many unique words and concepts to analyze."
        
        simple_complexity = self.agent.estimate_complexity(simple_text)
        complex_complexity = self.agent.estimate_complexity(complex_text)
        
        self.assertLess(simple_complexity, complex_complexity)
        self.assertLessEqual(complex_complexity, 10)  # Max complexity is 10

    @patch('ai_agents.ai_ml_client')
    @patch('ai_agents.TextGenerationModel')
    def test_cached_ai_call(self, mock_vertex_model, mock_ai_ml_client):
        mock_ai_ml_client.generate_response.return_value = "o1 response"
        mock_vertex_model.return_value.predict.return_value.text = "vertex response"

        # Test o1 model
        response, _, _ = self.agent.cached_ai_call("o1", "test prompt")
        self.assertEqual(response, "o1 response")
        mock_ai_ml_client.generate_response.assert_called_once()

        # Test vertex model
        response, _, _ = self.agent.cached_ai_call("vertex", "test prompt")
        self.assertEqual(response, "vertex response")
        mock_vertex_model.return_value.predict.assert_called_once()

    @patch.object(AIAgent, 'cached_ai_call')
    def test_make_decision(self, mock_cached_ai_call):
        mock_cached_ai_call.return_value = ("decision", 1.0, 100)
        decision, model, metrics = self.agent.make_decision("test context")
        self.assertEqual(decision, "decision")
        self.assertIn(model, ["o1", "vertex"])
        self.assertIn("execution_time", metrics)
        self.assertIn("token_count", metrics)
        self.assertIn("complexity", metrics)

class TestAgentCoordinator(unittest.TestCase):
    def setUp(self):
        self.coordinator = AgentCoordinator()

    @patch.object(AIAgent, 'make_decision')
    @patch.object(AIAgent, 'execute_task')
    def test_initialize_project(self, mock_execute_task, mock_make_decision):
        mock_make_decision.return_value = ("decision", "o1", {"execution_time": 1.0, "token_count": 100, "complexity": 5})
        mock_execute_task.return_value = ("result", "vertex", {"execution_time": 1.0, "token_count": 100, "complexity": 5})

        self.coordinator.initialize_project()

        self.assertIsNotNone(self.coordinator.project_state["website_type"])
        self.assertGreater(len(self.coordinator.performance_logs), 0)

    def test_determine_responsible_agent(self):
        self.assertEqual(self.coordinator._determine_responsible_agent("create content"), "content_creator")
        self.assertEqual(self.coordinator._determine_responsible_agent("develop feature"), "web_developer")
        self.assertEqual(self.coordinator._determine_responsible_agent("design layout"), "designer")
        self.assertEqual(self.coordinator._determine_responsible_agent("optimize SEO"), "seo_specialist")
        self.assertEqual(self.coordinator._determine_responsible_agent("monetize website"), "monetization_expert")
        self.assertEqual(self.coordinator._determine_responsible_agent("manage project"), "project_manager")

if __name__ == '__main__':
    unittest.main()