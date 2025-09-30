import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import backgroundImage from '../../assets/bong-da-mon-the-thao-vua.jpg';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { submitProviderProfile } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const ProviderProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    businessPhoneNumber: '',
    businessLicenseUrl: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const { accessToken: stateAccessToken, email } = location.state || {};
  const accessToken = stateAccessToken || localStorage.getItem('accessToken');

  useEffect(() => {
    console.log('ProviderProfilePage useEffect - accessToken:', !!accessToken);
    console.log('ProviderProfilePage useEffect - user:', user);
    
    if (!accessToken) {
      console.log('No access token, redirecting to login');
      navigate('/login');
      return;
    }

    // Wait for user data to load before checking business info
    if (user) {
      console.log('User data loaded:', user);
      // If Provider already has business info completed, redirect to home
      if (user.role === 'Provider' && user.hasBusinessInfo) {
        console.log('Provider has business info, redirecting to home');
        navigate('/');
      } else {
        setIsInitialLoading(false);
      }
    } else {
      // If no user data yet, check localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === 'Provider' && parsedUser.hasBusinessInfo) {
            console.log('Provider has business info (from localStorage), redirecting to home');
            navigate('/');
          } else {
            setIsInitialLoading(false);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    }
  }, [accessToken, user, navigate]);

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
    
    // Validation
    if (!formData.businessName || !formData.address || !formData.businessPhoneNumber || 
        !formData.businessLicenseUrl || !formData.bankAccountName || 
        !formData.bankAccountNumber || !formData.bankName) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await submitProviderProfile(formData, accessToken);
      setSuccess(result.message || 'Đăng ký nhà cung cấp thành công!');
      
      // Update user data to mark business info as completed
      if (user) {
        const updatedUser = { ...user, hasBusinessInfo: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Navigate to home page after successful registration
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!accessToken) {
    return null; // Will redirect to login
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
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

        {/* Provider Profile Form */}
        <div className="relative z-10 w-full max-w-2xl px-4 py-12">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="SportGo Logo" className="h-16 w-16 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Thông tin nhà cung cấp</h1>
              <p className="text-blue-100">Điền thông tin doanh nghiệp của bạn</p>
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

              {/* Business Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-white mb-2">
                    Tên doanh nghiệp *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="VD: Sân Bóng Aha"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Business Phone */}
                <div>
                  <label htmlFor="businessPhoneNumber" className="block text-sm font-medium text-white mb-2">
                    Số điện thoại doanh nghiệp *
                  </label>
                  <input
                    type="tel"
                    id="businessPhoneNumber"
                    name="businessPhoneNumber"
                    value={formData.businessPhoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="VD: 0961031777"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="VD: Phú Hữu, Thủ Đức, TP.HCM"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Business License URL */}
              <div>
                <label htmlFor="businessLicenseUrl" className="block text-sm font-medium text-white mb-2">
                  URL giấy phép kinh doanh *
                </label>
                <input
                  type="url"
                  id="businessLicenseUrl"
                  name="businessLicenseUrl"
                  value={formData.businessLicenseUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="https://example.com/license"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Bank Information */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Bank Account Name */}
                <div>
                  <label htmlFor="bankAccountName" className="block text-sm font-medium text-white mb-2">
                    Tên chủ tài khoản *
                  </label>
                  <input
                    type="text"
                    id="bankAccountName"
                    name="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="VD: Vo Dang Khoa"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Bank Account Number */}
                <div>
                  <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-white mb-2">
                    Số tài khoản *
                  </label>
                  <input
                    type="text"
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="VD: 1015755218"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-white mb-2">
                    Tên ngân hàng *
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="VD: VietComBank"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Hoàn thành đăng ký'}
              </button>

              {/* Back to Login Link */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-300 hover:text-blue-200 font-semibold transition-colors"
                >
                  ← Quay lại đăng nhập
                </button>
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

export default ProviderProfilePage;
