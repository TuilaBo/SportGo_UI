import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import backgroundImage from '../../assets/bong-da-mon-the-thao-vua.jpg';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { registerUser, verifyEmail } from '../../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isProvider: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [otpData, setOtpData] = useState({ email: '', otp: '', isProvider: false });
  const [otpError, setOtpError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phone,
          isProvider: formData.isProvider
        };

        const result = await registerUser(userData);
        setRegistrationSuccess(true);
        setOtpData({ 
          email: formData.email, 
          otp: '', 
          isProvider: formData.isProvider 
        });
        alert(result.message);
      } catch (error) {
        alert(`Lỗi đăng ký: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpData.otp) {
      setOtpError('Vui lòng nhập mã OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmail(otpData.email, otpData.otp);
      alert(result.message);
      
      // Save tokens to localStorage after successful verification
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken || '');
        
        // Save basic user info
        const userData = {
          id: result.userId || 'temp',
          email: otpData.email,
          name: otpData.email.split('@')[0],
          avatar: null,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken || '',
          isProvider: otpData.isProvider,
          role: otpData.isProvider ? 'Provider' : 'User'
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Check if user is a provider
      if (otpData.isProvider) {
        // Redirect to provider profile page
        navigate('/provider-profile', { 
          state: { 
            email: otpData.email,
            accessToken: result.accessToken
          } 
        });
      } else {
        // Redirect to login page for regular users
        navigate('/login');
      }
    } catch (error) {
      setOtpError(error.message);
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

        {/* Registration Form */}
        <div className="relative z-10 w-full max-w-md px-4 py-12">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="SportGo Logo" className="h-16 w-16 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Đăng ký</h1>
              <p className="text-blue-100">Tạo tài khoản mới để bắt đầu</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/20 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.fullName ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="Nhập họ và tên của bạn"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-300">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/20 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.email ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="Nhập email của bạn"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-300">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/20 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.phone ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-300">{errors.phone}</p>
                )}
              </div>

              {/* Account Type Toggle */}
              <div className="bg-white/10 rounded-xl p-4">
                <label className="block text-sm font-medium text-white mb-3">
                  Loại tài khoản
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isProvider"
                      value="false"
                      checked={!formData.isProvider}
                      onChange={(e) => setFormData({...formData, isProvider: e.target.value === 'true'})}
                      className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-white">👤 Cá nhân</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isProvider"
                      value="true"
                      checked={formData.isProvider}
                      onChange={(e) => setFormData({...formData, isProvider: e.target.value === 'true'})}
                      className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-white">🏢 Doanh nghiệp</span>
                  </label>
                </div>
                <p className="mt-2 text-xs text-blue-200">
                  {formData.isProvider 
                    ? "Tài khoản doanh nghiệp sẽ cần thêm thông tin xác minh sau khi đăng ký" 
                    : "Tài khoản cá nhân để đặt sân và sử dụng dịch vụ"
                  }
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/20 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.password ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="Mật khẩu dài hơn 8 ký tự"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-300">{errors.password}</p>
                )}
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
                  className={`w-full px-4 py-3 bg-white/20 border rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.confirmPassword ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-300">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-white/30 bg-white/20 text-blue-400 focus:ring-blue-400 focus:ring-offset-0"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-white">
                  Tôi đồng ý với{' '}
                  <Link to="#" className="text-blue-300 hover:text-blue-200 transition-colors">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link to="#" className="text-blue-300 hover:text-blue-200 transition-colors">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>

              {/* Social Registration */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/30" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white">Hoặc đăng ký bằng</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-3 px-4 border border-white/30 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-3 px-4 border border-white/30 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-white">
                  Đã có tài khoản?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-300 hover:text-blue-200 font-semibold transition-colors"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </form>

            {/* OTP Verification Form */}
            {registrationSuccess && (
              <div className="mt-8 p-6 bg-green-500/20 border border-green-400/30 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4 text-center">Xác thực Email</h2>
                <p className="text-green-100 text-center mb-6">
                  Mã OTP đã được gửi đến email <strong>{otpData.email}</strong>. 
                  Vui lòng kiểm tra và nhập mã OTP để hoàn tất đăng ký.
                </p>
                
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-white mb-2">
                      Mã OTP (6 số)
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otpData.otp}
                      onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Nhập mã OTP"
                      maxLength="6"
                    />
                    {otpError && (
                      <p className="mt-1 text-sm text-red-300">{otpError}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang xác thực...' : 'Xác thực Email'}
                  </button>
                </form>
                
                <div className="text-center mt-4">
                  <button
                    onClick={() => setRegistrationSuccess(false)}
                    className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                  >
                    Quay lại đăng ký
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegisterPage;