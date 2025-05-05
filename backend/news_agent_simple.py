from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)

# Simple in-memory storage for user sessions
user_sessions = {}

# Basic routes that should definitely work
@app.route('/')
def home():
    return 'News Agent API is running!'

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/test')
def test_api():
    return jsonify({
        "message": "API endpoint is working",
        "success": True
    })

@app.route('/api/initialize', methods=['POST'])
def initialize_session():
    """Initialize a user session with preferences"""
    try:
        data = request.get_json() or {}
        user_id = data.get('userId', 'test-user')
        preferences = data.get('preferences', {})
        
        # Store the user preferences in memory
        user_sessions[user_id] = {
            'preferences': preferences,
            'conversation_history': []
        }
        
        # Add welcome message to conversation history
        welcome_message = f"Welcome to News Agent! Session initialized for user {user_id}"
        if user_id in user_sessions:
            if 'conversation_history' not in user_sessions[user_id]:
                user_sessions[user_id]['conversation_history'] = []
            user_sessions[user_id]['conversation_history'].append({
                'role': 'assistant',
                'content': welcome_message
            })
        
        return jsonify({
            "success": True,
            "message": welcome_message
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/headlines', methods=['GET'])
def get_headlines():
    """Get top headlines"""
    try:
        country = request.args.get('country', 'us')
        category = request.args.get('category', '')
        
        # Use NYT Top Stories API
        nyt_api_key = os.getenv('NYT_API_KEY', 'ol1fhGLHJtvD007tp7cGduT5JuKdf9bz')
        
        # Map category to section name
        section = 'home'
        if category:
            section_map = {
                'world': 'world',
                'politics': 'politics',
                'business': 'business',
                'technology': 'technology',
                'science': 'science',
                'health': 'health',
                'sports': 'sports'
            }
            section = section_map.get(category.lower(), 'home')
        
        # Call NYT API
        nyt_url = f'https://api.nytimes.com/svc/topstories/v2/{section}.json'
        response = requests.get(nyt_url, params={'api-key': nyt_api_key})
        
        if response.status_code != 200:
            raise Exception(f"NYT API returned status code {response.status_code}")
        
        data = response.json()
        
        # Transform the response data
        headlines = []
        for article in data.get('results', [])[:10]:  # Limit to 10 articles
            image_url = None
            if article.get('multimedia') and len(article.get('multimedia')) > 0:
                for media in article.get('multimedia'):
                    if media.get('format') == 'mediumThreeByTwo210':
                        image_url = media.get('url')
                        break
            
            headlines.append({
                'title': article.get('title'),
                'description': article.get('abstract'),
                'url': article.get('url'),
                'imageUrl': image_url,
                'source': 'The New York Times',
                'publishedAt': article.get('published_date'),
                'section': article.get('section')
            })
        
        return jsonify({
            "success": True,
            "headlines": headlines
        })
    except Exception as e:
        print(f"Error fetching headlines: {e}")
        # Fall back to mock data
        return jsonify({
            "success": True,
            "headlines": [
                {
                    "title": "Breaking News: Technology Advances",
                    "description": "Latest developments in AI and machine learning",
                    "url": "https://example.com/article1",
                    "source": "Tech News",
                    "publishedAt": datetime.now().isoformat()
                },
                {
                    "title": "Global Markets Update",
                    "description": "Stock markets react to recent economic news",
                    "url": "https://example.com/article2",
                    "source": "Financial Times",
                    "publishedAt": datetime.now().isoformat()
                }
            ]
        })

@app.route('/api/topic/<topic>', methods=['GET'])
def get_by_topic(topic):
    """Get news by topic"""
    try:
        language = request.args.get('language', 'en')
        
        # Use NYT Article Search API
        nyt_api_key = os.getenv('NYT_API_KEY', 'ol1fhGLHJtvD007tp7cGduT5JuKdf9bz')
        
        # Call NYT API
        nyt_url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json'
        params = {
            'api-key': nyt_api_key,
            'q': topic,
            'sort': 'newest'
        }
        
        response = requests.get(nyt_url, params=params)
        
        if response.status_code != 200:
            raise Exception(f"NYT API returned status code {response.status_code}")
        
        data = response.json()
        
        # Transform the response data
        articles = []
        for doc in data.get('response', {}).get('docs', [])[:10]:  # Limit to 10 articles
            # Extract image URL if available
            image_url = None
            if doc.get('multimedia'):
                for multimedia in doc.get('multimedia', []):
                    if multimedia.get('type') == 'image':
                        image_url = f"https://static01.nyt.com/{multimedia.get('url')}"
                        break
            
            articles.append({
                'title': doc.get('headline', {}).get('main'),
                'description': doc.get('abstract') or doc.get('snippet'),
                'url': doc.get('web_url'),
                'imageUrl': image_url,
                'source': 'The New York Times',
                'publishedAt': doc.get('pub_date'),
                'section': doc.get('section_name')
            })
        
        return jsonify({
            "success": True,
            "articles": articles
        })
    except Exception as e:
        print(f"Error searching for topic {topic}: {e}")
        # Fall back to mock data
        return jsonify({
            "success": True,
            "articles": [
                {
                    "title": f"News about {topic}",
                    "description": f"Latest developments related to {topic}",
                    "url": "https://example.com/article1",
                    "source": "News Source",
                    "publishedAt": datetime.now().isoformat()
                }
            ]
        })

@app.route('/api/publication/<publication>', methods=['GET'])
def get_from_publication(publication):
    """Get news from a specific publication"""
    try:
        # Currently only supporting NYT
        if publication.lower() in ['new york times', 'nyt', 'ny times']:
            # Use NYT Top Stories API
            nyt_api_key = os.getenv('NYT_API_KEY', 'ol1fhGLHJtvD007tp7cGduT5JuKdf9bz')
            
            nyt_url = 'https://api.nytimes.com/svc/topstories/v2/home.json'
            response = requests.get(nyt_url, params={'api-key': nyt_api_key})
            
            if response.status_code != 200:
                raise Exception(f"NYT API returned status code {response.status_code}")
            
            data = response.json()
            
            # Transform the response data
            articles = []
            for article in data.get('results', [])[:10]:  # Limit to 10 articles
                image_url = None
                if article.get('multimedia') and len(article.get('multimedia')) > 0:
                    for media in article.get('multimedia'):
                        if media.get('format') == 'mediumThreeByTwo210':
                            image_url = media.get('url')
                            break
                
                articles.append({
                    'title': article.get('title'),
                    'description': article.get('abstract'),
                    'url': article.get('url'),
                    'imageUrl': image_url,
                    'source': 'The New York Times',
                    'publishedAt': article.get('published_date'),
                    'section': article.get('section')
                })
            
            return jsonify({
                "success": True,
                "articles": articles
            })
        else:
            # Fallback for other publications
            return jsonify({
                "success": True,
                "articles": [
                    {
                        "title": f"Story from {publication}",
                        "description": f"Latest article from {publication}",
                        "url": "https://example.com/article",
                        "source": publication,
                        "publishedAt": datetime.now().isoformat()
                    }
                ]
            })
    except Exception as e:
        print(f"Error fetching from publication {publication}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/request', methods=['POST'])
def process_request():
    """Process a user request"""
    try:
        data = request.get_json() or {}
        user_id = data.get('userId')
        user_input = data.get('userInput')
        
        if not user_id or not user_input:
            return jsonify({
                "success": False,
                "error": "Missing required fields"
            }), 400
        
        # Store user message in conversation history
        if user_id in user_sessions:
            if 'conversation_history' not in user_sessions[user_id]:
                user_sessions[user_id]['conversation_history'] = []
            user_sessions[user_id]['conversation_history'].append({
                'role': 'user',
                'content': user_input
            })
        
        # Simple intent detection
        input_lower = user_input.lower()
        
        # Check for headline requests
        if any(phrase in input_lower for phrase in ['headlines', 'news', 'today']):
            # Get headlines and include them in the response
            country = 'us'
            category = ''
            
            # Check for category mentions
            categories = ['politics', 'business', 'technology', 'sports', 'health', 'science']
            for cat in categories:
                if cat in input_lower:
                    category = cat
                    break
            
            response_text = f"Here are the latest {category + ' ' if category else ''}headlines:"
        
        # Check for publication requests
        elif any(pub in input_lower for pub in ['new york times', 'nyt']):
            response_text = "Here are the latest articles from The New York Times:"
        
        # Check for topic requests
        elif any(phrase in input_lower for phrase in ['about', 'regarding', 'on', 'related to']):
            # Try to extract topic
            words = input_lower.split()
            potential_topics = []
            
            for i, word in enumerate(words):
                if word in ['about', 'regarding', 'on']:
                    if i + 1 < len(words):
                        potential_topics.append(words[i + 1])
            
            if potential_topics:
                topic = potential_topics[0]
                response_text = f"Here are some articles about {topic}:"
            else:
                response_text = f"I received your message: '{user_input}'. What specific topic would you like to read about?"
        
        # Default response
        else:
            response_text = f"I received your message: '{user_input}'. What kind of news are you interested in today?"
        
        # Store assistant response in conversation history
        if user_id in user_sessions:
            user_sessions[user_id]['conversation_history'].append({
                'role': 'assistant',
                'content': response_text
            })
        
        return jsonify({
            "success": True,
            "response": response_text
        })
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/history/<user_id>', methods=['GET'])
def get_history(user_id):
    """Get user conversation history"""
    try:
        if user_id in user_sessions and 'conversation_history' in user_sessions[user_id]:
            return jsonify({
                "success": True,
                "history": user_sessions[user_id]['conversation_history']
            })
        else:
            return jsonify({
                "success": True,
                "history": []
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/history/<user_id>', methods=['DELETE'])
def clear_history(user_id):
    """Clear user conversation history"""
    try:
        if user_id in user_sessions:
            user_sessions[user_id]['conversation_history'] = []
        
        return jsonify({
            "success": True,
            "message": "Conversation history cleared"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/preferences/<user_id>', methods=['POST'])
def update_preferences(user_id):
    """Update user preferences"""
    try:
        data = request.get_json()
        preferences = data.get('preferences')
        
        if not preferences:
            return jsonify({
                "success": False,
                "error": "Missing required fields"
            }), 400
        
        if user_id not in user_sessions:
            user_sessions[user_id] = {}
        
        user_sessions[user_id]['preferences'] = preferences
        
        # Generate a message about the updated preferences
        response_message = "Your news preferences have been updated."
        
        if 'favorite_topics' in preferences and preferences['favorite_topics']:
            topics_str = ', '.join(preferences['favorite_topics'])
            response_message += f" I'll focus on {topics_str}."
        
        if 'favorite_publications' in preferences and preferences['favorite_publications']:
            pubs_str = ', '.join(preferences['favorite_publications'])
            response_message += f" I'll include sources like {pubs_str}."
        
        return jsonify({
            "success": True,
            "message": response_message
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Error handler for 404
@app.errorhandler(404)
def not_found(e):
    # If the request is for API, return JSON error
    if request.path.startswith('/api/'):
        return jsonify({
            "success": False,
            "error": "The requested endpoint was not found"
        }), 404
    
    # For all other routes, return simple text
    return "Not Found", 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() in ('true', 't', '1', 'yes')
    
    print(f"Starting News Agent on port {port} (debug={debug})")
    app.run(host='127.0.0.1', port=port, debug=debug)