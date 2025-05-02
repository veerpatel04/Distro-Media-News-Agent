import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreferencesModal from './PreferencesModal';

describe('PreferencesModal Component', () => {
  const mockPreferences = {
    favorite_topics: ['technology', 'business'],
    favorite_publications: ['BBC', 'Wall Street Journal'],
    update_frequency: 'daily',
    region: 'us'
  };
  
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders with correct initial values', () => {
    render(
      <PreferencesModal 
        preferences={mockPreferences}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );
    
    // Check if modal title is rendered
    expect(screen.getByText('News Preferences')).toBeInTheDocument();
    
    // Check if region select has correct value
    expect(screen.getByDisplayValue('United States')).toBeInTheDocument();
    
    // Check if update frequency select has correct value
    expect(screen.getByDisplayValue('Daily')).toBeInTheDocument();
    
    // Check if favorite topics checkboxes are checked
    const techCheckbox = screen.getByLabelText('Technology');
    const businessCheckbox = screen.getByLabelText('Business');
    expect(techCheckbox).toBeChecked();
    expect(businessCheckbox).toBeChecked();
    
    // Check if favorite publications checkboxes are checked
    const bbcCheckbox = screen.getByLabelText('BBC');
    const wsjCheckbox = screen.getByLabelText('Wall Street Journal');
    expect(bbcCheckbox).toBeChecked();
    expect(wsjCheckbox).toBeChecked();
  });
  
  test('handles form submission correctly', () => {
    render(
      <PreferencesModal 
        preferences={mockPreferences}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );
    
    // Change region
    const regionSelect = screen.getByLabelText('Region');
    fireEvent.change(regionSelect, { target: { value: 'gb' } });
    
    // Change update frequency
    const frequencySelect = screen.getByLabelText('Update Frequency');
    fireEvent.change(frequencySelect, { target: { value: 'hourly' } });
    
    // Uncheck a topic
    const businessCheckbox = screen.getByLabelText('Business');
    fireEvent.click(businessCheckbox);
    
    // Check a new topic
    const sportsCheckbox = screen.getByLabelText('Sports');
    fireEvent.click(sportsCheckbox);
    
    // Submit the form
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated preferences
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      favorite_topics: ['technology', 'sports'], // business removed, sports added
      favorite_publications: ['BBC', 'Wall Street Journal'],
      update_frequency: 'hourly', // changed from daily
      region: 'gb' // changed from us
    });
  });
  
  test('handles close button correctly', () => {
    render(
      <PreferencesModal 
        preferences={mockPreferences}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );
    
    // Click the close button
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    // Check that onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  test('handles cancel button correctly', () => {
    render(
      <PreferencesModal 
        preferences={mockPreferences}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );
    
    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    // Check that onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  test('handles checkbox toggling correctly', () => {
    render(
      <PreferencesModal 
        preferences={mockPreferences}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );
    
    // Toggle existing favorite topic off
    const techCheckbox = screen.getByLabelText('Technology');
    fireEvent.click(techCheckbox);
    expect(techCheckbox).not.toBeChecked();
    
    // Toggle new favorite topic on
    const sportsCheckbox = screen.getByLabelText('Sports');
    fireEvent.click(sportsCheckbox);
    expect(sportsCheckbox).toBeChecked();
    
    // Toggle existing favorite publication off
    const bbcCheckbox = screen.getByLabelText('BBC');
    fireEvent.click(bbcCheckbox);
    expect(bbcCheckbox).not.toBeChecked();
    
    // Toggle new favorite publication on
    const cnnCheckbox = screen.getByLabelText('CNN');
    fireEvent.click(cnnCheckbox);
    expect(cnnCheckbox).toBeChecked();
    
    // Submit the form
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);
    
    // Check if onSave was called with correctly updated preferences
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      favorite_topics: ['business', 'sports'], // technology removed, sports added
      favorite_publications: ['Wall Street Journal', 'CNN'] // BBC removed, CNN added
    }));
  });
});