import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import { fetchHeadlines, fetchFromPublication, fetchByTopic } from '../services/api';

// Create News Context
export const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  // Get user preferences from UserContext
  const { preferences } = useContext(UserContext);
  
  // News state
  const [headlines, setHeadlines] = useState([]);
  const [activeCategory, setActiveCategory] = useState('headlines');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load initial headlines based on preferences
  useEffect(() => {
    if (preferences) {
      loadInitialContent();
    }
  }, [preferences]);
  
  // Load content based on category change
  useEffect(() => {
    handleCategoryChange(activeCategory);
  }, [activeCategory]);
  
  // Load initial content based on user preferences
  const loadInitialContent = async () => {
    setIsLoading(true);
    try {
      // If user has favorite topics, load the first one
      if (preferences.favorite_topics && preferences.favorite_topics.length > 0) {
        const topic = preferences.favorite_topics[0];
        const topicData = await fetchByTopic(topic);
        setHeadlines(topicData.articles);
        setActiveCategory(topic);
      } 
      // Otherwise, load headlines for their region
      else {
        const headlinesData = await fetchHeadlines(preferences.region || 'us');
        setHeadlines(headlinesData.headlines);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading initial content:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle category change
  const handleCategoryChange = async (category) => {
    if (category === activeCategory && headlines.length > 0) return;
    
    setIsLoading(true);
    try {
      let data;
      
      // Handle predefined categories
      if (['headlines', 'world', 'politics', 'business', 'technology'].includes(category)) {
        const categoryMap = {
          'headlines': '',
          'world': 'general',
          'politics': 'politics',
          'business': 'business',
          'technology': 'technology'
        };
        
        data = await fetchHeadlines(preferences.region || 'us', categoryMap[category]);
        setHeadlines(data.headlines);
      } 
      // Handle publications
      else if (['cnn', 'bbc', 'wall street journal'].includes(category)) {
        data = await fetchFromPublication(category);
        setHeadlines(data.articles);
      } 
      // Handle topics
      else {
        data = await fetchByTopic(category);
        setHeadlines(data.articles);
      }
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${category}:`, err);
      setError(`Failed to load ${category} news. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Search for news
  const searchNews = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await fetchByTopic(query);
      setHeadlines(data.articles);
      setActiveCategory(`search: ${query}`);
      setError(null);
    } catch (err) {
      console.error(`Error searching for "${query}":`, err);
      setError(`Failed to search for "${query}". Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <NewsContext.Provider value={{
      headlines,
      activeCategory,
      isLoading,
      error,
      setActiveCategory,
      handleCategoryChange,
      searchNews
    }}>
      {children}
    </NewsContext.Provider>
  );
};

// Custom hook for using News Context
export const useNews = () => useContext(NewsContext);

export default NewsContext;