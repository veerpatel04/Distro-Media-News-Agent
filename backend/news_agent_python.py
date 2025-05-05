"""
News Agent Backend - Python Implementation
A conversational AI that fetches news and discusses current events
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import requests
import json
import time
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
import openai
from dotenv import load_dotenv
import secrets

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
secret_key = os.getenv('FLASK_SECRET_KEY')
if not secret_key:
    secret_key = secrets.token_hex(32)
    print('WARNING: FLASK_SECRET_KEY not set in .env, using a random secret key for this session.')
app.secret_key = secret_key
CORS(app)  # Enable CORS for all routes

# API Keys
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
NYT_API_KEY = os.getenv('NYT_API_KEY')
GUARDIAN_API_KEY = os.getenv('GUARDIAN_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Configure OpenAI
openai.api_key = OPENAI_API_KEY

# Secret key for session management
SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(24).hex())
app.secret_key = SECRET_KEY


class NewsAgentAPI:
    """
    Handles integration with various news APIs and AI services
    """
    
    def __init__(self):
        self.news_api_key = NEWS_API_KEY
        self.nyt_api_key = NYT_API_KEY
        self.guardian_api_key = GUARDIAN_API_KEY
        
        # Cache for storing recent news results
        self.cache = {
            'headlines': {},
            'topics': {},
            'publications': {}
        }
        
        # Cache duration in seconds (30 minutes)
        self.cache_duration = 30 * 60
    
    def get_top_headlines(self, country: str = 'us', category: str = '') -> List[Dict]:
        """
        Get top headlines from multiple sources
        
        Args:
            country: Country code (e.g., 'us', 'gb')
            category: News category (e.g., 'business', 'technology')
            
        Returns:
            List of headline articles
        """
        now = time.time()
        
        # Check cache first
        cache_key = f"{country}-{category}"
        if (cache_key in self.cache['headlines'] and 
            now - self.cache['headlines'][cache_key]['timestamp'] < self.cache_duration):
            return self.cache['headlines'][cache_key]['data']
        
        try:
            # NewsAPI request
            if self.news_api_key:
                logger.info(f"Fetching headlines from NewsAPI for country={country}, category={category}")
                news_api_url = 'https://newsapi.org/v2/top-headlines'
                params = {
                    'apiKey': self.news_api_key,
                    'country': country
                }
                
                if category:
                    params['category'] = category
                    
                response = requests.get(news_api_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Transform the response data
                headlines = [
                    {
                        'title': article.get('title'),
                        'description': article.get('description'),
                        'url': article.get('url'),
                        'imageUrl': article.get('urlToImage'),
                        'source': article.get('source', {}).get('name'),
                        'publishedAt': article.get('publishedAt'),
                        'content': article.get('content')
                    }
                    for article in data.get('articles', [])
                ]
            # NYT Top Stories API as fallback
            elif self.nyt_api_key:
                logger.info(f"Fetching headlines from NYT Top Stories API for section={category or 'home'}")
                # Map category to NYT section
                nyt_section = self._map_category_to_nyt_section(category) if category else 'home'
                headlines = self.fetch_from_nyt_top_stories(nyt_section)
            else:
                logger.error("No API keys available for fetching headlines")
                return []
            
            # Update cache
            self.cache['headlines'][cache_key] = {
                'timestamp': now,
                'data': headlines
            }
            
            return headlines
        except Exception as e:
            logger.error(f"Error fetching top headlines: {e}")
            raise Exception(f"Failed to fetch headlines: {str(e)}")
    
    def get_from_publication(self, publication: str) -> List[Dict]:
        """
        Get news from a specific publication
        
        Args:
            publication: Name of the publication
            
        Returns:
            List of articles from the publication
        """
        now = time.time()
        pub_lower = publication.lower()
        
        # Check cache first
        if (pub_lower in self.cache['publications'] and 
            now - self.cache['publications'][pub_lower]['timestamp'] < self.cache_duration):
            return self.cache['publications'][pub_lower]['data']
        
        try:
            articles = []
            
            # Publication-specific API handling
            if pub_lower in ['new york times', 'nyt']:
                logger.info("Fetching from NYT API")
                articles = self.fetch_from_nyt()
            elif pub_lower in ['the guardian', 'guardian']:
                logger.info("Fetching from Guardian API")
                articles = self.fetch_from_guardian()
            else:
                # Default to NewsAPI for other publications
                logger.info(f"Searching news from {publication} using NewsAPI")
                articles = self.search_news_by_source(publication)
            
            # Update cache
            self.cache['publications'][pub_lower] = {
                'timestamp': now,
                'data': articles
            }
            
            return articles
        except Exception as e:
            logger.error(f"Error fetching news from {publication}: {e}")
            raise Exception(f"Failed to fetch news from {publication}")
    
    def get_news_by_topic(self, topic: str, language: str = 'en') -> List[Dict]:
        """
        Get news by topic
        
        Args:
            topic: Topic to search for
            language: Language code
            
        Returns:
            List of articles related to the topic
        """
        now = time.time()
        topic_lower = topic.lower()
        
        # Check cache first
        if (topic_lower in self.cache['topics'] and 
            now - self.cache['topics'][topic_lower]['timestamp'] < self.cache_duration):
            return self.cache['topics'][topic_lower]['data']
        
        try:
            articles = []
            
            # Try NewsAPI first
            if self.news_api_key:
                logger.info(f"Searching for topic '{topic}' using NewsAPI")
                # NewsAPI request for topic search
                news_api_url = 'https://newsapi.org/v2/everything'
                params = {
                    'apiKey': self.news_api_key,
                    'q': topic,
                    'language': language,
                    'sortBy': 'relevancy'
                }
                
                response = requests.get(news_api_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                articles = [
                    {
                        'title': article.get('title'),
                        'description': article.get('description'),
                        'url': article.get('url'),
                        'imageUrl': article.get('urlToImage'),
                        'source': article.get('source', {}).get('name'),
                        'publishedAt': article.get('publishedAt'),
                        'content': article.get('content')
                    }
                    for article in data.get('articles', [])
                ]
            # NYT Article Search API as fallback
            elif self.nyt_api_key:
                logger.info(f"Searching for topic '{topic}' using NYT Article Search API")
                articles = self.search_nyt_articles(topic)
            else:
                logger.error("No API keys available for topic search")
                return []
            
            # Update cache
            self.cache['topics'][topic_lower] = {
                'timestamp': now,
                'data': articles
            }
            
            return articles
        except Exception as e:
            logger.error(f"Error fetching news about {topic}: {e}")
            raise Exception(f"Failed to fetch news about {topic}")
    
    def search_news_by_source(self, source: str) -> List[Dict]:
        """
        Search news by source
        
        Args:
            source: News source name
            
        Returns:
            List of articles from the source
        """
        try:
            if self.news_api_key:
                news_api_url = 'https://newsapi.org/v2/everything'
                params = {
                    'apiKey': self.news_api_key,
                    'sources': self.map_publication_to_news_api_source(source)
                }
                
                response = requests.get(news_api_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                return [
                    {
                        'title': article.get('title'),
                        'description': article.get('description'),
                        'url': article.get('url'),
                        'imageUrl': article.get('urlToImage'),
                        'source': article.get('source', {}).get('name'),
                        'publishedAt': article.get('publishedAt'),
                        'content': article.get('content')
                    }
                    for article in data.get('articles', [])
                ]
            else:
                logger.warning("NewsAPI key not available, cannot search by source")
                return []
        except Exception as e:
            logger.error(f"Error searching news from {source}: {e}")
            raise Exception(f"Failed to search news from {source}")
    
    @staticmethod
    def map_publication_to_news_api_source(publication: str) -> str:
        """
        Map publication names to NewsAPI source IDs
        
        Args:
            publication: Publication name
            
        Returns:
            NewsAPI source ID
        """
        mapping = {
            'wall street journal': 'the-wall-street-journal',
            'wsj': 'the-wall-street-journal',
            'new york times': 'the-new-york-times',
            'nyt': 'the-new-york-times',
            'washington post': 'the-washington-post',
            'cnn': 'cnn',
            'bbc': 'bbc-news',
            'bbc news': 'bbc-news',
            'fox news': 'fox-news',
            'nbc news': 'nbc-news',
            'abc news': 'abc-news',
            'reuters': 'reuters',
            'associated press': 'associated-press',
            'ap': 'associated-press'
        }
        
        pub_lower = publication.lower()
        return mapping.get(pub_lower, pub_lower)
    
    def _map_category_to_nyt_section(self, category: str) -> str:
        """Map general news category to NYT section name"""
        mapping = {
            'business': 'business',
            'technology': 'technology',
            'politics': 'politics',
            'science': 'science',
            'health': 'health',
            'sports': 'sports',
            'arts': 'arts',
            'world': 'world',
            'us': 'us'
        }
        return mapping.get(category.lower(), 'home')
    
    def fetch_from_nyt(self) -> List[Dict]:
        """
        Fetch from NYT Top Stories API
        
        Returns:
            List of articles from NYT
        """
        try:
            if not self.nyt_api_key:
                logger.error("NYT API key not configured")
                return []
                
            nyt_api_url = 'https://api.nytimes.com/svc/topstories/v2/home.json'
            params = {
                'api-key': self.nyt_api_key
            }
            
            response = requests.get(nyt_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return [
                {
                    'title': article.get('title'),
                    'description': article.get('abstract'),
                    'url': article.get('url'),
                    'imageUrl': self._get_nyt_image_url(article),
                    'source': 'The New York Times',
                    'publishedAt': article.get('published_date'),
                    'section': article.get('section')
                }
                for article in data.get('results', [])
            ]
        except Exception as e:
            logger.error(f"Error fetching from NYT API: {e}")
            raise Exception("Failed to fetch from The New York Times")
    
    def fetch_from_nyt_top_stories(self, section: str = 'home') -> List[Dict]:
        """
        Fetch from NYT Top Stories API for a specific section
        
        Args:
            section: NYT section name
            
        Returns:
            List of articles from the section
        """
        try:
            if not self.nyt_api_key:
                logger.error("NYT API key not configured")
                return []
                
            nyt_api_url = f'https://api.nytimes.com/svc/topstories/v2/{section}.json'
            params = {
                'api-key': self.nyt_api_key
            }
            
            response = requests.get(nyt_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return [
                {
                    'title': article.get('title'),
                    'description': article.get('abstract'),
                    'url': article.get('url'),
                    'imageUrl': self._get_nyt_image_url(article),
                    'source': 'The New York Times',
                    'publishedAt': article.get('published_date'),
                    'section': article.get('section')
                }
                for article in data.get('results', [])
            ]
        except Exception as e:
            logger.error(f"Error fetching from NYT Top Stories API for section {section}: {e}")
            raise Exception(f"Failed to fetch from NYT section {section}")
    
    def search_nyt_articles(self, query: str) -> List[Dict]:
        """
        Search articles using NYT Article Search API
        
        Args:
            query: Search query
            
        Returns:
            List of matching articles
        """
        try:
            if not self.nyt_api_key:
                logger.error("NYT API key not configured")
                return []
                
            nyt_api_url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json'
            params = {
                'api-key': self.nyt_api_key,
                'q': query,
                'sort': 'newest'
            }
            
            response = requests.get(nyt_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return [
                {
                    'title': doc.get('headline', {}).get('main'),
                    'description': doc.get('abstract') or doc.get('snippet'),
                    'url': f"https://www.nytimes.com/{doc.get('web_url', '')}",
                    'imageUrl': self._get_nyt_search_image_url(doc),
                    'source': 'The New York Times',
                    'publishedAt': doc.get('pub_date'),
                    'section': doc.get('section_name')
                }
                for doc in data.get('response', {}).get('docs', [])
            ]
        except Exception as e:
            logger.error(f"Error searching NYT articles: {e}")
            raise Exception("Failed to search NYT articles")
    
    @staticmethod
    def _get_nyt_image_url(article: Dict) -> Optional[str]:
        """Extract image URL from NYT article data"""
        if not article.get('multimedia'):
            return None
        
        # Find the largest image
        largest_image = None
        max_width = 0
        
        for image in article.get('multimedia', []):
            width = image.get('width', 0)
            if width > max_width:
                max_width = width
                largest_image = image
        
        if largest_image and 'url' in largest_image:
            return largest_image['url']
        
        return None
    
    @staticmethod
    def _get_nyt_search_image_url(doc: Dict) -> Optional[str]:
        """Extract image URL from NYT article search results"""
        if not doc.get('multimedia'):
            return None
        
        for multimedia in doc.get('multimedia', []):
            if multimedia.get('type') == 'image':
                return f"https://www.nytimes.com/{multimedia.get('url')}"
        
        return None
    
    def fetch_from_guardian(self) -> List[Dict]:
        """
        Fetch from Guardian API
        
        Returns:
            List of articles from The Guardian
        """
        try:
            if not self.guardian_api_key:
                logger.error("Guardian API key not configured")
                return []
                
            guardian_api_url = 'https://content.guardianapis.com/search'
            params = {
                'api-key': self.guardian_api_key,
                'show-fields': 'headline,trailText,thumbnail,byline,publication',
                'section': 'news'
            }
            
            response = requests.get(guardian_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return [
                {
                    'title': article.get('webTitle'),
                    'description': article.get('fields', {}).get('trailText'),
                    'url': article.get('webUrl'),
                    'imageUrl': article.get('fields', {}).get('thumbnail'),
                    'source': 'The Guardian',
                    'publishedAt': article.get('webPublicationDate'),
                    'section': article.get('sectionName')
                }
                for article in data.get('response', {}).get('results', [])
            ]
        except Exception as e:
            logger.error(f"Error fetching from Guardian API: {e}")
            raise Exception("Failed to fetch from The Guardian")
    
    def generate_news_analysis(self, articles: List[Dict], prompt: str) -> str:
        """
        Generate summaries or analysis using OpenAI
        
        Args:
            articles: List of articles to analyze
            prompt: Prompt for the analysis
            
        Returns:
            Generated analysis
        """
        if not OPENAI_API_KEY:
            raise Exception("OpenAI API key not configured")
        
        try:
            # Create a context from the articles
            articles_context = ""
            for i, article in enumerate(articles[:5]):
                articles_context += f"TITLE: {article.get('title')}\n"
                articles_context += f"SOURCE: {article.get('source')}\n"
                articles_context += f"DESCRIPTION: {article.get('description') or 'No description available'}\n\n"
            
            # Generate the completion
            response = openai.Completion.create(
                model="gpt-3.5-turbo-instruct",
                prompt=f"{prompt}\n\nContext from recent news articles:\n{articles_context}",
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].text.strip()
        except Exception as e:
            logger.error(f"Error generating news analysis: {e}")
            raise Exception("Failed to generate news analysis")
    
    def generate_conversational_response(self, user_input: str, conversation_history: List[Dict]) -> str:
        """
        Generate a conversational response using OpenAI
        
        Args:
            user_input: User's input message
            conversation_history: Previous conversation history
            
        Returns:
            Generated response
        """
        if not OPENAI_API_KEY:
            raise Exception("OpenAI API key not configured")
        
        try:
            # Format the conversation history for the API
            messages = [
                {
                    "role": msg.get("role"),
                    "content": msg.get("content")
                }
                for msg in conversation_history
            ]
            
            # Add system message
            messages.insert(0, {
                "role": "system",
                "content": "You are News Agent, an AI assistant that helps users stay informed about current events. Your goal is to provide accurate, helpful, and informative responses about news and current events. You can search for news, summarize articles, and discuss topics in a conversational way."
            })
            
            # Add the new user message
            messages.append({
                "role": "user",
                "content": user_input
            })
            
            # Generate the completion
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating conversational response: {e}")
            raise Exception("Failed to generate conversational response")


class NewsAgent:
    """
    Core News Agent that processes user requests and manages conversation
    """
    
    def __init__(self):
        self.user_preferences = {
            'favorite_topics': [],
            'favorite_publications': [],
            'update_frequency': 'daily',
            'region': 'global'
        }
        self.conversation_history = []
        self.news_agent_api = NewsAgentAPI()
    
    async def initialize(self, user_preferences: Optional[Dict] = None) -> str:
        """
        Initialize the agent with user preferences
        
        Args:
            user_preferences: User's preferences
            
        Returns:
            Welcome message with top headlines
        """
        if user_preferences:
            self.user_preferences.update(user_preferences)
        
        logger.info(f"News Agent initialized with preferences: {self.user_preferences}")
        
        # Get initial headlines
        try:
            headlines = self.news_agent_api.get_top_headlines(
                country=self.user_preferences.get('region', 'us') if self.user_preferences.get('region') != 'global' else 'us'
            )
            headline_titles = [headline.get('title') for headline in headlines[:5] if headline.get('title')]
            
            return f"Welcome to your News Agent! Here are today's top headlines:\n" + "\n".join(headline_titles)
        except Exception as e:
            logger.error(f"Error fetching initial headlines: {e}")
            return "Welcome to your News Agent! I'm ready to help you find and discuss the latest news."
    
    async def process_request(self, user_input: str) -> str:
        """
        Process natural language requests
        
        Args:
            user_input: User's input message
            
        Returns:
            Agent's response
        """
        # Add to conversation history
        self.conversation_history.append({"role": "user", "content": user_input})
        
        # Detect intent from user input
        intent = self.detect_intent(user_input)
        logger.info(f"Detected intent: {intent}")
        
        # Process the intent
        try:
            if intent['type'] == 'fetch_headlines':
                response = await self.handle_headlines_request(intent)
            elif intent['type'] == 'fetch_specific_publication':
                response = await self.handle_publication_request(intent['publication'])
            elif intent['type'] == 'fetch_topic':
                response = await self.handle_topic_request(intent['topic'])
            elif intent['type'] == 'discussion':
                response = await self.discuss_news(user_input)
            elif intent['type'] == 'update_preferences':
                response = self.update_user_preferences(intent.get('preferences', {}))
            else:
                response = await self.discuss_news(user_input)
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            response = f"I'm sorry, I encountered an error while processing your request. Please try again or ask something else."
        
        # Add to conversation history
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    @staticmethod
    def detect_intent(user_input: str) -> Dict:
        """
        Detect the intent from user input
        
        Args:
            user_input: User's input message
            
        Returns:
            Intent dictionary
        """
        input_lower = user_input.lower()
        
        # Check for headline requests
        if any(phrase in input_lower for phrase in ['latest headlines', 'top news', 'breaking news']):
            return {'type': 'fetch_headlines'}
        
        # Check for specific publication requests
        publications = ['wall street journal', 'new york times', 'washington post', 'cnn', 'bbc', 'fox news']
        for pub in publications:
            if pub in input_lower:
                return {'type': 'fetch_specific_publication', 'publication': pub}
        
        # Check for topic requests
        topics = ['politics', 'business', 'technology', 'health', 'science', 'sports', 'entertainment']
        for topic in topics:
            if topic in input_lower:
                return {'type': 'fetch_topic', 'topic': topic}
        
        # Check for specific events/locations
        specific_keywords = ['ukraine', 'election', 'covid', 'climate']
        for keyword in specific_keywords:
            if keyword in input_lower:
                return {'type': 'fetch_topic', 'topic': keyword}
        
        # Check for preference updates
        if any(word in input_lower for word in ['preferences', 'settings', 'configure']):
            return {'type': 'update_preferences'}
        
        # Default to discussion
        return {'type': 'discussion'}
    
    async def handle_headlines_request(self, intent: Dict) -> str:
        """
        Handle requests for latest headlines
        
        Args:
            intent: Intent dictionary
            
        Returns:
            Headlines response
        """
        try:
            region = self.user_preferences.get('region', 'us')
            if region == 'global':
                region = 'us'  # Default to US if global
                
            headlines = self.news_agent_api.get_top_headlines(country=region)
            headline_titles = [headline.get('title') for headline in headlines[:5] if headline.get('title')]
            
            if headline_titles:
                return f"Here are today's top headlines:\n" + "\n".join(headline_titles)
            else:
                return "I'm sorry, I couldn't find any headlines at the moment. Please try again later."
        except Exception as e:
            logger.error(f"Error fetching headlines: {e}")
            return "I'm sorry, I couldn't fetch the latest headlines right now. Please try again later."
    
    async def handle_publication_request(self, publication: str) -> str:
        """
        Handle requests for news from specific publication
        
        Args:
            publication: Publication name
            
        Returns:
            Publication articles response
        """
        try:
            articles = self.news_agent_api.get_from_publication(publication)
            article_titles = [article.get('title') for article in articles[:5] if article.get('title')]
            
            if article_titles:
                return f"Here are the latest articles from {publication}:\n" + "\n".join(article_titles)
            else:
                return f"I'm sorry, I couldn't find any recent articles from {publication}. Please try another publication or try again later."
        except Exception as e:
            logger.error(f"Error fetching from {publication}: {e}")
            return f"I'm sorry, I couldn't fetch articles from {publication} right now. Please try again later."
    
    async def handle_topic_request(self, topic: str) -> str:
        """
        Handle requests for news on specific topic
        
        Args:
            topic: Topic to search for
            
        Returns:
            Topic articles response
        """
        try:
            articles = self.news_agent_api.get_news_by_topic(topic)
            article_titles = [article.get('title') for article in articles[:5] if article.get('title')]
            
            if article_titles:
                return f"Here are the latest articles about {topic}:\n" + "\n".join(article_titles)
            else:
                return f"I'm sorry, I couldn't find any recent articles about {topic}. Please try another topic or try again later."
        except Exception as e:
            logger.error(f"Error fetching articles about {topic}: {e}")
            return f"I'm sorry, I couldn't fetch articles about {topic} right now. Please try again later."
    
    async def discuss_news(self, user_input: str) -> str:
        """
        Discuss news or provide analysis
        
        Args:
            user_input: User's input message
            
        Returns:
            Discussion response
        """
        try:
            return self.news_agent_api.generate_conversational_response(
                user_input, 
                self.conversation_history
            )
        except Exception as e:
            logger.error(f"Error discussing news: {e}")
            return "I'd be happy to discuss this topic. Based on recent news, there have been several developments in this area. What specific aspect would you like to know more about?"
    
    def update_user_preferences(self, preferences: Dict) -> str:
        """
        Update user preferences
        
        Args:
            preferences: New preferences
            
        Returns:
            Confirmation message
        """
        self.user_preferences.update(preferences)
        
        preferences_summary = []
        if 'favorite_topics' in preferences and preferences['favorite_topics']:
            topics_str = ', '.join(preferences['favorite_topics'])
            preferences_summary.append(f"favorite topics: {topics_str}")
        
        if 'favorite_publications' in preferences and preferences['favorite_publications']:
            pubs_str = ', '.join(preferences['favorite_publications'])
            preferences_summary.append(f"favorite publications: {pubs_str}")
        
        if 'region' in preferences:
            preferences_summary.append(f"region: {preferences['region']}")
        
        if 'update_frequency' in preferences:
            preferences_summary.append(f"update frequency: {preferences['update_frequency']}")
        
        if preferences_summary:
            summary = ', '.join(preferences_summary)
            return f"Your news preferences have been updated. I'll focus on {summary}."
        else:
            return "Your news preferences have been updated."


# Store user sessions
user_sessions = {}

def get_user_session(user_id: str) -> NewsAgent:
    """
    Get or create a user session
    
    Args:
        user_id: User ID
        
    Returns:
        NewsAgent instance
    """
    if user_id not in user_sessions:
        user_sessions[user_id] = NewsAgent()
    
    return user_sessions[user_id]


# Routes

@app.route('/api/initialize', methods=['POST'])
async def initialize_session():
    """Initialize a user session with preferences"""
    try:
        data = request.json
        user_id = data.get('userId')
        preferences = data.get('preferences')
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Missing userId"
            }), 400
        
        session = get_user_session(user_id)
        welcome_message = await session.initialize(preferences)
        
        # Add initial message to conversation history
        session.conversation_history.append({
            "role": "assistant",
            "content": welcome_message
        })
        
        return jsonify({
            "success": True,
            "message": welcome_message
        })
    except Exception as e:
        logger.error(f"Error initializing session: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to initialize session"
        }), 500


@app.route('/api/request', methods=['POST'])
async def process_request():
    """Process a user request"""
    try:
        data = request.json
        user_id = data.get('userId')
        user_input = data.get('userInput')
        
        if not user_id or not user_input:
            return jsonify({
                "success": False,
                "error": "Missing required fields"
            }), 400
        
        session = get_user_session(user_id)
        response = await session.process_request(user_input)
        
        return jsonify({
            "success": True,
            "response": response
        })
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to process request"
        }), 500


@app.route('/api/headlines', methods=['GET'])
def get_headlines():
    """Get top headlines"""
    try:
        country = request.args.get('country', 'us')
        category = request.args.get('category', '')
        
        news_agent_api = NewsAgentAPI()
        headlines = news_agent_api.get_top_headlines(country, category)
        
        return jsonify({
            "success": True,
            "headlines": headlines
        })
    except Exception as e:
        logger.error(f"Error fetching headlines: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch headlines"
        }), 500


@app.route('/api/publication/<publication>', methods=['GET'])
def get_from_publication(publication):
    """Get news from a specific publication"""
    try:
        news_agent_api = NewsAgentAPI()
        articles = news_agent_api.get_from_publication(publication)
        
        return jsonify({
            "success": True,
            "articles": articles
        })
    except Exception as e:
        logger.error(f"Error fetching from {publication}: {e}")
        return jsonify({
            "success": False,
            "error": f"Failed to fetch from {publication}"
        }), 500


@app.route('/api/topic/<topic>', methods=['GET'])
def get_by_topic(topic):
    """Get news by topic"""
    try:
        language = request.args.get('language', 'en')
        
        news_agent_api = NewsAgentAPI()
        articles = news_agent_api.get_news_by_topic(topic, language)
        
        return jsonify({
            "success": True,
            "articles": articles
        })
    except Exception as e:
        logger.error(f"Error fetching news about {topic}: {e}")
        return jsonify({
            "success": False,
            "error": f"Failed to fetch news about {topic}"
        }), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_news():
    """Generate news analysis"""
    try:
        data = request.json
        articles = data.get('articles')
        prompt = data.get('prompt')
        
        if not articles or not prompt:
            return jsonify({
                "success": False,
                "error": "Missing required fields"
            }), 400
        
        news_agent_api = NewsAgentAPI()
        analysis = news_agent_api.generate_news_analysis(articles, prompt)
        
        return jsonify({
            "success": True,
            "analysis": analysis
        })
    except Exception as e:
        logger.error(f"Error generating analysis: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to generate analysis"
        }), 500


@app.route('/api/history/<user_id>', methods=['GET'])
def get_history(user_id):
    """Get user conversation history"""
    try:
        session = get_user_session(user_id)
        
        return jsonify({
            "success": True,
            "history": session.conversation_history
        })
    except Exception as e:
        logger.error(f"Error fetching conversation history: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch conversation history"
        }), 500


@app.route('/api/history/<user_id>', methods=['DELETE'])
def clear_history(user_id):
    """Clear user conversation history"""
    try:
        session = get_user_session(user_id)
        session.conversation_history = []
        
        return jsonify({
            "success": True,
            "message": "Conversation history cleared"
        })
    except Exception as e:
        logger.error(f"Error clearing conversation history: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to clear conversation history"
        }), 500


@app.route('/api/preferences/<user_id>', methods=['POST'])
def update_preferences(user_id):
    """Update user preferences"""
    try:
        data = request.json
        preferences = data.get('preferences')
        
        if not preferences:
            return jsonify({
                "success": False,
                "error": "Missing required fields"
            }), 400
        
        session = get_user_session(user_id)
        message = session.update_user_preferences(preferences)
        
        return jsonify({
            "success": True,
            "message": message
        })
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to update preferences"
        }), 500


# Health check route
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })


# Serve React app in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve React app in production"""
    # If the route is an API endpoint, let Flask handle it
    if path.startswith('api/'):
        return app.full_dispatch_request()
    
    # For all other routes, serve the React app
    return app.send_static_file('index.html')


# Error handler for 404
@app.errorhandler(404)
def not_found(e):
    # If the request is for API, return JSON error
    if request.path.startswith('/api/'):
        return jsonify({
            "success": False,
            "error": "The requested endpoint was not found"
        }), 404
    
    # For all other routes, serve the React app
    return app.send_static_file('index.html')


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    
    # Print startup information
    logger.info(f"Starting News Agent server on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    # Check API keys
    if not NEWS_API_KEY and not NYT_API_KEY and not GUARDIAN_API_KEY:
        logger.warning("No news API keys configured. The application may not work correctly.")
    
    if not OPENAI_API_KEY:
        logger.warning("OpenAI API key not configured. Conversational features will not work.")
    
    # Start the server
    app.run(host='0.0.0.0', port=port, debug=debug)