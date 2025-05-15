// News Agent API Service
// This file handles all API calls to the News Agent backend

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Initialize a user session with preferences
 * @param {string} userId
 * @param {Object} preferences
 * @returns {Promise<Object>}
 */
export const initializeSession = async (userId, preferences) => {
  const response = await fetch(`${API_BASE_URL}/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, preferences })
  });
  if (!response.ok) {
    throw new Error(`Error initializing session: ${response.status}`);
  }
  return await response.json();
};

/**
 * Process a user request (generative chat)
 * Returns the AI’s reply string directly
 * @param {string} userId
 * @param {string} userInput
 * @returns {Promise<string>}
 */
export const processRequest = async (userId, userInput) => {
  const response = await fetch(`${API_BASE_URL}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userInput })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${response.status}`);
  }
  const { message } = await response.json();
  return message;
};

/**
 * Legacy alias if you preferred a different name
 */
export const sendUserRequest = processRequest;

/**
 * Fetch top headlines (used in “browse” mode)
 * @param {string} country
 * @param {string} category
 * @returns {Promise<Object>}
 */
export const fetchHeadlines = async (country = 'us', category = '') => {
  const url = new URL(`${API_BASE_URL}/headlines`);
  url.searchParams.append('country', country);
  if (category) url.searchParams.append('category', category);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching headlines: ${response.status}`);
  }
  return await response.json();
};

/**
 * Fetch news from a specific publication
 * @param {string} publication
 * @returns {Promise<Object>}
 */
export const fetchFromPublication = async (publication) => {
  const response = await fetch(
    `${API_BASE_URL}/publication/${encodeURIComponent(publication)}`
  );
  if (!response.ok) {
    throw new Error(`Error fetching from ${publication}: ${response.status}`);
  }
  return await response.json();
};

/**
 * Fetch news by topic
 * @param {string} topic
 * @param {string} language
 * @returns {Promise<Object>}
 */
export const fetchByTopic = async (topic, language = 'en') => {
  const url = new URL(
    `${API_BASE_URL}/topic/${encodeURIComponent(topic)}`
  );
  url.searchParams.append('language', language);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching news about ${topic}: ${response.status}`);
  }
  return await response.json();
};

/**
 * Generate news analysis
 * @param {Array} articles
 * @param {string} prompt
 * @returns {Promise<Object>}
 */
export const generateAnalysis = async (articles, prompt) => {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles, prompt })
  });
  if (!response.ok) {
    throw new Error(`Error generating analysis: ${response.status}`);
  }
  return await response.json();
};

/**
 * Get user conversation history
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const getConversationHistory = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/history/${encodeURIComponent(userId)}`
  );
  if (!response.ok) {
    throw new Error(`Error fetching conversation history: ${response.status}`);
  }
  return await response.json();
};

/**
 * Clear user conversation history
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const clearConversationHistory = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/history/${encodeURIComponent(userId)}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error(`Error clearing conversation history: ${response.status}`);
  }
  return await response.json();
};

/**
 * Update user preferences
 * @param {string} userId
 * @param {Object} preferences
 * @returns {Promise<Object>}
 */
export const updatePreferences = async (userId, preferences) => {
  const response = await fetch(
    `${API_BASE_URL}/preferences/${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences })
    }
  );
  if (!response.ok) {
    throw new Error(`Error updating preferences: ${response.status}`);
  }
  return await response.json();
};
