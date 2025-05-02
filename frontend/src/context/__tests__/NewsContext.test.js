import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewsProvider, useNews } from '../NewsContext';
import { UserProvider } from '../UserContext';

// Mock the API service
jest.mock('../../services/api', () => ({
  fetchHeadlines: jest.fn(() => Promise.resolve({ 
    success: true, 
    headlines: [
      { 
        title: 'Test Headline 1', 
        description: 'Test Description 1',
        source: 'Test Source',
        publishedAt: new Date().toISOString()
      },
      { 
        title: 'Test Headline 2', 
        description: 'Test Description 2',
        source: 'Test Source',
        publishedAt: new Date().toISOString()
      }
    ] 
  })),
  fetchFromPublication: jest.fn(() => Promise.resolve({ 
    success: true, 
    articles: [
      { 
        title: 'Test Publication Article 1', 
        description: 'Test Description 1',
        source: 'Test Publication',
        publishedAt: new Date().toISOString()
      }
    ] 
  })),
  fetchByTopic: jest.fn(() => Promise.resolve({ 
    success: true, 
    articles: [
      { 
        title: 'Test Topic Article 1', 
        description: 'Test Description 1',
        source: 'Test Source',
        publishedAt: new Date().toISOString()
      }
    ] 
  }))
}));

// Mock the UserContext
jest.mock('../UserContext', () => {
  const actual = jest.requireActual('../UserContext');
  return {
    ...actual,
    useUser: () => ({
      preferences: {
        favorite_topics: ['technology'],
        favorite_publications: ['BBC'],
        update_frequency: 'daily',
        region: 'us'
      }
    })
  };
});

// Test component to access context
const TestComponent = () => {
  const newsContext = useNews();
  
  return (
    <div>
      <div data-testid="activeCategory">{newsContext.activeCategory}</div>
      <div data-testid="isLoading">{newsContext.isLoading.toString()}</div>
      <div data-testid="error">{newsContext.error || 'no error'}</div>
      <button 
        data-testid="changeCategory" 
        onClick={() => newsContext.setActiveCategory('technology')}
      >
        Change Category
      </button>
      <button 
        data-testid="handleCategoryChange" 
        onClick={() => newsContext.handleCategoryChange('business')}
      >
        Handle Category Change
      </button>
      <button 
        data-testid="searchNews" 
        onClick={() => newsContext.searchNews('climate change')}
      >
        Search News
      </button>
      <div data-testid="headlineCount">{newsContext.headlines.length}</div>
      {newsContext.headlines.map((headline, index) => (
        <div key={index} data-testid={`headline-${index}`}>
          {headline.title}
        </div>
      ))}
    </div>
  );
};

describe('NewsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('initializes with default values and loads content based on preferences', async () => {
    const { fetchByTopic } = require('../../services/api');
    
    render(
      <UserProvider>
        <NewsProvider>
          <TestComponent />
        </NewsProvider>
      </UserProvider>
    );
    
    // Check if initial category is 'headlines'
    expect(screen.getByTestId('activeCategory')).toHaveTextContent('headlines');
    
    // Check if loadInitialContent is called and loads content based on preferences
    await waitFor(() => {
      expect(fetchByTopic).toHaveBeenCalledWith('technology');
    });
    
    // Check if headlines are loaded
    await waitFor(() => {
      expect(screen.getByTestId('headlineCount')).not.toHaveTextContent('0');
      expect(screen.getByTestId('activeCategory')).toHaveTextContent('technology');
    });
  });
  
  test('setActiveCategory updates activeCategory and triggers handleCategoryChange', async () => {
    const { fetchByTopic } = require('../../services/api');
    
    render(
      <UserProvider>
        <NewsProvider>
          <TestComponent />
        </NewsProvider>
      </UserProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
    
    // Change category
    await act(async () => {
      screen.getByTestId('changeCategory').click();
    });
    
    // Check if category is updated
    expect(screen.getByTestId('activeCategory')).toHaveTextContent('technology');
    
    // Check if handleCategoryChange is called
    expect(fetchByTopic).toHaveBeenCalledWith('technology');
  });
  
  test('handleCategoryChange fetches headlines for predefined categories', async () => {
    const { fetchHeadlines } = require('../../services/api');
    
    render(
      <UserProvider>
        <NewsProvider>
          <TestComponent />
        </NewsProvider>
      </UserProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
    
    // Handle category change
    await act(async () => {
      screen.getByTestId('handleCategoryChange').click();
    });
    
    // Check if fetchHeadlines is called with correct parameters
    expect(fetchHeadlines).toHaveBeenCalledWith('us', 'business');
    
    // Check if headlines are updated
    await waitFor(() => {
      expect(screen.getByTestId('headlineCount')).toHaveTextContent('2');
      expect(screen.getByTestId('headline-0')).toHaveTextContent('Test Headline 1');
      expect(screen.getByTestId('headline-1')).toHaveTextContent('Test Headline 2');
    });
  });
  
  test('searchNews fetches articles by topic', async () => {
    const { fetchByTopic } = require('../../services/api');
    
    render(
      <UserProvider>
        <NewsProvider>
          <TestComponent />
        </NewsProvider>
      </UserProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
    
    // Search for news
    await act(async () => {
      screen.getByTestId('searchNews').click();
    });
    
    // Check if fetchByTopic is called with correct parameters
    expect(fetchByTopic).toHaveBeenCalledWith('climate change');
    
    // Check if category is updated
    expect(screen.getByTestId('activeCategory')).toHaveTextContent('search: climate change');
    
    // Check if headlines are updated
    await waitFor(() => {
      expect(screen.getByTestId('headlineCount')).toHaveTextContent('1');
      expect(screen.getByTestId('headline-0')).toHaveTextContent('Test Topic Article 1');
    });
  });
  
  test('handles errors when fetching content', async () => {
    const { fetchHeadlines } = require('../../services/api');
    
    // Mock fetchHeadlines to throw an error
    fetchHeadlines.mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch headlines'))
    );
    
    render(
      <UserProvider>
        <NewsProvider>
          <TestComponent />
        </NewsProvider>
      </UserProvider>
    );
    
    // Wait for initial loading to complete and error to be set
    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).not.toHaveTextContent('no error');
    });
    
    // Check if error is displayed
    expect(screen.getByTestId('error')).toHaveTextContent(/Failed to load/);
  });
  
  test('handles undefined or empty data from API', async () => {
    const { fetchHeadlines } = require('../../services/api');
    
    // Mock fetchHeadlines to return empty data
    fetchHeadlines.mockImplementationOnce(() => 
      Promise.resolve({ 
        success: true, 
        headlines: [] 
      })
    );
    
    render(
      <UserProvider>
        <NewsProvider>
          <TestComponent />
        </NewsProvider>
      </UserProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
    
    // Handle category change to trigger fetchHeadlines with empty data
    await act(async () => {
      screen.getByTestId('handleCategoryChange').click();
    });
    
    // Check if headlines array is empty
    expect(screen.getByTestId('headlineCount')).toHaveTextContent('0');
  });
});