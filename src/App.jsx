import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/mainPage/HomePage';
import LoginPage from './pages/mainPage/LoginPage';
import RegisterPage from './pages/mainPage/RegisterPage';
import ContactPage from './pages/mainPage/ContactPage';
import BookingPage from './pages/mainPage/BookingPage';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
