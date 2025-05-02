import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsCard from './NewsCard';

describe('NewsCard Component', () => {
  const mockArticle = {
    title: 'Test News Title',
    description: 'This is a test news description',
    url: 'https://example.com/news',
    imageUrl: 'https://example.com/image.jpg',
    source: 'Test Source',
    publishedAt: new Date('2023-05-01T12:00:00Z').toISOString(),
    section: 'Technology'
  };
  
  const mockTopics = ['Politics', 'Economy'];
  const mockOnRemove = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders article details correctly', () => {
    render(
      <NewsCard 
        article={mockArticle}
        topics={mockTopics}
      />
    );
    
    // Check if title is rendered
    expect(screen.getByText('Test News Title')).toBeInTheDocument();
    
    // Check if description is rendered
    expect(screen.getByText('This is a test news description')).toBeInTheDocument();
    
    // Check if source is rendered
    expect(screen.getByText(/Test Source/)).toBeInTheDocument();
    
    // Check if topics are rendered
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
    
    // Check if "Read Full Story" link is rendered with correct URL
    const readLink = screen.getByText('Read Full Story');
    expect(readLink).toBeInTheDocument();
    expect(readLink).toHaveAttribute('href', 'https://example.com/news');
    expect(readLink).toHaveAttribute('target', '_blank');
    expect(readLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
  
  test('formats date correctly', () => {
    // Mock current date to ensure consistent test results
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2023-05-01T16:00:00Z').getTime());
    
    render(
      <NewsCard 
        article={mockArticle}
        topics={mockTopics}
      />
    );
    
    // Check if date is formatted correctly (4 hours ago)
    expect(screen.getByText(/4 hours ago/)).toBeInTheDocument();
    
    // Restore original Date.now
    jest.restoreAllMocks();
  });
  
  test('uses derived topics when none provided', () => {
    // Render with no topics provided
    render(
      <NewsCard 
        article={mockArticle}
      />
    );
    
    // Should use section from article as topic
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });
  
  test('shows "Save for Later" button by default', () => {
    render(
      <NewsCard 
        article={mockArticle}
        topics={mockTopics}
      />
    );
    
    // Check if "Save for Later" button is rendered
    expect(screen.getByText('Save for Later')).toBeInTheDocument();
  });
  
  test('shows "Remove" button when isSaved is true', () => {
    render(
      <NewsCard 
        article={mockArticle}
        topics={mockTopics}
        isSaved={true}
        onRemove={mockOnRemove}
      />
    );
    
    // Check if "Remove" button is rendered instead of "Save for Later"
    const removeButton = screen.getByText('Remove');
    expect(removeButton).toBeInTheDocument();
    expect(screen.queryByText('Save for Later')).not.toBeInTheDocument();
    
    // Click the remove button
    fireEvent.click(removeButton);
    
    // Check if onRemove was called
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });
  
  test('handles missing article properties gracefully', () => {
    const incompleteArticle = {
      title: 'Incomplete Article',
      source: 'Test Source'
    };
    
    render(
      <NewsCard 
        article={incompleteArticle}
      />
    );
    
    // Check if title is rendered
    expect(screen.getByText('Incomplete Article')).toBeInTheDocument();
    
    // Check if default "No description available" is shown
    expect(screen.getByText('No description available.')).toBeInTheDocument();
    
    // Check if it still renders without crashing
    const newsCard = document.querySelector('.news-card');
    expect(newsCard).toBeInTheDocument();
  });
});