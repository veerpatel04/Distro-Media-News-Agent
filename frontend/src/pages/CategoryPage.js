import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  Header, 
  NewsCard,
  PreferencesModal
} from '../components';
import { useUser } from '../context/UserContext';
import { useNews } from '../context/NewsContext';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  // Get user data from context
  const { preferences, savePreferences } = useUser();
  
  // Get news data from context
  const { 
    headlines, 
    activeCategory, 
    isLoading, 
    handleCategoryChange, 
    setActiveCategory 
  } = useNews();
  
  // State for preferences modal
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);
  
  // Load category headlines on mount
  useEffect(() => {
    if (category) {
      // Check if category is valid
      const validCategories = ['world', 'politics', 'business', 'technology'];
      if (validCategories.includes(category)) {
        setActiveCategory(category);
        handleCategoryChange(category);
      } else {
        // Navigate back to home if category is invalid
        navigate('/');
      }
    }
  }, [category, handleCategoryChange, setActiveCategory, navigate]);
  
  // Handle category change from sidebar
  const onCategoryChange = (newCategory) => {
    if (newCategory === category) return;
    
    if (newCategory === 'headlines') {
      navigate('/');
    } else if (['world', 'politics', 'business', 'technology'].includes(newCategory)) {
      navigate(`/category/${newCategory}`);
    } else if (['cnn', 'bbc', 'wall street journal'].includes(newCategory)) {
      const formattedPub = newCategory.replace(/\s+/g, '-');
      navigate(`/publication/${formattedPub}`);
    } else if (newCategory === 'saved') {
      navigate('/saved');
    } else {
      setActiveCategory(newCategory);
    }
  };
  
  // Handle preferences save
  const handleSavePreferences = async (newPreferences) => {
    await savePreferences(newPreferences);
    setPreferencesOpen(false);
  };
  
  // Format category name for display
  const formatCategoryName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        activeCategory={category}
        onCategoryChange={onCategoryChange}
        onOpenPreferences={() => setPreferencesOpen(true)}
      />
      
      {/* Main Content */}
      <div className="main-content">
        <Header 
          pageTitle={`${formatCategoryName(category)} News`}
          onOpenPreferences={() => setPreferencesOpen(true)}
        />
        
        <div className="news-feed">
          {isLoading ? (
            <div className="loading-indicator">Loading {formatCategoryName(category)} news...</div>
          ) : headlines.length > 0 ? (
            headlines.map((article, index) => (
              <NewsCard 
                key={index}
                article={article}
                topics={article.section ? [article.section] : undefined}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No {formatCategoryName(category)} news available at the moment.</p>
              <p>Try refreshing or checking another category.</p>
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

export default CategoryPage;