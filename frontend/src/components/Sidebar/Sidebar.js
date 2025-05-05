import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeCategory, onCategoryChange, onOpenPreferences }) => {
  const categories = [
    { id: 'headlines', name: 'Headlines', icon: '🔥' },
    { id: 'world', name: 'World', icon: '🌍' },
    { id: 'politics', name: 'Politics', icon: '🏛️' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'technology', name: 'Technology', icon: '💻' }
  ];
  
  const mySources = [
    { id: 'cnn', name: 'CNN', icon: '📱' },
    { id: 'bbc', name: 'BBC', icon: '📱' },
    { id: 'wall street journal', name: 'Wall Street Journal', icon: '📱' }
  ];
  
  const myCategories = [
    { id: 'saved', name: 'Saved Stories', icon: '🔖' },
    { id: 'history', name: 'History', icon: '📋' },
    { id: 'for-you', name: 'For You', icon: '🎯' }
  ];
  
  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">📰</div>
        <div className="logo-text">News Agent</div>
      </div>
      
      <div className="nav-section">
        <div className="section-title">Discover</div>
        {categories.map(category => (
          <div 
            key={category.id}
            className={`nav-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <div className="nav-icon">{category.icon}</div>
            {category.name}
          </div>
        ))}
      </div>
      
      <div className="nav-section">
        <div className="section-title">My News</div>
        {myCategories.map(category => (
          <div 
            key={category.id}
            className={`nav-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <div className="nav-icon">{category.icon}</div>
            {category.name}
          </div>
        ))}
      </div>
      
      <div className="nav-section">
        <div className="section-title">Sources</div>
        {mySources.map(source => (
          <div 
            key={source.id}
            className={`nav-item ${activeCategory === source.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(source.id)}
          >
            <div className="nav-icon">{source.icon}</div>
            {source.name}
          </div>
        ))}
      </div>
      
      <div className="preferences" onClick={onOpenPreferences}>
        <div className="preferences-title">Preferences</div>
        <div className="preferences-subtitle">
          Customize your news feed and agent preferences
        </div>
      </div>
    </div>
  );
};

export default Sidebar;