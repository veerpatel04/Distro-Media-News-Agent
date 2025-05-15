
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  initializeSession, 
  processRequest,    // now returns the AI text reply
  getConversationHistory, 
  updatePreferences 
} from '../services/api';

// Create User Context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Generate or load a persistent user ID
  const [userId] = useState(() => {
    const saved = localStorage.getItem('newsAgentUserId');
    if (saved) return saved;
    const newId = `user-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('newsAgentUserId', newId);
    return newId;
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    favorite_topics: ['technology', 'business'],
    favorite_publications: ['BBC', 'Wall Street Journal'],
    update_frequency: 'daily',
    region: 'us'
  });
  const [messages, setMessages]       = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);

  // Load saved preferences & init session on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('newsAgentPreferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch {}
    }
    initializeUserSession();
  }, [userId]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('newsAgentPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Initialize the backend session
  const initializeUserSession = async () => {
    setIsLoading(true);
    try {
      const resp = await initializeSession(userId, preferences);
      setMessages([{
        role: 'assistant',
        content: resp.message
      }]);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Error initializing session:', err);
      setError('Failed to initialize. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a free-form message to the AI
  const sendMessage = async (userInput) => {
    if (!userInput.trim() || isLoading) return null;

    // 1️⃣ Add the user’s message
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userInput }
    ]);
    setIsLoading(true);

    try {
      // 2️⃣ Call the new POST /api/request endpoint
      const aiReplyText = await processRequest(userId, userInput);

      // 3️⃣ Add the assistant’s reply
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: aiReplyText }
      ]);

      // 🔊 4️⃣ Speak the AI’s reply aloud
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiReplyText);
        // Optional: tweak rate/pitch
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      setError(null);
      return aiReplyText;
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Failed to process your request. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };


  // Load past history
  const loadConversationHistory = async () => {
    setIsLoading(true);
    try {
      const resp = await getConversationHistory(userId);
      if (resp.success) {
        setMessages(resp.history);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load conversation history.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update preferences
  const savePreferences = async (newPrefs) => {
    setIsLoading(true);
    try {
      await updatePreferences(userId, newPrefs);
      setPreferences(newPrefs);
      setError(null);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Preferences updated: topics = ${newPrefs.favorite_topics.join(
            ', '
          )}; sources = ${newPrefs.favorite_publications.join(', ')}.`
        }
      ]);
      return true;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        preferences,
        messages,
        isInitialized,
        isLoading,
        error,
        sendMessage,
        loadConversationHistory,
        savePreferences
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUser = () => useContext(UserContext);

export default UserContext;
