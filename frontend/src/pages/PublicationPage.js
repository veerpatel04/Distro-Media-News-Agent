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
import { fetchFromPublication } from '../services/api';

const PublicationPage = () => {
  const { publication } = useParams();
  const navigate = useNavigate();
  
  // Get user data from context
  const { preferences, savePreferences } = useUser();
  
  // Get news data from context
  const { setActiveCategory } = useNews();
  
  // Local state
  const [articles, setArticles] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);
  
  // Format publication name
  const formatPublicationName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Load publication articles on mount
  useEffect(() => {
    if (publication) {
      // Convert hyphenated publication name to regular form
      const pubName = publication.replace(/-/g, ' ');
      
      // Check if publication is valid
      const validPublications = ['wall street journal', 'new york times', 'bbc', 'cnn', 'fox news'];
      const normalizedPubName = pubName.toLowerCase();
      
      if (validPublications.some(p => p === normalizedPubName || normalizedPubName.includes(p))) {
        loadPublicationNews(pubName);
      } else {
        // Navigate back to home if publication is invalid
        navigate('/');
      }
    }
  }, [publication, navigate]);
  
  // Load news for the publication
  const loadPublicationNews = async (pubName) => {
    setIsLoading(true);
    try {
      const data = await fetchFromPublication(pubName);
      if (data.success) {
        setArticles(data.articles);
        setActiveCategory(pubName.toLowerCase());
      } else {
        setError('Failed to load publication news.');
      }
    } catch (err) {
      console.error(`Error fetching from ${pubName}:`, err);
      setError(`Failed to load news from ${pubName}.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle category change from sidebar
  const handleCategoryChange = (category) => {
    if (category === 'headlines') {
      navigate('/');
    } else if (['world', 'politics', 'business', 'technology'].includes(category)) {
      navigate(`/category/${category}`);
    } else if (['cnn', 'bbc', 'wall street journal'].includes(category)) {
      const formattedPub = category.replace(/\s+/g, '-');
      if (formattedPub === publication) return;
      navigate(`/publication/${formattedPub}`);
    } else if (category === 'saved') {
      navigate('/saved');
    } else {
      setActiveCategory(category);
    }
  };
  
  // Handle preferences save
  const handleSavePreferences = async (newPreferences) => {
    await savePreferences(newPreferences);
    setPreferencesOpen(false);
  };
  
  const formattedPublicationName = formatPublicationName(publication);
  
  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        activeCategory={publication.replace(/-/g, ' ')}
        onCategoryChange={handleCategoryChange}
        onOpenPreferences={() => setPreferencesOpen(true)}
      />
      
      {/* Main Content */}
      <div className="main-content">
        <Header 
          pageTitle={`${formattedPublicationName} News`}
          onOpenPreferences={() => setPreferencesOpen(true)}
        />
        
        <div className="news-feed">
          {isLoading ? (
            <div className="loading-indicator">Loading {formattedPublicationName} news...</div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <p>Try refreshing or checking another publication.</p>
            </div>
          ) : articles.length > 0 ? (
            articles.map((article, index) => (
              <NewsCard 
                key={index}
                article={article}
                topics={article.section ? [article.section] : undefined}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No news available from {formattedPublicationName} at the moment.</p>
              <p>Try refreshing or checking another publication.</p>
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

export default PublicationPage;