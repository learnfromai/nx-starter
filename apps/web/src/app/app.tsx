import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TodoPage } from '../presentation/features/todo';
import { AboutPage } from '../presentation/features/about';
import { LoginPage } from '../presentation/features/login';
import '../styles.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodoPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
