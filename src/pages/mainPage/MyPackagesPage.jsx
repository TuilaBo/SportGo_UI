import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';

const MyPackagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPackages = useCallback(async () => {
    if (!user || !user.accessToken) {
      setError('Vui lòng đăng nhập để xem gói của bạn');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accessToken = user.accessToken || localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/packages/mine?onlyActive=true&page=${page}&size=20`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setPackages(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading packages:', err);
      setError('Không thể tải danh sách gói dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [user, page, navigate]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') || '0';
  };

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

  const getStatusBadge = (isActive, endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (!isActive) {
      return (
        <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
          Đã hết hạn
        </span>
      );
    }
    
    if (end < now) {
      return (
        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
          Đã hết hạn
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
        Đang hoạt động
      </span>
    );
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
            Bạn cần đăng nhập để xem gói dịch vụ của mình.
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gói dịch vụ của tôi
          </h1>
          <p className="text-gray-600">
            Xem và quản lý các gói dịch vụ bạn đã mua
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div within="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách gói dịch vụ...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadPackages}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Packages List */}
        {!loading && !error && (
          <>
            {packages.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bạn chưa có gói dịch vụ nào
                </h2>
                <p className="text-gray-600 mb-8">
                  Hãy mua gói dịch vụ để bắt đầu sử dụng các tính năng của SportGo
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Mua gói dịch vụ
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {packages.map((pkg) => (
                  <div
                    key={pkg.userPackageId}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Package Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {pkg.packageName}
                        </h3>
                        {getStatusBadge(pkg.isActive, pkg.endDate)}
                      </div>
                      <p className="text-blue-100 text-sm">
                        ID: {pkg.userPackageId}
                      </p>
                    </div>

                    {/* Package Body */}
                    <div className="p-6">
                      {/* Purchase Price */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Giá mua</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(pkg.purchasePrice)} VNĐ
                        </p>
                      </div>

                      {/* Remaining Turns */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Lượt bình thường còn lại</span>
                          <span className="font-semibold text-blue-600">
                            {pkg.remainingNormalTurns}
                          </span>
                        </div>
                        {pkg.remainingPriorityTurns > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Lượt ưu tiên còn lại</span>
                            <span className="font-semibold text-purple-600">
                              {pkg.remainingPriorityTurns}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Time Info */}
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(pkg.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày kết thúc</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(pkg.endDate)}
                          </p>
                        </div>
                        {pkg.isActive && calculateDaysRemaining(pkg.endDate) > 0 && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              Còn lại: <span className="font-bold">{calculateDaysRemaining(pkg.endDate)}</span> ngày
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyPackagesPage;

