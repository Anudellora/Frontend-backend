import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AddProductPage from './pages/AddProductPage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddProductPage />} />
      </Routes>
    </>
  );
}

export default App;
