import React, { useState } from 'react';
import './Header.css';

const Header = ({ pageTitle, onOpenPreferences }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    // This would typically trigger a search action
    console.log('Searching for:', searchQuery);
    // Clear the search field
    setSearchQuery('');
  };
  
  return (
    <div className="header">
      <div className="page-title">{pageTitle}</div>
      
      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search for news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-icon">🔍</button>
      </form>
      
      <div className="user-menu">
        <div className="user-settings" onClick={onOpenPreferences}>
          <span className="settings-icon">⚙️</span>
        </div>
        <div className="user-avatar">
          <span>JS</span>
        </div>
      </div>
    </div>
  );
};

export default Header;