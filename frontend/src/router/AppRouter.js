import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import HomePage from '../pages/HomePage';
import CategoryPage from '../pages/CategoryPage';
import PublicationPage from '../pages/PublicationPage';
import SavedArticlesPage from '../pages/SavedArticlesPage';

// Context Providers
import { UserProvider } from '../context/UserContext';
import { NewsProvider } from '../context/NewsContext';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <NewsProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/publication/:publication" element={<PublicationPage />} />
            <Route path="/saved" element={<SavedArticlesPage />} />
          </Routes>
        </NewsProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default AppRouter;