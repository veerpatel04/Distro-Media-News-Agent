import React from 'react';
import './ChatContainer.css';

const ChatContainer = ({ messages, isLoading, chatEndRef, children }) => {
  // Format message content with links and line breaks
  const formatMessage = (content) => {
    if (!content) return '';
    
    // Replace URLs with clickable links
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const withLinks = content.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    
    // Replace newlines with br tags
    return withLinks.replace(/\n/g, '<br />');
  };
  
  return (
    <div className="chat-dialog">
      {/* Messages */}
      {messages.map((message, index) => (
        <div 
          key={index}
          className={`chat-message ${message.role === 'user' ? 'user-message' : 'agent-message'}`}
        >
          <div 
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        </div>
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="chat-message agent-message">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      {/* Children (headlines, news cards, etc.) */}
      {children}
      
      {/* Invisible element to scroll to */}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatContainer;