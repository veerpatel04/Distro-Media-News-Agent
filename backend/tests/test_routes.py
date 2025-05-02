"""
Test cases for the News Agent Flask routes
"""

import unittest
import json
from unittest.mock import patch, MagicMock

# Import Flask app and classes
from news_agent_python import app, NewsAgent, NewsAgentAPI

class TestFlaskRoutes(unittest.TestCase):
    """Test cases for the Flask routes"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.app = app.test_client()
        self.app.testing = True
    
    @patch('news_agent_python.get_user_session')
    def test_initialize_session_route(self, mock_get_user_session):
        """Test the initialize session endpoint"""
        # Mock the session and initialize method
        mock_session = MagicMock()
        mock_session.initialize.return_value = "Welcome to News Agent!"
        mock_get_user_session.return_value = mock_session
        
        # Test data
        data = {
            'userId': 'test-user',
            'preferences': {
                'favorite_topics': ['technology'],
                'favorite_publications': ['BBC'],
                'update_frequency': 'daily',
                'region': 'us'
            }
        }
        
        # Make the request
        response = self.app.post(
            '/api/initialize',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['message'], "Welcome to News Agent!")
        
        # Check that session methods were called correctly
        mock_get_user_session.assert_called_once_with('test-user')
        mock_session.initialize.assert_called_once_with(data['preferences'])
    
    @patch('news_agent_python.get_user_session')
    def test_process_request_route(self, mock_get_user_session):
        """Test the process request endpoint"""
        # Mock the session and process_request method
        mock_session = MagicMock()
        mock_session.process_request.return_value = "Here are the latest headlines"
        mock_get_user_session.return_value = mock_session
        
        # Test data
        data = {
            'userId': 'test-user',
            'userInput': 'Show me the latest news'
        }
        
        # Make the request
        response = self.app.post(
            '/api/request',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['response'], "Here are the latest headlines")
        
        # Check that session methods were called correctly
        mock_get_user_session.assert_called_once_with('test-user')
        mock_session.process_request.assert_called_once_with('Show me the latest news')
    
    @patch.object(NewsAgentAPI, 'get_top_headlines')
    def test_get_headlines_route(self, mock_get_headlines):
        """Test the headlines endpoint"""
        # Mock the headlines response
        mock_get_headlines.return_value = [
            {
                'title': 'Test Headline 1',
                'description': 'Test Description 1',
                'url': 'http://test.com/1',
                'imageUrl': 'http://test.com/image1.jpg',
                'source': 'Test Source',
                'publishedAt': '2023-05-01T12:00:00Z',
                'content': 'Test content 1'
            }
        ]
        
        # Make the request
        response = self.app.get('/api/headlines?country=us&category=technology')
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(len(response_data['headlines']), 1)
        self.assertEqual(response_data['headlines'][0]['title'], 'Test Headline 1')
        
        # Check that the API was called with correct parameters
        mock_get_headlines.assert_called_once_with('us', 'technology')
    
    @patch.object(NewsAgentAPI, 'get_from_publication')
    def test_get_from_publication_route(self, mock_get_from_publication):
        """Test the publication endpoint"""
        # Mock the publication response
        mock_get_from_publication.return_value = [
            {
                'title': 'WSJ Article 1',
                'description': 'WSJ Description 1',
                'url': 'http://wsj.com/1',
                'imageUrl': 'http://wsj.com/image1.jpg',
                'source': 'Wall Street Journal',
                'publishedAt': '2023-05-01T12:00:00Z'
            }
        ]
        
        # Make the request
        response = self.app.get('/api/publication/wsj')
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(len(response_data['articles']), 1)
        self.assertEqual(response_data['articles'][0]['title'], 'WSJ Article 1')
        
        # Check that the API was called with correct parameters
        mock_get_from_publication.assert_called_once_with('wsj')
    
    @patch.object(NewsAgentAPI, 'get_news_by_topic')
    def test_get_by_topic_route(self, mock_get_by_topic):
        """Test the topic endpoint"""
        # Mock the topic response
        mock_get_by_topic.return_value = [
            {
                'title': 'Tech Article 1',
                'description': 'Tech Description 1',
                'url': 'http://tech.com/1',
                'imageUrl': 'http://tech.com/image1.jpg',
                'source': 'Tech News',
                'publishedAt': '2023-05-01T12:00:00Z'
            }
        ]
        
        # Make the request
        response = self.app.get('/api/topic/technology?language=en')
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(len(response_data['articles']), 1)
        self.assertEqual(response_data['articles'][0]['title'], 'Tech Article 1')
        
        # Check that the API was called with correct parameters
        mock_get_by_topic.assert_called_once_with('technology', 'en')
    
    @patch('news_agent_python.get_user_session')
    def test_get_history_route(self, mock_get_user_session):
        """Test the get history endpoint"""
        # Mock the session and conversation history
        mock_session = MagicMock()
        mock_session.conversation_history = [
            {"role": "assistant", "content": "Welcome to News Agent!"},
            {"role": "user", "content": "Show me the latest news"},
            {"role": "assistant", "content": "Here are the latest headlines"}
        ]
        mock_get_user_session.return_value = mock_session
        
        # Make the request
        response = self.app.get('/api/history/test-user')
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(len(response_data['history']), 3)
        self.assertEqual(response_data['history'][1]['content'], "Show me the latest news")
        
        # Check that get_user_session was called correctly
        mock_get_user_session.assert_called_once_with('test-user')
    
    @patch('news_agent_python.get_user_session')
    def test_clear_history_route(self, mock_get_user_session):
        """Test the clear history endpoint"""
        # Mock the session
        mock_session = MagicMock()
        mock_session.conversation_history = [
            {"role": "assistant", "content": "Welcome to News Agent!"},
            {"role": "user", "content": "Show me the latest news"}
        ]
        mock_get_user_session.return_value = mock_session
        
        # Make the request
        response = self.app.delete('/api/history/test-user')
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['message'], "Conversation history cleared")
        
        # Check that the conversation history was cleared
        self.assertEqual(mock_session.conversation_history, [])
        
        # Check that get_user_session was called correctly
        mock_get_user_session.assert_called_once_with('test-user')
    
    @patch('news_agent_python.get_user_session')
    def test_update_preferences_route(self, mock_get_user_session):
        """Test the update preferences endpoint"""
        # Mock the session and update_user_preferences method
        mock_session = MagicMock()
        mock_session.update_user_preferences.return_value = "Your news preferences have been updated."
        mock_get_user_session.return_value = mock_session
        
        # Test data
        data = {
            'preferences': {
                'favorite_topics': ['business', 'politics'],
                'update_frequency': 'hourly'
            }
        }
        
        # Make the request
        response = self.app.post(
            '/api/preferences/test-user',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Parse the response
        response_data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['message'], "Your news preferences have been updated.")
        
        # Check that session methods were called correctly
        mock_get_user_session.assert_called_once_with('test-user')
        mock_session.update_user_preferences.assert_called_once_with(data['preferences'])

if __name__ == '__main__':
    unittest.main()