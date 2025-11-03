import React, { useState, useEffect, useCallback } from 'react';

const BookingPaymentModal = ({ isOpen, onClose, bookingId, paymentType, accessToken, onPaymentSuccess }) => {
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusInterval, setStatusInterval] = useState(null);

  useEffect(() => {
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [statusInterval]);

  const checkPaymentStatus = useCallback(async () => {
    if (!bookingId || !checkoutData?.orderCode) return;

    try {
      const res = await fetch(`/api/booking-payment/${checkoutData.orderCode}/status`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) return;

      const status = await res.text();
      setPaymentStatus(status);

      if (status === 'Success' || status === 'Completed' || status === 'Recognized' || status === 'Paid') {
        if (statusInterval) {
          clearInterval(statusInterval);
          setStatusInterval(null);
        }
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (e) {
      console.error('Payment status check error:', e);
    }
  }, [bookingId, checkoutData?.orderCode, accessToken, statusInterval, onPaymentSuccess, onClose]);

  useEffect(() => {
    if (isOpen && bookingId) {
      const initCheckout = async () => {
        try {
          setLoading(true);
          setError(null);
          setCheckoutData(null);
          setPaymentStatus(null);

          const endpoint = paymentType === 'deposit' 
            ? `/api/booking-payment/${bookingId}/deposit/checkout`
            : `/api/booking-payment/${bookingId}/final/checkout`;

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `HTTP ${res.status}`);
          }

          const data = await res.json();
          setCheckoutData(data);

          if (data.checkoutUrl) {
            const interval = setInterval(() => {
              checkPaymentStatus();
            }, 3000);
            setStatusInterval(interval);
          }
        } catch (e) {
          console.error('Checkout error:', e);
          setError(e.message || 'Không thể tạo đơn thanh toán. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      };

      initCheckout();
    } else {
      if (statusInterval) {
        clearInterval(statusInterval);
        setStatusInterval(null);
      }
      setCheckoutData(null);
      setPaymentStatus(null);
      setError(null);
    }
  }, [isOpen, bookingId, paymentType, accessToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {paymentType === 'deposit' ? 'Thanh toán cọc' : 'Thanh toán phần còn lại'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tạo đơn thanh toán...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && checkoutData && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                <p className="text-lg font-mono font-bold text-gray-900">{checkoutData.orderCode}</p>
              </div>

              {paymentStatus && (
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    paymentStatus === 'Success' || paymentStatus === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : paymentStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {paymentStatus === 'Success' || paymentStatus === 'Completed' ? 'Đã thanh toán' :
                     paymentStatus === 'Pending' ? 'Đang chờ thanh toán' :
                     paymentStatus === 'Failed' ? 'Thanh toán thất bại' :
                     paymentStatus}
                  </div>
                </div>
              )}

              {checkoutData.qrPngBase64 && paymentStatus !== 'Success' && paymentStatus !== 'Completed' && (
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
              )}

              {paymentStatus !== 'Success' && paymentStatus !== 'Completed' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Hướng dẫn thanh toán:</h5>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Quét mã QR ở trên</li>
                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                    <li>Trạng thái sẽ được cập nhật tự động</li>
                  </ol>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                {checkoutData.checkoutUrl && (
                  <button
                    onClick={() => window.open(checkoutData.checkoutUrl, '_blank')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Mở trang thanh toán
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentModal;


