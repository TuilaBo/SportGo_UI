import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/mainPage/HomePage';
import LoginPage from './pages/mainPage/LoginPage';
import RegisterPage from './pages/mainPage/RegisterPage';
import ContactPage from './pages/mainPage/ContactPage';
import BookingPage from './pages/mainPage/BookingPage';
import ForgotPasswordPage from './pages/mainPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/mainPage/ResetPasswordPage';
import ProviderProfilePage from './pages/mainPage/ProviderProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagePage from './pages/admin/UsersManagePage';
import ProvidersManagePage from './pages/admin/ProvidersManagePage';
import BusinessDashboard from './pages/doanhNghiep/BusinessDashboard';
import CourtsPage from './pages/doanhNghiep/CourtsPage';
import FacilitiesPage from './pages/doanhNghiep/FacilitiesPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/provider-profile" element={<ProviderProfilePage />} />
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <UsersManagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/providers"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <ProvidersManagePage />
              </ProtectedRoute>
            }
          />
          {/* Doanh nghiệp routes */}
          <Route
            path="/doanh-nghiep"
            element={
              <ProtectedRoute roles={["Provider"]}>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doanh-nghiep/san"
            element={
              <ProtectedRoute roles={["Provider"]}>
                <CourtsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doanh-nghiep/chi-nhanh"
            element={
              <ProtectedRoute roles={["Provider"]}>
                <FacilitiesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
