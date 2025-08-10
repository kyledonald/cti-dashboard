import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import LandingPage from '../../pages/LandingPage';

export const UnauthenticatedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}; 
