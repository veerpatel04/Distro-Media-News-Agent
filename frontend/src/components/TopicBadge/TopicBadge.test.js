import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicBadge from './TopicBadge';

describe('TopicBadge Component', () => {
  test('renders topic text correctly', () => {
    render(<TopicBadge topic="Technology" />);
    
    // Check if topic text is rendered
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });
  
  test('applies correct CSS class', () => {
    render(<TopicBadge topic="Politics" />);
    
    // Check if the badge has the correct class
    const badge = screen.getByText('Politics');
    expect(badge).toHaveClass('topic-badge');
  });
  
  test('handles empty topic gracefully', () => {
    render(<TopicBadge topic="" />);
    
    // Should render an empty badge without errors
    const badge = document.querySelector('.topic-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('');
  });
  
  test('handles special characters in topic', () => {
    const specialTopic = 'AI & Machine Learning';
    render(<TopicBadge topic={specialTopic} />);
    
    // Check if topic with special characters is rendered correctly
    expect(screen.getByText(specialTopic)).toBeInTheDocument();
  });
  
  test('converts non-string topics to strings', () => {
    // Test with a number
    render(<TopicBadge topic={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    
    // Test with an object that has toString
    const date = new Date('2023-01-01');
    render(<TopicBadge topic={date} />);
    expect(screen.getByText(date.toString())).toBeInTheDocument();
  });
});