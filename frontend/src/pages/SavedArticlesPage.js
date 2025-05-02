import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  Header, 
  NewsCard,
  PreferencesModal
} from '../components';
import { useUser } from '../context/UserContext';
import { useNews } from '../context/NewsContext';

const SavedArticlesPage = () => {
  const navigate = useNavigate();
  
  // Get user data from context
  const { preferences, savePreferences } = useUser();
  
  // Get news data from context
  const { setActiveCategory } = useNews();
  
  // Local state
  const [savedArticles, setSavedArticles] = useState([]);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  
  // Load saved articles from localStorage on mount
  useEffect(() => {
    const loadSavedArticles = () => {
      try {
        const saved = localStorage.getItem('newsAgentSavedArticles');
        if (saved) {
          setSavedArticles(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading saved articles:', err);
      }
    };
    
    loadSavedArticles();
    setActiveCategory('saved');
  }, [setActiveCategory]);
  
  // Handle removing an article from saved
  const handleRemoveArticle = (articleUrl) => {
    const updatedArticles = savedArticles.filter(article => article.url !== articleUrl);
    setSavedArticles(updatedArticles);
    localStorage.setItem('newsAgentSavedArticles', JSON.stringify(updatedArticles));
  };
  
  // Handle category change from sidebar
  const handleCategoryChange = (category) => {
    if (category === 'saved') return;
    
    if (category === 'headlines') {
      navigate('/');
    } else if (['world', 'politics', 'business', 'technology'].includes(category)) {
      navigate(`/category/${category}`);
    } else if (['cnn', 'bbc', 'wall street journal'].includes(category)) {
      const formattedPub = category.replace(/\s+/g, '-');
      navigate(`/publication/${formattedPub}`);
    } else {
      setActiveCategory(category);
      navigate('/');
    }
  };
  
  // Handle preferences save
  const handleSavePreferences = async (newPreferences) => {
    await savePreferences(newPreferences);
    setPreferencesOpen(false);
  };
  
  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        activeCategory="saved"
        onCategoryChange={handleCategoryChange}
        onOpenPreferences={() => setPreferencesOpen(true)}
      />
      
      {/* Main Content */}
      <div className="main-content">
        <Header 
          pageTitle="Saved Articles"
          onOpenPreferences={() => setPreferencesOpen(true)}
        />
        
        <div className="news-feed">
          {savedArticles.length > 0 ? (
            savedArticles.map((article, index) => (
              <NewsCard 
                key={index}
                article={article}
                topics={article.section ? [article.section] : undefined}
                onRemove={() => handleRemoveArticle(article.url)}
                isSaved={true}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No Saved Articles</h3>
              <p>You haven't saved any articles yet.</p>
              <p>When reading news, click "Save for Later" to add articles to this page.</p>
              <button 
                className="primary-button" 
                onClick={() => navigate('/')}
                style={{ margin: '20px auto', padding: '10px 20px', display: 'block' }}
              >
                Browse Headlines
              </button>
            </div>
          )}
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

export default SavedArticlesPage;