import React from 'react';
import TopicBadge from '../TopicBadge/TopicBadge';
import './NewsCard.css';

const NewsCard = ({ article, topics = [] }) => {
  // Format the published date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      const options = { month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    }
  };
  
  // Extract topics if not provided
  const derivedTopics = topics.length > 0 
    ? topics 
    : article.section 
      ? [article.section] 
      : article.description?.split(' ').slice(0, 3).map(word => word.replace(/[^\w]/g, '')) || [];
  
  return (
    <div className="news-card">
      <div className="news-source">
        {article.source} <span className="news-date">• {formatDate(article.publishedAt)}</span>
      </div>
      
      <div className="news-title">{article.title}</div>
      
      {/* Topic badges */}
      <div className="topic-badges">
        {derivedTopics.slice(0, 3).map((topic, index) => (
          <TopicBadge key={index} topic={topic} />
        ))}
      </div>
      
      <div className="news-preview">
        {article.description || 'No description available.'}
      </div>
      
      <div className="news-actions">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="action-button primary-button"
        >
          Read Full Story
        </a>
        <button className="action-button secondary-button">
          Save for Later
        </button>
      </div>
    </div>
  );
};

export default NewsCard;