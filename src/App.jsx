import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/mainPage/HomePage';
import LoginPage from './pages/mainPage/LoginPage';
import RegisterPage from './pages/mainPage/RegisterPage';
import ContactPage from './pages/mainPage/ContactPage';
import BookingPage from './pages/mainPage/BookingPage';
import ForgotPasswordPage from './pages/mainPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/mainPage/ResetPasswordPage';
import ProviderProfilePage from './pages/mainPage/ProviderProfilePage';
import PackagePaymentPage from './pages/mainPage/PackagePaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagePage from './pages/admin/UsersManagePage';
import PackagesManagePage from './pages/admin/PackagesManagePage';
import BusinessDashboard from './pages/doanhNghiep/BusinessDashboard';
import CourtsPage from './pages/doanhNghiep/CourtsPage';
import FacilitiesPage from './pages/doanhNghiep/FacilitiesPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SportTypesManagePage from './pages/admin/SportTypesManagePage';
import SearchPage from './pages/mainPage/SearchPage';
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
          <Route path="/search" element={<SearchPage />} />
          <Route path="/package-payment" element={<PackagePaymentPage />} />
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
            path="/admin/sport-types"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <SportTypesManagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/packages"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <PackagesManagePage />
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
