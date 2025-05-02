import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatContainer from './ChatContainer';

describe('ChatContainer Component', () => {
  const mockMessages = [
    { role: 'assistant', content: 'Hello! How can I help you today?' },
    { role: 'user', content: 'Show me the latest news' },
    { role: 'assistant', content: 'Here are the latest headlines:' }
  ];
  
  const mockRef = { current: null };
  
  test('renders messages correctly', () => {
    render(
      <ChatContainer 
        messages={mockMessages} 
        isLoading={false} 
        chatEndRef={mockRef}
      />
    );
    
    // Check if all messages are rendered
    expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    expect(screen.getByText('Show me the latest news')).toBeInTheDocument();
    expect(screen.getByText('Here are the latest headlines:')).toBeInTheDocument();
    
    // Check if messages have the correct classes
    const assistantMessages = screen.getAllByText((content, element) => {
      return element.classList.contains('agent-message');
    });
    expect(assistantMessages).toHaveLength(2);
    
    const userMessages = screen.getAllByText((content, element) => {
      return element.classList.contains('user-message');
    });
    expect(userMessages).toHaveLength(1);
  });
  
  test('displays loading indicator when isLoading is true', () => {
    render(
      <ChatContainer 
        messages={mockMessages} 
        isLoading={true} 
        chatEndRef={mockRef}
      />
    );
    
    // Check if the typing indicator is shown
    const typingIndicator = document.querySelector('.typing-indicator');
    expect(typingIndicator).toBeInTheDocument();
  });
  
  test('renders children components', () => {
    render(
      <ChatContainer 
        messages={mockMessages} 
        isLoading={false} 
        chatEndRef={mockRef}
      >
        <div data-testid="test-child">Child Component</div>
      </ChatContainer>
    );
    
    // Check if children are rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
  
  test('formats links correctly', () => {
    const messagesWithLinks = [
      { role: 'assistant', content: 'Check this link: https://example.com' }
    ];
    
    render(
      <ChatContainer 
        messages={messagesWithLinks} 
        isLoading={false} 
        chatEndRef={mockRef}
      />
    );
    
    // Check if the link is rendered as an anchor tag
    const link = screen.getByText('https://example.com');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
  
  test('handles empty messages array', () => {
    render(
      <ChatContainer 
        messages={[]} 
        isLoading={false} 
        chatEndRef={mockRef}
      />
    );
    
    // Check that the component renders without errors
    const container = document.querySelector('.chat-dialog');
    expect(container).toBeInTheDocument();
    expect(container.children.length).toBe(1); // Only the chatEndRef div
  });
});