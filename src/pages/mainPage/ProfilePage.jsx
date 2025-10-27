import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserInfo = useCallback(async () => {
    if (!user || !user.accessToken) {
      setError('Vui lòng đăng nhập');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accessToken = user.accessToken || localStorage.getItem('accessToken');
      
      const response = await fetch('/api/Auth/me', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          logout();
          navigate('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      console.error('Error loading user info:', err);
      setError('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [user, logout, navigate]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhone = (phoneNumber) => {
    if (!phoneNumber) return 'Chưa cập nhật';
    return phoneNumber;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ManagerBar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600 mb-8">
            Bạn cần đăng nhập để xem trang profile.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ManagerBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Thông tin tài khoản
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân của bạn
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin tài khoản...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={loadUserInfo}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && userInfo && (
          <div className="space-y-6">
            {/* Account Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin tài khoản
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-32 text-gray-600">Họ và tên:</div>
                  <div className="flex-1 font-medium text-gray-900">{userInfo.fullName || 'Chưa cập nhật'}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-32 text-gray-600">Email:</div>
                  <div className="flex-1 font-medium text-gray-900">{userInfo.email || 'Chưa cập nhật'}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-32 text-gray-600">Số điện thoại:</div>
                  <div className="flex-1 font-medium text-gray-900">{formatPhone(userInfo.phoneNumber)}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-32 text-gray-600">Vai trò:</div>
                  <div className="flex-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userInfo.role === 'Admin' ? 'bg-red-100 text-red-800' :
                      userInfo.role === 'Provider' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {userInfo.role === 'Admin' ? '👑 Quản trị viên' :
                       userInfo.role === 'Provider' ? '🏢 Nhà cung cấp' :
                       '👤 Người dùng'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-32 text-gray-600">Ngày tạo:</div>
                  <div className="flex-1 font-medium text-gray-900">{formatDate(userInfo.createdAt)}</div>
                </div>
              </div>
            </motion.div>

            {/* Current Package Card */}
            {userInfo.currentPackage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gói dịch vụ hiện tại
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-32 text-gray-600">Tên gói:</div>
                    <div className="flex-1 font-medium text-gray-900">
                      {userInfo.currentPackage.packageName || 'Không có gói nào'}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-32 text-gray-600">Ngày hết hạn:</div>
                    <div className="flex-1 font-medium text-gray-900">
                      {formatDate(userInfo.currentPackage.endDate)}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-32 text-gray-600">Lượt còn lại:</div>
                    <div className="flex-1 font-medium text-blue-600">
                      {userInfo.currentPackage.remainingNormalTurns || 0} lượt
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-32 text-gray-600">Lượt ưu tiên:</div>
                    <div className="flex-1 font-medium text-purple-600">
                      {userInfo.currentPackage.remainingPriorityTurns || 0} lượt
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/my-packages')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    Xem tất cả gói đã mua
                  </button>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Hành động
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/my-packages')}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  📦 Gói của tôi
                </button>
                
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                >
                  📅 Đặt sân của tôi
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  🏠 Về trang chủ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;

