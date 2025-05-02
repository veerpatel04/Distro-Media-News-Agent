import { 
    initializeSession, 
    processRequest, 
    fetchHeadlines, 
    fetchFromPublication, 
    fetchByTopic, 
    updatePreferences 
  } from '../api';
  
  // Mock fetch
  global.fetch = jest.fn();
  
  describe('API Service', () => {
    beforeEach(() => {
      fetch.mockClear();
      
      // Set up fetch mock to return successful response
      fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );
    });
    
    test('initializeSession sends correct request', async () => {
      const userId = 'test-user';
      const preferences = {
        favorite_topics: ['technology'],
        favorite_publications: ['BBC'],
        update_frequency: 'daily',
        region: 'us'
      };
      
      await initializeSession(userId, preferences);
      
      // Check if fetch was called with correct arguments
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/initialize'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ userId, preferences })
        })
      );
    });
    
    test('processRequest sends correct request', async () => {
      const userId = 'test-user';
      const userInput = 'Show me the latest news';
      
      await processRequest(userId, userInput);
      
      // Check if fetch was called with correct arguments
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/request'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ userId, userInput })
        })
      );
    });
    
    test('fetchHeadlines sends correct request with parameters', async () => {
      const country = 'gb';
      const category = 'technology';
      
      await fetchHeadlines(country, category);
      
      // Check if fetch was called with correct arguments
      expect(fetch).toHaveBeenCalledTimes(1);
      const url = new URL(fetch.mock.calls[0][0]);
      expect(url.pathname).toContain('/headlines');
      expect(url.searchParams.get('country')).toBe(country);
      expect(url.searchParams.get('category')).toBe(category);
    });
    
    test('fetchFromPublication sends correct request', async () => {
      const publication = 'wall street journal';
      
      await fetchFromPublication(publication);
      
      // Check if fetch was called with correct arguments
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toContain(`/publication/${encodeURIComponent(publication)}`);
    });
    
    test('fetchByTopic sends correct request with parameters', async () => {
      const topic = 'climate change';
      const language = 'fr';
      
      await fetchByTopic(topic, language);
      
      // Check if fetch was called with correct arguments
      expect(fetch).toHaveBeenCalledTimes(1);
      const url = new URL(fetch.mock.calls[0][0]);
      expect(url.pathname).toContain(`/topic/${encodeURIComponent(topic)}`);
      expect(url.searchParams.get('language')).toBe(language);
    });
    
    test('updatePreferences sends correct request', async () => {
      const userId = 'test-user';
      const preferences = {
        favorite_topics: ['business', 'politics'],
        update_frequency: 'hourly'
      };
      
      await updatePreferences(userId, preferences);
      
      // Check if fetch was called with correct arguments
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/preferences/${encodeURIComponent(userId)}`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ preferences })
        })
      );
    });
    
    test('handles API errors correctly', async () => {
      // Mock fetch to return an error response
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ 
            success: false, 
            error: 'Internal server error' 
          })
        })
      );
      
      // Expect the API call to throw an error
      await expect(fetchHeadlines('us')).rejects.toThrow();
    });
    
    test('handles network errors correctly', async () => {
      // Mock fetch to throw a network error
      fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );
      
      // Expect the API call to throw an error
      await expect(fetchHeadlines('us')).rejects.toThrow('Network error');
    });
  });