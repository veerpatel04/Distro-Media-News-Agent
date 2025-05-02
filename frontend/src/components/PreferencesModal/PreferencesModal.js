import React, { useState } from 'react';
import './PreferencesModal.css';

const PreferencesModal = ({ preferences, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    favorite_topics: [...preferences.favorite_topics],
    favorite_publications: [...preferences.favorite_publications],
    update_frequency: preferences.update_frequency,
    region: preferences.region
  });
  
  // Available options for select fields
  const regions = [
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'in', label: 'India' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
    { value: 'global', label: 'Global (All Regions)' }
  ];
  
  const frequencies = [
    { value: 'realtime', label: 'Real-time (As soon as available)' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];
  
  const availableTopics = [
    'Politics', 'Business', 'Technology', 'Health', 'Science', 
    'Sports', 'Entertainment', 'World', 'Environment', 'Education', 
    'Economy', 'Arts', 'Travel', 'Food', 'Fashion'
  ];
  
  const availablePublications = [
    'BBC', 'CNN', 'Wall Street Journal', 'New York Times', 'Washington Post',
    'The Guardian', 'Reuters', 'Associated Press', 'Bloomberg', 'CNBC',
    'The Economist', 'Al Jazeera', 'NPR', 'Fox News', 'NBC News'
  ];
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle checkboxes for multi-select options
  const handleCheckboxChange = (name, value) => {
    const currentValues = formData[name];
    
    // If already selected, remove it
    if (currentValues.includes(value)) {
      setFormData({
        ...formData,
        [name]: currentValues.filter(item => item !== value)
      });
    } 
    // Otherwise, add it
    else {
      setFormData({
        ...formData,
        [name]: [...currentValues, value]
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="modal-overlay">
      <div className="preferences-modal">
        <div className="modal-header">
          <h2>News Preferences</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label>Region</label>
            <select 
              name="region" 
              value={formData.region} 
              onChange={handleChange}
            >
              {regions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-section">
            <label>Update Frequency</label>
            <select 
              name="update_frequency" 
              value={formData.update_frequency} 
              onChange={handleChange}
            >
              {frequencies.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-section">
            <label>Favorite Topics</label>
            <div className="checkbox-grid">
              {availableTopics.map(topic => (
                <div key={topic} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`topic-${topic}`}
                    checked={formData.favorite_topics.includes(topic.toLowerCase())}
                    onChange={() => handleCheckboxChange('favorite_topics', topic.toLowerCase())}
                  />
                  <label htmlFor={`topic-${topic}`}>{topic}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-section">
            <label>Favorite Publications</label>
            <div className="checkbox-grid">
              {availablePublications.map(pub => (
                <div key={pub} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`pub-${pub}`}
                    checked={formData.favorite_publications.includes(pub)}
                    onChange={() => handleCheckboxChange('favorite_publications', pub)}
                  />
                  <label htmlFor={`pub-${pub}`}>{pub}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesModal;