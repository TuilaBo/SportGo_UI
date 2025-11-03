import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const MyReviewsPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const params = new URLSearchParams({
        page: String(page),
        size: String(size)
      });

      const url = `/api/reviews/my-reviews?${params.toString()}`;
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
      setReviews(Array.isArray(data) ? data : []);
      setHasMore(data.length === size);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [user, page, size]);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user, page, size, loadReviews]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment && review.comment !== 'string' ? review.comment : '');
    setShowEditModal(true);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      setEditLoading(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const response = await fetch(`/api/reviews/${editingReview.reviewId}`, {
        method: 'PUT',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment || 'string'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      setReviews(prev => prev.map(r => 
        r.reviewId === editingReview.reviewId ? data : r
      ));

      alert('Cập nhật đánh giá thành công!');
      setShowEditModal(false);
      setEditingReview(null);
      setEditRating(5);
      setEditComment('');
    } catch (err) {
      console.error('Failed to update review:', err);
      alert(`Lỗi khi cập nhật đánh giá: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      setDeletingReviewId(reviewId);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      alert('Đã xóa đánh giá thành công!');
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert(`Lỗi khi xóa đánh giá: ${err.message}`);
    } finally {
      setDeletingReviewId(null);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Đánh Giá Của Tôi</h1>
            <p className="text-gray-600 text-lg">Xem lại tất cả đánh giá bạn đã gửi</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-lg text-gray-600">Đang tải danh sách đánh giá...</p>
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
                onClick={loadReviews}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Reviews List */}
          {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.reviewId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-3xl">⭐</div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {review.courtName}
                            </h3>
                            <p className="text-sm text-gray-600">{review.facilityName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-500">Booking ID:</span>
                          <span className="text-sm font-medium text-gray-900">#{review.bookingId}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-2xl ${
                                i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>

                    {review.comment && review.comment !== 'string' && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.reviewId)}
                        disabled={deletingReviewId === review.reviewId}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingReviewId === review.reviewId ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
              <p className="text-gray-600 mb-6">Bạn chưa đánh giá đặt sân nào</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && reviews.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Hiển thị:</label>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Trang {page}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sửa đánh giá</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReview(null);
                  setEditRating(5);
                  setEditComment('');
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
                      onClick={() => setEditRating(star)}
                      className={`text-4xl transition-transform hover:scale-110 ${
                        star <= editRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">{editRating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét (tùy chọn)
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {editLoading && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReview(null);
                    setEditRating(5);
                    setEditComment('');
                  }}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateReview}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;

