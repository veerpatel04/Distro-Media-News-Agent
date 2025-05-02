import React from 'react';
import './HeadlinePreview.css';

const HeadlinePreview = ({ headlines }) => {
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
  
  return (
    <div className="headline-preview">
      {headlines.map((headline, index) => (
        <div key={index} className="headline-card">
          <div 
            className="headline-image" 
            style={{ 
              backgroundImage: headline.imageUrl 
                ? `url(${headline.imageUrl})` 
                : `url('/api/placeholder/250/120')`
            }}
          />
          <div className="headline-content">
            <div className="headline-title">{headline.title}</div>
            <div className="headline-source">
              {headline.source} • {formatDate(headline.publishedAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeadlinePreview;