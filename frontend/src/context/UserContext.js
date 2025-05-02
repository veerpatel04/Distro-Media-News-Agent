import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  initializeSession, 
  processRequest, 
  getConversationHistory, 
  updatePreferences 
} from '../services/api';

// Create User Context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Generate a random user ID if not in localStorage
  const [userId] = useState(() => {
    const savedUserId = localStorage.getItem('newsAgentUserId');
    if (savedUserId) return savedUserId;
    
    const newUserId = `user-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('newsAgentUserId', newUserId);
    return newUserId;
  });
  
  // User state
  const [preferences, setPreferences] = useState({
    favorite_topics: ['technology', 'business'],
    favorite_publications: ['BBC', 'Wall Street Journal'],
    update_frequency: 'daily',
    region: 'us'
  });
  const [messages, setMessages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize user session on mount
  useEffect(() => {
    // Load saved preferences from localStorage if available
    const savedPreferences = localStorage.getItem('newsAgentPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (err) {
        console.error('Error parsing saved preferences:', err);
      }
    }
    
    // Initialize session
    initializeUserSession();
  }, [userId]);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('newsAgentPreferences', JSON.stringify(preferences));
  }, [preferences]);
  
  // Initialize user session
  const initializeUserSession = async () => {
    setIsLoading(true);
    try {
      const response = await initializeSession(userId, preferences);
      setMessages([{
        role: 'assistant',
        content: response.message
      }]);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Error initializing session:', err);
      setError('Failed to initialize. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send message to AI
  const sendMessage = async (userInput) => {
    if (!userInput.trim() || isLoading) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userInput
    }]);
    
    setIsLoading(true);
    
    try {
      // Process the request
      const response = await processRequest(userId, userInput);
      
      // Add assistant response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response
      }]);
      
      setError(null);
      return response;
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Failed to process your request. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load conversation history
  const loadConversationHistory = async () => {
    setIsLoading(true);
    try {
      const response = await getConversationHistory(userId);
      if (response.success) {
        setMessages(response.history);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading conversation history:', err);
      setError('Failed to load conversation history.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user preferences
  const savePreferences = async (newPreferences) => {
    setIsLoading(true);
    try {
      await updatePreferences(userId, newPreferences);
      setPreferences(newPreferences);
      setError(null);
      
      // Inform the user about the preference change
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've updated your preferences. You'll now receive news about ${newPreferences.favorite_topics.join(', ')} and from sources like ${newPreferences.favorite_publications.join(', ')}.`
      }]);
      
      return true;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <UserContext.Provider value={{
      userId,
      preferences,
      messages,
      isInitialized,
      isLoading,
      error,
      sendMessage,
      loadConversationHistory,
      savePreferences
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using User Context
export const useUser = () => useContext(UserContext);

export default UserContext;