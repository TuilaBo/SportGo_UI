import React, { useState, useEffect } from 'react';
import BusinessLayout from '../../components/layouts/BusinessLayout';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingsManagePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const response = await fetch('/api/Bookings', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    if (!confirm(`Xác nhận check-in cho đặt sân #${bookingId}?`)) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(bookingId));
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const response = await fetch(`/api/Bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      alert(`Đã check-in thành công cho đặt sân #${bookingId}`);
      await loadBookings();
    } catch (err) {
      console.error('Failed to check-in booking:', err);
      alert(`Lỗi khi check-in: ${err.message}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const handleComplete = async (bookingId) => {
    if (!confirm(`Xác nhận hoàn thành đặt sân #${bookingId}?`)) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(bookingId));
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const response = await fetch(`/api/Bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      alert(`Đã hoàn thành đặt sân #${bookingId}`);
      await loadBookings();
    } catch (err) {
      console.error('Failed to complete booking:', err);
      alert(`Lỗi khi hoàn thành: ${err.message}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm(`Xác nhận hủy đặt sân #${bookingId}? Lượt đặt sẽ không được hoàn lại.`)) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(bookingId));
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const response = await fetch(`/api/Bookings/${bookingId}/cancel?refundUsage=false`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      alert(`Đã hủy đặt sân #${bookingId}`);
      await loadBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert(`Lỗi khi hủy: ${err.message}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CheckedIn':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'Đã xác nhận';
      case 'CheckedIn':
        return 'Đã check-in';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <BusinessLayout title="Quản lý đặt sân">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt sân</h1>
          <button
            onClick={loadBookings}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Làm mới</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {loading && bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách đặt sân...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đặt sân nào</h3>
            <p className="text-gray-600">Hiện tại chưa có đơn đặt sân nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đặt sân
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã sân
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{booking.bookingId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{booking.courtId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {booking.totalAmount?.toLocaleString('vi-VN')} VNĐ
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.tier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.slotIds?.length || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {booking.status === 'Confirmed' && (
                          <>
                            <button
                              onClick={() => handleCheckIn(booking.bookingId)}
                              disabled={processingIds.has(booking.bookingId)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {processingIds.has(booking.bookingId) ? 'Đang xử lý...' : 'Check-in'}
                            </button>
                            <button
                              onClick={() => handleComplete(booking.bookingId)}
                              disabled={processingIds.has(booking.bookingId)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {processingIds.has(booking.bookingId) ? 'Đang xử lý...' : 'Hoàn thành'}
                            </button>
                            <button
                              onClick={() => handleCancel(booking.bookingId)}
                              disabled={processingIds.has(booking.bookingId)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {processingIds.has(booking.bookingId) ? 'Đang xử lý...' : 'Hủy'}
                            </button>
                          </>
                        )}
                        {booking.status === 'CheckedIn' && (
                          <>
                            <button
                              onClick={() => handleComplete(booking.bookingId)}
                              disabled={processingIds.has(booking.bookingId)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {processingIds.has(booking.bookingId) ? 'Đang xử lý...' : 'Hoàn thành'}
                            </button>
                            <button
                              onClick={() => handleCancel(booking.bookingId)}
                              disabled={processingIds.has(booking.bookingId)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {processingIds.has(booking.bookingId) ? 'Đang xử lý...' : 'Hủy'}
                            </button>
                          </>
                        )}
                        {booking.status === 'Completed' && (
                          <span className="text-xs text-green-600 font-medium">Đã hoàn thành</span>
                        )}
                        {booking.status === 'Cancelled' && (
                          <span className="text-xs text-red-600 font-medium">Đã hủy</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}

