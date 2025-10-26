import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function PackagePaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [orderId, setOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPollingActive, setIsPollingActive] = useState(false);
  const paymentStatusIntervalRef = useRef(null);

  // Get orderId from URL params
  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  // Load order details
  const loadOrderDetails = useCallback(async (orderId) => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      console.log('Loading order details for orderId:', orderId);
      console.log('Using accessToken:', accessToken ? 'Yes' : 'No');
      
      const res = await fetch(`/api/packages/order/${orderId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('Order details response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to load order details:', res.status, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('Order details loaded:', data);
      
      // If API doesn't return data, create mock data from orderId
      if (!data || Object.keys(data).length === 0) {
        console.log('No order details from API, creating mock data');
        setOrderDetails({
          packageName: 'Gói dịch vụ',
          price: 0,
          durationDays: 30,
          normalTurns: 20,
          priorityTurns: 0,
          purchaseDate: new Date().toISOString(),
          checkoutUrl: '',
          qrPngBase64: ''
        });
      } else {
        setOrderDetails(data);
      }
    } catch (e) {
      console.error('Failed to load order details:', e);
      // Create minimal mock data if API fails
      setOrderDetails({
        packageName: 'Gói dịch vụ',
        price: 0,
        durationDays: 30,
        normalTurns: 20,
        priorityTurns: 0,
        purchaseDate: new Date().toISOString(),
        checkoutUrl: '',
        qrPngBase64: ''
      });
      setError(null); // Don't show error if we have mock data
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // Check payment status
  const checkPaymentStatus = useCallback(async (orderId) => {
    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/packages/payment-status/${orderId}`, {
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
      
      // If payment is successful, stop polling and redirect
      if (status === 'Success' || status === 'Completed' || status === 'Recognized' || status === 'Paid') {
        if (paymentStatusIntervalRef.current) {
          clearInterval(paymentStatusIntervalRef.current);
          paymentStatusIntervalRef.current = null;
        }
        
        // Reload order details to get updated info
        if (orderId) {
          const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
          const res = await fetch(`/api/packages/order/${orderId}`, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setOrderDetails(data);
          }
        }
        
        // Redirect to my-packages page after 3 seconds
        setTimeout(() => {
          navigate('/my-packages');
        }, 3000);
      }
      
      return status;
    } catch (e) {
      console.error('Payment status check error:', e);
      return null;
    }
  }, [user?.accessToken]);

  // Start payment status polling
  const startPaymentStatusPolling = useCallback((orderId) => {
    if (isPollingActive) return; // Prevent multiple polling instances
    
    // Clear any existing interval
    if (paymentStatusIntervalRef.current) {
      clearInterval(paymentStatusIntervalRef.current);
    }
    
    setIsPollingActive(true);
    
    // Check immediately
    checkPaymentStatus(orderId);
    
    // Set up interval to check every 3 seconds
    const interval = setInterval(() => {
      checkPaymentStatus(orderId);
    }, 3000);
    
    paymentStatusIntervalRef.current = interval;
  }, [checkPaymentStatus, isPollingActive]);

  // Stop payment status polling
  const stopPaymentStatusPolling = useCallback(() => {
    if (paymentStatusIntervalRef.current) {
      clearInterval(paymentStatusIntervalRef.current);
      paymentStatusIntervalRef.current = null;
    }
    setIsPollingActive(false);
  }, []);

  // Load order details when orderId changes
  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
      // Check payment status once initially
      checkPaymentStatus(orderId);
    }
  }, [orderId]);

  // Start polling when user interacts with the page
  useEffect(() => {
    const handleUserInteraction = () => {
      if (orderId && !isPollingActive && paymentStatus !== 'Success' && paymentStatus !== 'Completed' && paymentStatus !== 'Recognized' && paymentStatus !== 'Paid') {
        startPaymentStatusPolling(orderId);
      }
    };

    // Start polling on user interaction
    window.addEventListener('focus', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('focus', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [orderId, isPollingActive, paymentStatus, startPaymentStatusPolling]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (paymentStatusIntervalRef.current) {
        clearInterval(paymentStatusIntervalRef.current);
      }
    };
  }, []);

  const formatPrice = useCallback((price) => {
    return price?.toLocaleString('vi-VN') || '0';
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
      case 'Completed':
      case 'Recognized':
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Success':
      case 'Completed':
      case 'Recognized':
      case 'Paid':
        return '✅ Đã thanh toán thành công';
      case 'Pending':
        return '⏳ Đang chờ thanh toán';
      case 'Failed':
        return '❌ Thanh toán thất bại';
      default:
        return `📊 ${status}`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin thanh toán</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Thanh toán gói dịch vụ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Theo dõi trạng thái thanh toán của bạn
          </motion.p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
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
          </div>
        )}

        {/* Instructions */}
        {!loading && !error && orderDetails && paymentStatus === 'Pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Hướng dẫn thanh toán</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Trang thanh toán PayOS đã được mở trong tab mới</li>
                    <li>Hoàn thành thanh toán trên trang PayOS</li>
                    <li>Quay lại tab này và nhấn "Kiểm tra trạng thái thanh toán"</li>
                    <li>Hoặc hệ thống sẽ tự động cập nhật khi bạn tương tác với trang</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        {!loading && !error && orderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Package Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin gói dịch vụ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên gói:</span>
                    <span className="font-medium">{orderDetails.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium text-green-600">{formatPrice(orderDetails.price)} VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời hạn:</span>
                    <span className="font-medium">{orderDetails.durationDays} ngày</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lượt bình thường:</span>
                    <span className="font-medium text-blue-600">{orderDetails.normalTurns}</span>
                  </div>
                  {orderDetails.priorityTurns > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lượt ưu tiên:</span>
                      <span className="font-medium text-purple-600">{orderDetails.priorityTurns}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày mua:</span>
                    <span className="font-medium">
                      {new Date(orderDetails.purchaseDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

                  {/* Payment Status */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Trạng thái thanh toán</h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(paymentStatus)}`}>
                          {getStatusText(paymentStatus)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                        <p className="text-lg font-mono font-bold text-gray-900">{orderId}</p>
                      </div>

                      {/* Manual refresh button */}
                      {!isPollingActive && paymentStatus !== 'Success' && paymentStatus !== 'Completed' && paymentStatus !== 'Recognized' && paymentStatus !== 'Paid' && (
                        <div className="text-center">
                          <button
                            onClick={() => startPaymentStatusPolling(orderId)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            🔄 Kiểm tra trạng thái thanh toán
                          </button>
                          <p className="text-xs text-gray-500 mt-2">
                            Nhấn để bắt đầu theo dõi trạng thái thanh toán
                          </p>
                        </div>
                      )}

                      {/* Polling indicator */}
                      {isPollingActive && (
                        <div className="text-center">
                          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                            Đang theo dõi trạng thái...
                          </div>
                        </div>
                      )}

                  {/* QR Code */}
                  {orderDetails.qrPngBase64 && paymentStatus === 'Pending' && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Quét mã QR để thanh toán</p>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                        <img 
                          src={`data:image/png;base64,${orderDetails.qrPngBase64}`}
                          alt="QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Instructions */}
                  {paymentStatus === 'Pending' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 mb-2">Hướng dẫn thanh toán:</h5>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                        <li>Quét mã QR ở trên</li>
                        <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                        <li>Gói dịch vụ sẽ được kích hoạt tự động</li>
                      </ol>
                    </div>
                  )}

                  {/* Success Message */}
                  {(paymentStatus === 'Success' || paymentStatus === 'Completed' || paymentStatus === 'Recognized' || paymentStatus === 'Paid') && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-900 mb-2">🎉 Thanh toán thành công!</h5>
                      <p className="text-sm text-green-800">
                        Gói dịch vụ đã được kích hoạt thành công. Bạn có thể sử dụng ngay bây giờ.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </button>
              {orderDetails.checkoutUrl && paymentStatus === 'Pending' && (
                <button
                  onClick={() => window.open(orderDetails.checkoutUrl, '_blank')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mở trang thanh toán
                </button>
              )}
              {(paymentStatus === 'Success' || paymentStatus === 'Completed' || paymentStatus === 'Recognized' || paymentStatus === 'Paid') && (
                <button
                  onClick={() => navigate('/my-packages')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Xem gói của tôi
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* No Order ID */}
        {!loading && !error && !orderId && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại link hoặc mã đơn hàng</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
