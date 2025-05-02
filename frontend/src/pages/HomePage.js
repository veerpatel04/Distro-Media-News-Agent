import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChatContainer, 
  Sidebar, 
  Header, 
  HeadlinePreview, 
  NewsCard,
  PreferencesModal
} from '../components';
import { useUser } from '../context/UserContext';
import { useNews } from '../context/NewsContext';

const HomePage = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  
  // Get user data from context
  const { 
    messages, 
    isLoading: userLoading, 
    sendMessage, 
    preferences,
    savePreferences
  } = useUser();
  
  // Get news data from context
  const { 
    headlines, 
    activeCategory, 
    isLoading: newsLoading, 
    setActiveCategory 
  } = useNews();
  
  // State for input and preferences modal
  const [inputValue, setInputValue] = React.useState('');
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);
  
  // Scroll to bottom of chat when messages change
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || userLoading) return;
    
    const userMessage = inputValue;
    setInputValue('');
    
    // Send message to backend
    const response = await sendMessage(userMessage);
    
    // Navigate to appropriate page based on user query
    if (response) {
      // Check for category queries
      const categories = ['world', 'politics', 'business', 'technology'];
      for (const category of categories) {
        if (userMessage.toLowerCase().includes(category)) {
          navigate(`/category/${category}`);
          break;
        }
      }
      
      // Check for publication queries
      const publications = ['wall street journal', 'new york times', 'bbc', 'cnn', 'fox news'];
      for (const pub of publications) {
        if (userMessage.toLowerCase().includes(pub)) {
          const formattedPub = pub.replace(/\s+/g, '-');
          navigate(`/publication/${formattedPub}`);
          break;
        }
      }
    }
  };
  
  // Handle keypress for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    if (category === 'saved') {
      navigate('/saved');
    } else if (['world', 'politics', 'business', 'technology'].includes(category)) {
      navigate(`/category/${category}`);
    } else if (['cnn', 'bbc', 'wall street journal'].includes(category)) {
      const formattedPub = category.replace(/\s+/g, '-');
      navigate(`/publication/${formattedPub}`);
    } else {
      setActiveCategory(category);
    }
  };
  
  // Handle preferences save
  const handleSavePreferences = async (newPreferences) => {
    await savePreferences(newPreferences);
    setPreferencesOpen(false);
  };
  
  const isLoading = userLoading || newsLoading;
  
  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onOpenPreferences={() => setPreferencesOpen(true)}
      />
      
      {/* Main Content */}
      <div className="main-content">
        <Header 
          pageTitle={`${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} News`}
          onOpenPreferences={() => setPreferencesOpen(true)}
        />
        
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          chatEndRef={chatEndRef}
        >
          {/* Show headlines preview after assistant messages */}
          {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && headlines.length > 0 && (
            <HeadlinePreview headlines={headlines.slice(0, 3)} />
          )}
          
          {/* Show full articles after headlines are mentioned */}
          {activeCategory && headlines.length > 0 && (
            <div className="news-feed">
              {headlines.map((article, index) => (
                <NewsCard 
                  key={index}
                  article={article}
                  topics={article.section ? [article.section] : undefined}
                />
              ))}
            </div>
          )}
        </ChatContainer>
        
        {/* Chat Input */}
        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about news or request specific updates..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage} 
            className="send-button"
            disabled={isLoading}
          >
            {isLoading ? '...' : '➤'}
          </button>
        </div>
      </div>
      
      {/* Preferences Modal */}
      {preferencesOpen && (
        <PreferencesModal
          preferences={preferences}
          onSave={handleSavePreferences}
          onClose={() => setPreferencesOpen(false)}
        />
      )}
    </div>
  );
};

export default HomePage;