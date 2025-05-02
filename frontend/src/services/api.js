// News Agent API Service
// This file handles all API calls to the News Agent backend

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Initialize a user session with preferences
 * @param {string} userId - The user ID
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} - The welcome message
 */
export const initializeSession = async (userId, preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        preferences
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error initializing session:', error);
    throw error;
  }
};

/**
 * Process a user request
 * @param {string} userId - The user ID
 * @param {string} userInput - The user's message
 * @returns {Promise<Object>} - The agent's response
 */
export const processRequest = async (userId, userInput) => {
  try {
    const response = await fetch(`${API_BASE_URL}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        userInput
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing request:', error);
    throw error;
  }
};

/**
 * Fetch top headlines
 * @param {string} country - Country code
 * @param {string} category - News category
 * @returns {Promise<Object>} - The headlines data
 */
export const fetchHeadlines = async (country = 'us', category = '') => {
  try {
    const url = new URL(`${API_BASE_URL}/headlines`);
    url.searchParams.append('country', country);
    if (category) {
      url.searchParams.append('category', category);
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching headlines:', error);
    throw error;
  }
};

/**
 * Fetch news from a specific publication
 * @param {string} publication - Publication name
 * @returns {Promise<Object>} - The publication articles
 */
export const fetchFromPublication = async (publication) => {
  try {
    const response = await fetch(`${API_BASE_URL}/publication/${encodeURIComponent(publication)}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${publication}:`, error);
    throw error;
  }
};

/**
 * Fetch news by topic
 * @param {string} topic - Topic name
 * @param {string} language - Language code
 * @returns {Promise<Object>} - The topic articles
 */
export const fetchByTopic = async (topic, language = 'en') => {
  try {
    const url = new URL(`${API_BASE_URL}/topic/${encodeURIComponent(topic)}`);
    url.searchParams.append('language', language);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching news about ${topic}:`, error);
    throw error;
  }
};

/**
 * Generate news analysis
 * @param {Array} articles - List of articles
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<Object>} - The analysis
 */
export const generateAnalysis = async (articles, prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        articles,
        prompt
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw error;
  }
};

/**
 * Get user conversation history
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The conversation history
 */
export const getConversationHistory = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};

/**
 * Clear user conversation history
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The confirmation message
 */
export const clearConversationHistory = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error clearing conversation history:', error);
    throw error;
  }
};

/**
 * Update user preferences
 * @param {string} userId - The user ID
 * @param {Object} preferences - New preferences
 * @returns {Promise<Object>} - The confirmation message
 */
export const updatePreferences = async (userId, preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/preferences/${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        preferences
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};