import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import backgroundImage from '../../assets/bong-da-mon-the-thao-vua.jpg';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { resetPassword } from '../../services/authService';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resetPassword(
        email,
        formData.otp,
        formData.newPassword,
        formData.confirmPassword
      );
      
      setSuccess(result.message);
      
      // Navigate to login page after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect to forgot-password
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Manager Bar */}
      <ManagerBar />

      {/* Main Content */}
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* Reset Password Form */}
        <div className="relative z-10 w-full max-w-md px-4 py-12">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="SportGo Logo" className="h-16 w-16 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Đặt lại mật khẩu</h1>
              <p className="text-blue-100">Nhập mã OTP và mật khẩu mới</p>
              <p className="text-blue-200 text-sm mt-2">Email: {email}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                  <p className="text-green-300 text-sm text-center">{success}</p>
                  <p className="text-green-200 text-xs text-center mt-2">Đang chuyển hướng đến trang đăng nhập...</p>
                </div>
              )}

              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-white mb-2">
                  Mã OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Nhập mã OTP"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Nhập mật khẩu mới"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>

              {/* Back to Login Link */}
              <div className="text-center mt-6">
                <Link 
                  to="/login" 
                  className="text-blue-300 hover:text-blue-200 font-semibold transition-colors"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;

