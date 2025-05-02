"""
Test cases for the News Agent Python Backend
"""

import unittest
import json
import os
from unittest.mock import patch, MagicMock
from dotenv import load_dotenv

# Load environment variables for testing
load_dotenv()

# Import the Flask app and classes
from news_agent_python import app, NewsAgent, NewsAgentAPI


class TestNewsAgent(unittest.TestCase):
    """Test cases for the NewsAgent class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.agent = NewsAgent()
    
    @patch.object(NewsAgentAPI, 'get_top_headlines')
    async def test_initialize(self, mock_get_headlines):
        """Test agent initialization"""
        # Mock the headlines response
        mock_get_headlines.return_value = [
            {'title': 'Test Headline 1'},
            {'title': 'Test Headline 2'},
            {'title': 'Test Headline 3'}
        ]
        
        # Initialize with preferences
        preferences = {
            'favorite_topics': ['tech', 'science'],
            'region': 'us'
        }
        
        result = await self.agent.initialize(preferences)
        
        # Check if preferences were updated
        self.assertEqual(self.agent.user_preferences['favorite_topics'], ['tech', 'science'])
        self.assertEqual(self.agent.user_preferences['region'], 'us')
        
        # Check if headlines were included in the response
        self.assertIn('Test Headline 1', result)
        self.assertIn('Test Headline 2', result)
        self.assertIn('Test Headline 3', result)
        
        # Check that headlines were requested
        mock_get_headlines.assert_called_once()
    
    def test_detect_intent(self):
        """Test intent detection"""
        # Test headline intent
        intent = self.agent.detect_intent("Show me the latest headlines")
        self.assertEqual(intent['type'], 'fetch_headlines')
        
        # Test publication intent
        intent = self.agent.detect_intent("What's new in the Wall Street Journal?")
        self.assertEqual(intent['type'], 'fetch_specific_publication')
        self.assertEqual(intent['publication'], 'wall street journal')
        
        # Test topic intent
        intent = self.agent.detect_intent("Tell me about technology news")
        self.assertEqual(intent['type'], 'fetch_topic')
        self.assertEqual(intent['topic'], 'technology')
        
        # Test specific event intent
        intent = self.agent.detect_intent("What's happening with Ukraine?")
        self.assertEqual(intent['type'], 'fetch_topic')
        self.assertEqual(intent['topic'], 'ukraine')
        
        # Test preferences intent
        intent = self.agent.detect_intent("Update my preferences")
        self.assertEqual(intent['type'], 'update_preferences')
        
        # Test default discussion intent
        intent = self.agent.detect_intent("What do you think about the economy?")
        self.assertEqual(intent['type'], 'discussion')
    
    def test_update_user_preferences(self):
        """Test updating user preferences"""
        # Initial preferences
        self.assertEqual(self.agent.user_preferences['update_frequency'], 'daily')
        
        # Update preferences
        new_prefs = {
            'update_frequency': 'hourly',
            'favorite_topics': ['sports', 'business']
        }
        
        result = self.agent.update_user_preferences(new_prefs)
        
        # Check if preferences were updated
        self.assertEqual(self.agent.user_preferences['update_frequency'], 'hourly')
        self.assertEqual(self.agent.user_preferences['favorite_topics'], ['sports', 'business'])
        
        # Check that other preferences remain unchanged
        self.assertEqual(self.agent.user_preferences['region'], 'global')


class TestNewsAgentAPI(unittest.TestCase):
    """Test cases for the NewsAgentAPI class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.api = NewsAgentAPI()
    
    @patch('requests.get')
    def test_get_top_headlines(self, mock_get):
        """Test fetching top headlines"""
        # Mock the API response
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            'status': 'ok',
            'articles': [
                {
                    'title': 'Test Headline 1',
                    'description': 'Test Description 1',
                    'url': 'http://test.com/1',
                    'urlToImage': 'http://test.com/image1.jpg',
                    'source': {'name': 'Test Source'},
                    'publishedAt': '2023-05-01T12:00:00Z',
                    'content': 'Test content 1'
                },
                {
                    'title': 'Test Headline 2',
                    'description': 'Test Description 2',
                    'url': 'http://test.com/2',
                    'urlToImage': 'http://test.com/image2.jpg',
                    'source': {'name': 'Test Source 2'},
                    'publishedAt': '2023-05-01T13:00:00Z',
                    'content': 'Test content 2'
                }
            ]
        }
        mock_get.return_value = mock_response
        
        # Call the method
        headlines = self.api.get_top_headlines('us', 'technology')
        
        # Check the results
        self.assertEqual(len(headlines), 2)
        self.assertEqual(headlines[0]['title'], 'Test Headline 1')
        self.assertEqual(headlines[1]['title'], 'Test Headline 2')
        
        # Check that the API was called with correct parameters
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        self.assertEqual(args[0], 'https://newsapi.org/v2/top-headlines')
        self.assertEqual(kwargs['params']['country'], 'us')
        self.assertEqual(kwargs['params']['category'], 'technology')
    
    def test_map_publication_to_news_api_source(self):
        """Test mapping publication names to NewsAPI source IDs"""
        self.assertEqual(self.api.map_publication_to_news_api_source('Wall Street Journal'), 'the-wall-street-journal')
        self.assertEqual(self.api.map_publication_to_news_api_source('wsj'), 'the-wall-street-journal')
        self.assertEqual(self.api.map_publication_to_news_api_source('bbc'), 'bbc-news')
        self.assertEqual(self.api.map_publication_to_news_api_source('unknown publication'), 'unknown publication')


class TestFlaskRoutes(unittest.TestCase):
    """Test cases for the Flask routes"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.app = app.test_client()
        self.app.testing = True
    
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
        data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['headlines']), 1)
        self.assertEqual(data['headlines'][0]['title'], 'Test Headline 1')
        
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
        data = json.loads(response.data)
        
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['articles']), 1)
        self.assertEqual(data['articles'][0]['title'], 'WSJ Article 1')
        
        # Check that the API was called with correct parameters
        mock_get_from_publication.assert_called_once_with('wsj')


if __name__ == '__main__':
    unittest.main()