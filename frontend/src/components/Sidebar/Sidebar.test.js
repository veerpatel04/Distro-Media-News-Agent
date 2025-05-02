import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  const mockActiveCategory = 'technology';
  const mockOnCategoryChange = jest.fn();
  const mockOnOpenPreferences = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders logo and sections correctly', () => {
    render(
      <Sidebar 
        activeCategory={mockActiveCategory}
        onCategoryChange={mockOnCategoryChange}
        onOpenPreferences={mockOnOpenPreferences}
      />
    );
    
    // Check if logo is rendered
    expect(screen.getByText('News Agent')).toBeInTheDocument();
    
    // Check if all sections are rendered
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('My News')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();
    
    // Check if preferences section is rendered
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });
  
  test('renders all categories correctly', () => {
    render(
      <Sidebar 
        activeCategory={mockActiveCategory}
        onCategoryChange={mockOnCategoryChange}
        onOpenPreferences={mockOnOpenPreferences}
      />
    );
    
    // Check if all default categories are rendered
    expect(screen.getByText('Headlines')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    
    // Check if "My News" categories are rendered
    expect(screen.getByText('Saved Stories')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('For You')).toBeInTheDocument();
    
    // Check if sources are rendered
    expect(screen.getByText('CNN')).toBeInTheDocument();
    expect(screen.getByText('BBC')).toBeInTheDocument();
    expect(screen.getByText('Wall Street Journal')).toBeInTheDocument();
  });
  
  test('applies active class to current category', () => {
    render(
      <Sidebar 
        activeCategory="technology"
        onCategoryChange={mockOnCategoryChange}
        onOpenPreferences={mockOnOpenPreferences}
      />
    );
    
    // Find all nav items
    const navItems = document.querySelectorAll('.nav-item');
    
    // Find the active category (Technology)
    const activeItem = Array.from(navItems).find(item => 
      item.textContent.includes('Technology')
    );
    
    // Check if it has the active class
    expect(activeItem).toHaveClass('active');
    
    // Check that other items don't have the active class
    const headlinesItem = Array.from(navItems).find(item => 
      item.textContent.includes('Headlines')
    );
    expect(headlinesItem).not.toHaveClass('active');
  });
  
  test('calls onCategoryChange when category is clicked', () => {
    render(
      <Sidebar 
        activeCategory={mockActiveCategory}
        onCategoryChange={mockOnCategoryChange}
        onOpenPreferences={mockOnOpenPreferences}
      />
    );
    
    // Click on a different category
    const worldCategory = screen.getByText('World');
    fireEvent.click(worldCategory);
    
    // Check if onCategoryChange was called with correct argument
    expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
    expect(mockOnCategoryChange).toHaveBeenCalledWith('world');
    
    // Click on a source
    const bbcSource = screen.getByText('BBC');
    fireEvent.click(bbcSource);
    
    // Check if onCategoryChange was called with correct argument
    expect(mockOnCategoryChange).toHaveBeenCalledTimes(2);
    expect(mockOnCategoryChange).toHaveBeenCalledWith('bbc');
  });
  
  test('calls onOpenPreferences when preferences is clicked', () => {
    render(
      <Sidebar 
        activeCategory={mockActiveCategory}
        onCategoryChange={mockOnCategoryChange}
        onOpenPreferences={mockOnOpenPreferences}
      />
    );
    
    // Find and click the preferences section
    const preferencesSection = screen.getByText('Preferences').closest('.preferences');
    fireEvent.click(preferencesSection);
    
    // Check if onOpenPreferences was called
    expect(mockOnOpenPreferences).toHaveBeenCalledTimes(1);
  });
  
  test('handles missing props gracefully', () => {
    // Test with missing onCategoryChange
    render(
      <Sidebar 
        activeCategory={mockActiveCategory}
        onOpenPreferences={mockOnOpenPreferences}
      />
    );
    
    // Click on a category - should not throw error
    const worldCategory = screen.getByText('World');
    fireEvent.click(worldCategory);
    
    // Test with missing activeCategory
    render(
      <Sidebar 
        onCategoryChange={mockOnCategoryChange}
        onOpenPreferences={mockOnOpenPreferences}
      />
    );
    
    // Sidebar should still render without errors
    expect(screen.getByText('News Agent')).toBeInTheDocument();
  });
});