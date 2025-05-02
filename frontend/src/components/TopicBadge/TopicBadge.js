import React from 'react';
import './TopicBadge.css';

const TopicBadge = ({ topic }) => {
  return (
    <div className="topic-badge">
      {topic}
    </div>
  );
};

export default TopicBadge;