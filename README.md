# Distro-Media-News-Agent

A conversational AI application that fetches, presents, and discusses news based on user preferences and natural language queries.

## Overview

News Agent is an AI-powered news assistant that allows users to:

- Request the latest news headlines
- Get updates from specific publications
- Search for news on specific topics
- Discuss current events with an AI assistant
- Receive personalized news based on preferences

This project implements a conversational agent that can fetch and discuss news articles based on natural language requests.

## Repository Structure

```
/
├── public/             # Static assets for frontend
├── src/                # Frontend React application
│   ├── components/     # UI components with CSS and tests
│   ├── context/        # State management with Context API
│   ├── pages/          # Page components for routing
│   ├── router/         # React Router configuration
│   ├── services/       # API service layer
│   ├── App.js          # Main application component
│   └── index.js        # Application entry point
├── .env                # Environment variables
├── docker-compose.yml  # Docker Compose configuration
├── dockerfile          # Docker configuration for the application
├── LICENSE             # Project license
├── News_Agent_...      # Additional documentation
├── package.json        # Frontend dependencies
├── README.md           # Project documentation
├── requirements.txt    # Backend Python dependencies
└── text_news_age...    # Additional documentation
```

## Technology Stack

### Backend
- **Python/Flask**: RESTful API server
- **NewsAPI, NYT, Guardian**: News data sources
- **OpenAI**: Natural language processing and conversation
- **Docker**: Containerization for deployment

### Frontend
- **React**: User interface components
- **Context API**: State management
- **React Router**: Navigation and routing
- **CSS**: Styling and responsive design

## Setup and Installation

### Prerequisites

- Python 3.9+
- Node.js 14+
- API keys for:
  - NewsAPI
  - New York Times API
  - Guardian API
  - OpenAI API

### Environment Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/news-agent.git
   cd news-agent
   ```

2. Set up environment variables
   ```bash
   # Edit .env with your API keys
   NEWS_API_KEY=your_newsapi_key
   NYT_API_KEY=your_nyt_api_key
   GUARDIAN_API_KEY=your_guardian_api_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ```

### Running the Application

#### Development Mode

1. Start the backend
   ```bash
   pip install -r requirements.txt
   python news_agent_python.py
   ```

2. Start the frontend
   ```bash
   npm install
   npm start
   ```

#### Using Docker Compose

```bash
docker-compose up --build
```

## API Documentation

The backend provides the following RESTful API endpoints:

### Session Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/initialize` | POST | Initialize a user session | `{ userId, preferences }` | `{ success, message }` |
| `/api/history/:userId` | GET | Get conversation history | - | `{ success, history }` |
| `/api/history/:userId` | DELETE | Clear conversation history | - | `{ success, message }` |

### News Retrieval

| Endpoint | Method | Description | Query Params | Response |
|----------|--------|-------------|--------------|----------|
| `/api/headlines` | GET | Get top headlines | `country, category` | `{ success, headlines }` |
| `/api/publication/:publication` | GET | Get articles from a publication | - | `{ success, articles }` |
| `/api/topic/:topic` | GET | Get articles about a topic | `language` | `{ success, articles }` |

### Conversation

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/request` | POST | Process a user request | `{ userId, userInput }` | `{ success, response }` |
| `/api/analyze` | POST | Generate news analysis | `{ articles, prompt }` | `{ success, analysis }` |

### User Preferences

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/preferences/:userId` | POST | Update user preferences | `{ preferences }` | `{ success, message }` |

## Features

### Backend

- **Natural Language Processing**: Understands user requests in conversational language
- **Intent Detection**: Identifies what the user is asking for (headlines, specific news, topics)
- **Multi-Source Integration**: Fetches news from NewsAPI, New York Times, and The Guardian
- **Caching**: Implements smart caching to reduce API calls
- **OpenAI Integration**: Uses AI to generate responses and analysis

### Frontend

- **Conversational Interface**: Chat with the News Agent to request news and information
- **Visual News Display**: See headlines and articles in an attractive format
- **Category Navigation**: Browse news by categories, publications, or topics
- **User Preferences**: Customize news sources, topics, and update frequency
- **Responsive Design**: Works on both desktop and mobile devices

## Testing

### Backend Testing

```bash
python -m unittest discover
```

Key testing files:
- `test_news_agent.py`: Tests for the NewsAgent class
- `test_news_agent_api.py`: Tests for the NewsAgentAPI class
- `test_routes.py`: Tests for the Flask routes

### Frontend Testing

```bash
npm test
```

Key testing files:
- `src/components/**/*.test.js`: Tests for React components
- `src/context/__tests__/NewsContext.test.js`: Tests for news context provider
- `src/context/__tests__/UserContext.test.js`: Tests for user context provider
- `src/services/__tests__/api.test.js`: Tests for API service functions

## Deployment

### Docker Deployment

The application can be deployed using Docker:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run the containers separately
docker build -t news-agent .
docker run -p 5000:5000 --env-file .env news-agent
```

## Troubleshooting

### Common Backend Issues

1. **API Key Problems**:
   - Error: "Failed to fetch headlines"
   - Solution: Check that your API keys are correctly set in the .env file

2. **Dependencies Installation**:
   - Error: "Module not found"
   - Solution: Ensure all dependencies are installed: `pip install -r requirements.txt`

3. **Port Conflicts**:
   - Error: "Address already in use"
   - Solution: Change the PORT value in the .env file

### Common Frontend Issues

1. **API Connection**:
   - Error: "Failed to fetch"
   - Solution: Ensure the backend server is running and correctly configured

2. **Build Problems**:
   - Error: "Module not found"
   - Solution: Run `npm install` to ensure all dependencies are installed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms found in the LICENSE file in the root directory.

## Acknowledgments

- News data provided by NewsAPI, New York Times, and The Guardian
- AI capabilities powered by OpenAI
- Inspired by the concept of conversational news assistants