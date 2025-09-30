import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import backgroundImage from '../../assets/bong-da-mon-the-thao-vua.jpg';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { forgotPassword } from '../../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPassword(email);
      setSuccess(result.message);
      
      // Navigate to reset password page with email
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
      
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Forgot Password Form */}
        <div className="relative z-10 w-full max-w-md px-4 py-12">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="SportGo Logo" className="h-16 w-16 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu</h1>
              <p className="text-blue-100">Nhập email để nhận mã xác thực</p>
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
                  <p className="text-green-200 text-xs text-center mt-2">Đang chuyển hướng...</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Nhập email của bạn"
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
                {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
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

export default ForgotPasswordPage;

