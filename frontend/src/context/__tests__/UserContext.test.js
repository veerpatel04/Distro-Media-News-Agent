import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserProvider, useUser } from '../UserContext';

// Mock the API service
jest.mock('../../services/api', () => ({
  initializeSession: jest.fn(() => Promise.resolve({ 
    success: true, 
    message: 'Welcome to News Agent!' 
  })),
  processRequest: jest.fn(() => Promise.resolve({ 
    success: true, 
    response: 'Here are the latest headlines' 
  })),
  getConversationHistory: jest.fn(() => Promise.resolve({
    success: true,
    history: [
      { role: 'assistant', content: 'Welcome to News Agent!' },
      { role: 'user', content: 'Show me the latest news' },
      { role: 'assistant', content: 'Here are the latest headlines' }
    ]
  })),
  updatePreferences: jest.fn(() => Promise.resolve({
    success: true,
    message: 'Preferences updated successfully'
  }))
}));

// Test component to access context
const TestComponent = () => {
  const userContext = useUser();
  
  return (
    <div>
      <div data-testid="userId">{userContext.userId}</div>
      <div data-testid="isInitialized">{userContext.isInitialized.toString()}</div>
      <div data-testid="isLoading">{userContext.isLoading.toString()}</div>
      <div data-testid="error">{userContext.error || 'no error'}</div>
      <button 
        data-testid="sendMessage" 
        onClick={() => userContext.sendMessage('Test message')}
      >
        Send
      </button>
      <button 
        data-testid="loadHistory" 
        onClick={userContext.loadConversationHistory}
      >
        Load History
      </button>
      <button 
        data-testid="savePreferences" 
        onClick={() => userContext.savePreferences({ favorite_topics: ['test'] })}
      >
        Save Preferences
      </button>
      <div data-testid="messageCount">{userContext.messages.length}</div>
      {userContext.messages.map((msg, index) => (
        <div key={index} data-testid={`message-${index}`}>
          {msg.role}: {msg.content}
        </div>
      ))}
    </div>
  );
};

describe('UserContext', () => {
  // Mock localStorage
  const localStorageMock = (function() {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });
  
  test('initializes with default values and calls initializeSession', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Check if userId is generated
    expect(screen.getByTestId('userId')).toHaveTextContent(/^user-/);
    
    // Check if isInitialized becomes true after initialization
    await waitFor(() => {
      expect(screen.getByTestId('isInitialized')).toHaveTextContent('true');
    });
    
    // Check if welcome message is added to messages
    await waitFor(() => {
      expect(screen.getByTestId('messageCount')).toHaveTextContent('1');
      expect(screen.getByTestId('message-0')).toHaveTextContent('assistant: Welcome to News Agent!');
    });
  });
  
  test('sendMessage adds user message and calls processRequest', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('isInitialized')).toHaveTextContent('true');
    });
    
    // Send a message
    await act(async () => {
      screen.getByTestId('sendMessage').click();
    });
    
    // Check if isLoading is set to false after request
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    
    // Check if user message and response are added to messages
    await waitFor(() => {
      expect(screen.getByTestId('messageCount')).toHaveTextContent('3');
      expect(screen.getByTestId('message-1')).toHaveTextContent('user: Test message');
      expect(screen.getByTestId('message-2')).toHaveTextContent('assistant: Here are the latest headlines');
    });
  });
  
  test('loadConversationHistory loads messages from API', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('isInitialized')).toHaveTextContent('true');
    });
    
    // Load conversation history
    await act(async () => {
      screen.getByTestId('loadHistory').click();
    });
    
    // Check if messages are loaded
    await waitFor(() => {
      expect(screen.getByTestId('messageCount')).toHaveTextContent('3');
      expect(screen.getByTestId('message-0')).toHaveTextContent('assistant: Welcome to News Agent!');
      expect(screen.getByTestId('message-1')).toHaveTextContent('user: Show me the latest news');
      expect(screen.getByTestId('message-2')).toHaveTextContent('assistant: Here are the latest headlines');
    });
  });
  
  test('savePreferences updates preferences and adds confirmation message', async () => {
    const { initializeSession, updatePreferences } = require('../../services/api');
    
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Wait for initialization
    await waitFor(() => {
      expect(initializeSession).toHaveBeenCalled();
    });
    
    // Save preferences
    await act(async () => {
      screen.getByTestId('savePreferences').click();
    });
    
    // Check if updatePreferences API is called
    expect(updatePreferences).toHaveBeenCalledWith(
      expect.any(String),
      { favorite_topics: ['test'] }
    );
    
    // Check if confirmation message is added
    await waitFor(() => {
      const lastMessageIndex = parseInt(screen.getByTestId('messageCount').textContent) - 1;
      expect(screen.getByTestId(`message-${lastMessageIndex}`)).toHaveTextContent(/updated your preferences/);
    });
    
    // Check if localStorage is updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'newsAgentPreferences',
      expect.any(String)
    );
  });
});