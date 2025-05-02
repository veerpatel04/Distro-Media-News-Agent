import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeadlinePreview from './HeadlinePreview';

describe('HeadlinePreview Component', () => {
  const mockHeadlines = [
    {
      title: 'Test Headline 1',
      imageUrl: 'http://example.com/image1.jpg',
      source: 'Test Source 1',
      publishedAt: new Date('2023-05-01T12:00:00Z').toISOString()
    },
    {
      title: 'Test Headline 2',
      imageUrl: 'http://example.com/image2.jpg',
      source: 'Test Source 2',
      publishedAt: new Date('2023-05-01T14:00:00Z').toISOString()
    },
    {
      title: 'Test Headline 3',
      imageUrl: null, // Missing image URL
      source: 'Test Source 3',
      publishedAt: new Date('2023-05-01T16:00:00Z').toISOString()
    }
  ];
  
  test('renders correct number of headlines', () => {
    render(<HeadlinePreview headlines={mockHeadlines} />);
    
    // Check if all headlines are rendered
    const headlineCards = document.querySelectorAll('.headline-card');
    expect(headlineCards).toHaveLength(3);
  });
  
  test('renders headline content correctly', () => {
    render(<HeadlinePreview headlines={mockHeadlines} />);
    
    // Check if headline titles are rendered
    expect(screen.getByText('Test Headline 1')).toBeInTheDocument();
    expect(screen.getByText('Test Headline 2')).toBeInTheDocument();
    expect(screen.getByText('Test Headline 3')).toBeInTheDocument();
    
    // Check if source names are rendered
    expect(screen.getByText(/Test Source 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test Source 2/)).toBeInTheDocument();
    expect(screen.getByText(/Test Source 3/)).toBeInTheDocument();
  });
  
  test('formats dates correctly', () => {
    // Mock current date to ensure consistent test results
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2023-05-01T18:00:00Z').getTime());
    
    render(<HeadlinePreview headlines={mockHeadlines} />);
    
    // Check if dates are formatted correctly
    // First headline: published 6 hours ago
    expect(screen.getByText(/6 hours ago/)).toBeInTheDocument();
    // Second headline: published 4 hours ago
    expect(screen.getByText(/4 hours ago/)).toBeInTheDocument();
    // Third headline: published 2 hours ago
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    
    // Restore original Date.now
    jest.restoreAllMocks();
  });
  
  test('handles missing image URLs with placeholder', () => {
    render(<HeadlinePreview headlines={mockHeadlines} />);
    
    // Get all headline images
    const headlineImages = document.querySelectorAll('.headline-image');
    
    // First two should have the actual image URLs
    expect(headlineImages[0]).toHaveStyle("background-image: url('http://example.com/image1.jpg')");
    expect(headlineImages[1]).toHaveStyle("background-image: url('http://example.com/image2.jpg')");
    
    // Third one should have a placeholder image
    expect(headlineImages[2]).toHaveStyle("background-image: url('/api/placeholder/250/120')");
  });
  
  test('renders empty state gracefully', () => {
    render(<HeadlinePreview headlines={[]} />);
    
    // Check if component renders without crashing for empty headlines array
    const previewContainer = document.querySelector('.headline-preview');
    expect(previewContainer).toBeInTheDocument();
    expect(previewContainer.children.length).toBe(0);
  });
});