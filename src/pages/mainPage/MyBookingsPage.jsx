import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import BookingPaymentModal from '../../components/BookingPaymentModal';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [bookingReviews, setBookingReviews] = useState({});

  const toApiDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const [y, m, d] = yyyyMmDd.split('-');
    return `${m}/${d}/${y}`;
  };

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const params = new URLSearchParams();
      if (filterDate) {
        params.append('date', toApiDate(filterDate));
      }

      const url = `/api/Bookings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
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
  }, [user, filterDate]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, loadBookings]);

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

          {/* Date Filter */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lọc theo ngày
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      loadBookings();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={loadBookings}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Tìm
              </button>
              {filterDate && (
                <button
                  onClick={() => {
                    setFilterDate('');
                    loadBookings();
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
            {filterDate && (
              <div className="mt-2 text-sm text-gray-600">
                Đang lọc: <span className="font-medium">{toApiDate(filterDate)}</span>
              </div>
            )}
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
                        {booking.status === 'Confirmed' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setPendingBookingId(booking.bookingId);
                                setShowPaymentModal(true);
                              }}
                              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                              Thanh toán phần còn lại
                            </button>
                          </div>
                        )}
                        {booking.status === 'Completed' && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            <button
                              onClick={() => {
                                setPendingBookingId(booking.bookingId);
                                setShowPaymentModal(true);
                              }}
                              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                              Thanh toán phần còn lại
                            </button>
                            {bookingReviews[booking.bookingId] ? (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-yellow-800">Đã đánh giá</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <span key={i} className={`text-lg ${i < bookingReviews[booking.bookingId].rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {bookingReviews[booking.bookingId].comment && bookingReviews[booking.bookingId].comment !== 'string' && (
                                  <p className="text-sm text-gray-700 mt-2">{bookingReviews[booking.bookingId].comment}</p>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setReviewBookingId(booking.bookingId);
                                  setReviewRating(5);
                                  setReviewComment('');
                                  setShowReviewModal(true);
                                }}
                                className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                              >
                                Đánh giá đặt sân
                              </button>
                            )}
                          </div>
                        )}
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

      {/* Payment Modal */}
      {user && (
        <BookingPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingBookingId(null);
            loadBookings();
          }}
          bookingId={pendingBookingId}
          paymentType="final"
          accessToken={user.accessToken || localStorage.getItem('accessToken')}
          onPaymentSuccess={() => {
            alert('Thanh toán thành công! Đặt sân đã hoàn tất.');
            loadBookings();
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Đánh giá đặt sân</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewBookingId(null);
                  setReviewRating(5);
                  setReviewComment('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Đánh giá sao
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-4xl transition-transform hover:scale-110 ${
                        star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">{reviewRating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét (tùy chọn)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {reviewLoading && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewBookingId(null);
                    setReviewRating(5);
                    setReviewComment('');
                  }}
                  disabled={reviewLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    if (!reviewBookingId) return;

                    try {
                      setReviewLoading(true);
                      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

                      const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                          'accept': 'text/plain',
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({
                          bookingId: reviewBookingId,
                          rating: reviewRating,
                          comment: reviewComment || 'string'
                        })
                      });

                      if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(errorText || `HTTP ${response.status}`);
                      }

                      const data = await response.json();
                      
                      setBookingReviews(prev => ({
                        ...prev,
                        [reviewBookingId]: {
                          rating: data.rating,
                          comment: data.comment
                        }
                      }));

                      alert('Cảm ơn bạn đã đánh giá!');
                      setShowReviewModal(false);
                      setReviewBookingId(null);
                      setReviewRating(5);
                      setReviewComment('');
                    } catch (err) {
                      console.error('Failed to submit review:', err);
                      alert(`Lỗi khi đánh giá: ${err.message}`);
                    } finally {
                      setReviewLoading(false);
                    }
                  }}
                  disabled={reviewLoading}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;

