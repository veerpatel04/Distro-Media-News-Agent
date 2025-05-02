import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

describe('Header Component', () => {
  const mockPageTitle = 'Test Page Title';
  const mockOnOpenPreferences = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders correctly with title', () => {
    render(
      <Header 
        pageTitle={mockPageTitle} 
        onOpenPreferences={mockOnOpenPreferences} 
      />
    );
    
    // Check if title is rendered
    expect(screen.getByText(mockPageTitle)).toBeInTheDocument();
    
    // Check if search box is rendered
    expect(screen.getByPlaceholderText('Search for news...')).toBeInTheDocument();
    
    // Check if user menu is rendered
    expect(screen.getByText('JS')).toBeInTheDocument(); // User avatar with initials
  });
  
  test('handles search submission', () => {
    // Mock console.log to test search functionality
    const originalConsoleLog = console.log;
    const mockConsoleLog = jest.fn();
    console.log = mockConsoleLog;
    
    render(
      <Header 
        pageTitle={mockPageTitle} 
        onOpenPreferences={mockOnOpenPreferences} 
      />
    );
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search for news...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    // Submit search
    const searchForm = searchInput.closest('form');
    fireEvent.submit(searchForm);
    
    // Check if console.log was called with search query
    expect(mockConsoleLog).toHaveBeenCalledWith('Searching for:', 'test query');
    
    // Check if search input is cleared after submission
    expect(searchInput.value).toBe('');
    
    // Restore original console.log
    console.log = originalConsoleLog;
  });
  
  test('calls onOpenPreferences when settings icon is clicked', () => {
    render(
      <Header 
        pageTitle={mockPageTitle} 
        onOpenPreferences={mockOnOpenPreferences} 
      />
    );
    
    // Find and click the settings icon
    const settingsIcon = screen.getByText('⚙️');
    fireEvent.click(settingsIcon);
    
    // Check if onOpenPreferences was called
    expect(mockOnOpenPreferences).toHaveBeenCalledTimes(1);
  });
  
  test('handles empty or missing props gracefully', () => {
    // Test with empty page title
    render(
      <Header 
        pageTitle="" 
        onOpenPreferences={mockOnOpenPreferences} 
      />
    );
    
    // Header should still render without errors
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    // Test with missing onOpenPreferences
    render(
      <Header 
        pageTitle={mockPageTitle} 
      />
    );
    
    // Settings icon should still be rendered and not crash when clicked
    const settingsIcon = screen.getByText('⚙️');
    fireEvent.click(settingsIcon);
    // No assertion needed - test would fail if this caused an error
  });
});