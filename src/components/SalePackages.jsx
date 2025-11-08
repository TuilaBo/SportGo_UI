import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config/api';

export default function SalePackages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Checkout states
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  // Payment status states
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentStatusInterval, setPaymentStatusInterval] = useState(null);
  
  // User packages states
  const [userPackages, setUserPackages] = useState([]);
  const [userPackagesLoading, setUserPackagesLoading] = useState(false);

  // Load available packages
  const loadPackages = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try without authentication first (public endpoint)
      const res = await fetch(getApiUrl('packages/available?page=1&size=20'), {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!res.ok) {
        // If 401, try with authentication
        if (res.status === 401) {
          const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
          
          if (accessToken) {
            const resWithAuth = await fetch(getApiUrl('packages/available?page=1&size=20'), {
              method: 'GET',
              headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            });
            
            if (resWithAuth.ok) {
              const data = await resWithAuth.json();
              setPackages(Array.isArray(data.items) ? data.items : []);
              return;
            }
          }
        }
        
        // If still failing and we haven't retried, try once more
        if (retryCount === 0) {
          console.log('Retrying packages load...');
          setTimeout(() => loadPackages(1), 2000);
          return;
        }
        
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPackages(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      console.error('Failed to load packages:', e);
      
      // Fallback to mock data if API fails
      const mockPackages = [
        {
          packageId: 1,
          name: "Gói tháng 11",
          durationDays: 30,
          description: "Ưu đãi sâu 30%",
          normalTurns: 13,
          priorityTurns: 0,
          price: 1000,
          isActive: true
        }
      ];
      
      setPackages(mockPackages);
      setError('Đang sử dụng dữ liệu mẫu. Vui lòng thử lại sau để cập nhật thông tin mới nhất.');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // Load user packages
  const loadUserPackages = useCallback(async () => {
    if (!user) return;
    
    try {
      setUserPackagesLoading(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(getApiUrl('packages/mine?onlyActive=true&page=1&size=20'), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setUserPackages(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      console.error('Failed to load user packages:', e);
    } finally {
      setUserPackagesLoading(false);
    }
  }, [user?.accessToken]);

  // Load packages on mount and when access token changes
  useEffect(() => {
    // Only load packages if user is logged in
    if (user && user.accessToken) {
      loadPackages();
    }
  }, [user?.accessToken]);

  // Load user packages when user logs in
  useEffect(() => {
    if (user && user.accessToken) {
      loadUserPackages();
    }
  }, [user?.userId]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (paymentStatusInterval) {
        clearInterval(paymentStatusInterval);
      }
    };
  }, [paymentStatusInterval]);

  const formatPrice = useCallback((price) => {
    return price?.toLocaleString('vi-VN') || '0';
  }, []);

  const calculateDiscount = useCallback((originalPrice, discountPercent) => {
    return Math.round(originalPrice * (1 - discountPercent / 100));
  }, []);

  // Checkout function
  const handleCheckout = async (packageItem) => {
    if (!user) {
      alert('Vui lòng đăng nhập để mua gói dịch vụ');
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutError(null);
      setSelectedPackage(packageItem);
      
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(getApiUrl('packages/purchase/checkout'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          packageId: packageItem.packageId
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setCheckoutData(data);
      
      // Open PayOS checkout page in new tab
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        
        // Show success message and redirect to payment tracking page
        alert('Đã mở trang thanh toán PayOS. Sau khi thanh toán xong, bạn có thể theo dõi trạng thái tại đây.');
        navigate(`/package-payment?orderId=${data.orderCode}`);
      } else {
        throw new Error('Không nhận được link thanh toán từ server');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setCheckoutError(e.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Close checkout modal
  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setSelectedPackage(null);
    setCheckoutData(null);
    setCheckoutError(null);
    setPaymentStatus(null);
    
    // Clear payment status interval
    if (paymentStatusInterval) {
      clearInterval(paymentStatusInterval);
      setPaymentStatusInterval(null);
    }
  };

  // Check payment status
  const checkPaymentStatus = useCallback(async (orderCode) => {
    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(getApiUrl(`packages/payment-status/${orderCode}`), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const status = await res.text();
      setPaymentStatus(status);
      
      // If payment is successful, load user packages and redirect to my-packages
      if (status === 'Success' || status === 'Completed' || status === 'Recognized' || status === 'Paid') {
        await loadUserPackages();
        setTimeout(() => {
          closeCheckoutModal();
          alert('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
          navigate('/my-packages');
        }, 2000);
      }
      
      return status;
    } catch (e) {
      console.error('Payment status check error:', e);
      return null;
    }
  }, [user?.accessToken]);

  // Start payment status polling
  const startPaymentStatusPolling = useCallback((orderCode) => {
    // Clear any existing interval
    if (paymentStatusInterval) {
      clearInterval(paymentStatusInterval);
    }
    
    // Check immediately
    checkPaymentStatus(orderCode);
    
    // Set up interval to check every 3 seconds
    const interval = setInterval(() => {
      checkPaymentStatus(orderCode);
    }, 3000);
    
    setPaymentStatusInterval(interval);
  }, [checkPaymentStatus, paymentStatusInterval]);

  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4"
          >
            🔥 ƯU ĐÃI ĐẶC BIỆT
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Gói ưu đãi hấp dẫn
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Tiết kiệm chi phí với các gói dịch vụ đặc biệt, phù hợp với mọi nhu cầu thể thao của bạn
          </motion.p>
        </div>

        {/* Login Required Message */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-blue-500 text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Đăng nhập để xem gói ưu đãi
              </h3>
              <p className="text-blue-700 mb-6">
                Vui lòng đăng nhập để xem các gói dịch vụ đặc biệt và thực hiện giao dịch
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Đăng nhập ngay
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  Tạo tài khoản
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Đang tải gói ưu đãi...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-yellow-800">Thông báo</h3>
              </div>
              <p className="text-yellow-700 mb-4">{error}</p>
              <button
                onClick={() => loadPackages()}
                disabled={loading}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Thử lại'}
              </button>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && !error && packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((packageItem, index) => (
              <motion.div
                key={packageItem.packageId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                {/* Sale Badge */}
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                    SALE
                  </div>
                </div>

                {/* Package Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-transparent group-hover:border-red-200 transition-all duration-300">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
                    
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-xl font-bold mb-2 relative z-10"
                    >
                      {packageItem.name}
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-red-100 text-sm relative z-10"
                    >
                      {packageItem.description}
                    </motion.p>
                  </div>

                  {/* Price Section */}
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(packageItem.price)} VNĐ
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Chỉ {formatPrice(Math.round(packageItem.price / packageItem.durationDays))} VNĐ/ngày
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Thời hạn</span>
                        <span className="font-semibold text-gray-900">{packageItem.durationDays} ngày</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Lượt bình thường</span>
                        <span className="font-semibold text-blue-600">{packageItem.normalTurns}</span>
                      </div>
                      
                      {packageItem.priorityTurns > 0 && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Lượt ưu tiên</span>
                          <span className="font-semibold text-purple-600">{packageItem.priorityTurns}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCheckout(packageItem)}
                      disabled={checkoutLoading}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkoutLoading ? 'Đang xử lý...' : 'Mua ngay'}
                    </motion.button>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-white opacity-30 rounded-full"></div>
                  <div className="absolute top-8 left-8 w-1 h-1 bg-white opacity-20 rounded-full"></div>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-white opacity-30 rounded-full"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && packages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gói ưu đãi</h3>
            <p className="text-gray-600">Hãy quay lại sau để xem các gói ưu đãi mới</p>
          </div>
        )}

        {/* Call to Action */}
        {!loading && !error && packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Không tìm thấy gói phù hợp?
              </h3>
              <p className="text-gray-600 mb-6">
                Liên hệ với chúng tôi để được tư vấn gói dịch vụ phù hợp nhất
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Liên hệ tư vấn
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
                >
                  Xem tất cả gói
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Thanh toán gói dịch vụ
                </h3>
                <button
                  onClick={closeCheckoutModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Package Info */}
              {selectedPackage && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedPackage.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Giá: <span className="font-medium">{formatPrice(selectedPackage.price)} VNĐ</span></div>
                    <div>Thời hạn: {selectedPackage.durationDays} ngày</div>
                    <div>Lượt bình thường: {selectedPackage.normalTurns}</div>
                    {selectedPackage.priorityTurns > 0 && (
                      <div>Lượt ưu tiên: {selectedPackage.priorityTurns}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {checkoutLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tạo đơn hàng...</p>
                </div>
              )}

              {/* Error State */}
              {checkoutError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{checkoutError}</span>
                  </div>
                </div>
              )}

              {/* Checkout Data */}
              {!checkoutLoading && !checkoutError && checkoutData && (
                <div className="space-y-6">
                  {/* Order Code */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                    <p className="text-lg font-mono font-bold text-gray-900">{checkoutData.orderCode}</p>
                  </div>

                  {/* Payment Status */}
                  {paymentStatus && (
                    <div className="text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        paymentStatus === 'Success' || paymentStatus === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {paymentStatus === 'Success' || paymentStatus === 'Completed' ? '✅ Đã thanh toán' :
                         paymentStatus === 'Pending' ? '⏳ Đang chờ thanh toán' :
                         paymentStatus === 'Failed' ? '❌ Thanh toán thất bại' :
                         `📊 ${paymentStatus}`}
                      </div>
                    </div>
                  )}

                  {/* QR Code */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Quét mã QR để thanh toán</p>
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                      <img 
                        src={`data:image/png;base64,${checkoutData.qrPngBase64}`}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">Hướng dẫn thanh toán:</h5>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                      <li>Quét mã QR ở trên</li>
                      <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                      <li>Gói dịch vụ sẽ được kích hoạt tự động</li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={closeCheckoutModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => window.open(checkoutData.checkoutUrl, '_blank')}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Mở trang thanh toán
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
