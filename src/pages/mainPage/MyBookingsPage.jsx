import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

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

  const loadBookingDetails = async (bookingId) => {
    if (bookingDetails[bookingId]) {
      setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
      return;
    }

    try {
      setLoadingDetails(prev => ({ ...prev, [bookingId]: true }));
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const response = await fetch(`/api/Bookings/${bookingId}`, {
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
      setBookingDetails(prev => ({ ...prev, [bookingId]: data }));
      setExpandedBooking(bookingId);
    } catch (err) {
      console.error('Failed to load booking details:', err);
      alert(`Không thể tải chi tiết đặt sân: ${err.message}`);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'Đã xác nhận';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ManagerBar />
      
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Lịch Đặt Sân Của Tôi</h1>
            <p className="text-gray-600 text-lg">Quản lý và theo dõi các lần đặt sân của bạn</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-lg text-gray-600">Đang tải danh sách đặt sân...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span className="text-lg text-red-700 font-semibold">Có lỗi xảy ra</span>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={loadBookings}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Bookings List */}
          {!loading && !error && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">📅</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Đặt sân #{booking.bookingId}</h3>
                          <p className="text-gray-600">Sân #{booking.courtId}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Giá</div>
                        <div className="text-lg font-bold text-blue-600">
                          {booking.totalAmount?.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Loại</div>
                        <div className="text-lg font-semibold text-gray-800">{booking.tier}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Số slot</div>
                        <div className="text-lg font-semibold text-gray-800">{booking.slotIds?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Cần cọc</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {booking.depositRequired ? 'Có' : 'Không'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => loadBookingDetails(booking.bookingId)}
                      disabled={loadingDetails[booking.bookingId]}
                      className="w-full bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                    >
                      {loadingDetails[booking.bookingId] ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <span>{expandedBooking === booking.bookingId ? 'Ẩn' : 'Xem'} chi tiết</span>
                          <svg className={`w-5 h-5 transition-transform ${expandedBooking === booking.bookingId ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {/* Expanded Details */}
                    {expandedBooking === booking.bookingId && bookingDetails[booking.bookingId] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Chi tiết đặt sân</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">Mã đặt sân</div>
                              <div className="font-semibold text-gray-900">#{bookingDetails[booking.bookingId].bookingId}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Mã sân</div>
                              <div className="font-semibold text-gray-900">#{bookingDetails[booking.bookingId].courtId}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Đơn giá</div>
                              <div className="font-semibold text-gray-900">
                                {bookingDetails[booking.bookingId].unitPrice?.toLocaleString('vi-VN')} VNĐ
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Tổng tiền</div>
                              <div className="font-semibold text-blue-600">
                                {bookingDetails[booking.bookingId].totalAmount?.toLocaleString('vi-VN')} VNĐ
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Loại</div>
                              <div className="font-semibold text-gray-900">{bookingDetails[booking.bookingId].tier}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Trạng thái</div>
                              <div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bookingDetails[booking.bookingId].status)}`}>
                                  {getStatusText(bookingDetails[booking.bookingId].status)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {bookingDetails[booking.bookingId].depositRequired && (
                            <div className="pt-3 border-t border-gray-200">
                              <div className="text-sm text-gray-500">Số tiền cọc</div>
                              <div className="font-semibold text-purple-600">
                                {bookingDetails[booking.bookingId].depositAmount?.toLocaleString('vi-VN')} VNĐ
                              </div>
                            </div>
                          )}

                          {bookingDetails[booking.bookingId].slotIds && bookingDetails[booking.bookingId].slotIds.length > 0 && (
                            <div className="pt-3 border-t border-gray-200">
                              <div className="text-sm text-gray-500 mb-2">Danh sách slot</div>
                              <div className="space-y-1">
                                {bookingDetails[booking.bookingId].slotIds.map((slotId, idx) => (
                                  <div key={idx} className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded">
                                    {slotId}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && bookings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có lần đặt sân nào</h3>
              <p className="text-gray-600 mb-6">Bắt đầu đặt sân ngay hôm nay!</p>
              <button
                onClick={() => navigate('/booking')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Đặt sân ngay
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default MyBookingsPage;

