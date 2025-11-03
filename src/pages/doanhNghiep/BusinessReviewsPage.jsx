import React, { useState, useEffect, useCallback } from 'react';
import BusinessLayout from '../../components/layouts/BusinessLayout';
import { useAuth } from '../../contexts/AuthContext';

export default function BusinessReviewsPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [filterType, setFilterType] = useState('facility'); // 'facility' or 'court'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [facilityStats, setFacilityStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [courtStats, setCourtStats] = useState(null);
  const [loadingCourtStats, setLoadingCourtStats] = useState(false);
  const [courtStatsError, setCourtStatsError] = useState(null);

  // Load facilities
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoadingFacilities(true);
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        if (!accessToken) {
          setFacilities([]);
          return;
        }
        const res = await fetch('/api/provider/facilities?page=1&size=50', {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setFacilities(items);
        if (items.length > 0 && selectedFacilityId === null) {
          setSelectedFacilityId(items[0].facilityId);
        }
      } catch (e) {
        console.error('Failed to load facilities:', e);
        setFacilities([]);
      } finally {
        setLoadingFacilities(false);
      }
    };
    loadFacilities();
  }, [user]);

  // Load courts when facility is selected (only when filterType is 'court')
  useEffect(() => {
    if (filterType !== 'court') {
      setCourts([]);
      setSelectedCourtId(null);
      return;
    }

    if (!selectedFacilityId) {
      setCourts([]);
      setSelectedCourtId(null);
      return;
    }

    const loadCourts = async () => {
      try {
        setLoadingCourts(true);
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        const res = await fetch(`/api/provider/facilities/${selectedFacilityId}/courts?page=1&size=50`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setCourts(items);
      } catch (e) {
        console.error('Failed to load courts:', e);
        setCourts([]);
      } finally {
        setLoadingCourts(false);
      }
    };

    loadCourts();
  }, [user, selectedFacilityId, filterType]);

  // Load reviews
  const loadReviews = useCallback(async () => {
    if (filterType === 'facility' && !selectedFacilityId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    if (filterType === 'court' && !selectedCourtId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const params = new URLSearchParams({
        page: String(page),
        size: String(size)
      });

      const url = filterType === 'court'
        ? `/api/reviews/court/${selectedCourtId}?${params.toString()}`
        : `/api/reviews/facility/${selectedFacilityId}?${params.toString()}`;
      
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
  }, [user, filterType, selectedFacilityId, selectedCourtId, page, size]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Load facility stats
  useEffect(() => {
    if (!selectedFacilityId || filterType !== 'facility') {
      setFacilityStats(null);
      return;
    }

    const loadStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError(null);
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        const res = await fetch(`/api/reviews/facility/${selectedFacilityId}/stats`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setFacilityStats(data);
      } catch (e) {
        console.error('Failed to load facility stats:', e);
        setStatsError(e.message);
        setFacilityStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [user, selectedFacilityId, filterType]);

  // Load court stats
  useEffect(() => {
    if (!selectedCourtId || filterType !== 'court') {
      setCourtStats(null);
      return;
    }

    const loadStats = async () => {
      try {
        setLoadingCourtStats(true);
        setCourtStatsError(null);
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        const res = await fetch(`/api/reviews/court/${selectedCourtId}/stats`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCourtStats(data);
      } catch (e) {
        console.error('Failed to load court stats:', e);
        setCourtStatsError(e.message);
        setCourtStats(null);
      } finally {
        setLoadingCourtStats(false);
      }
    };

    loadStats();
  }, [user, selectedCourtId, filterType]);

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

  return (
    <BusinessLayout title="Đánh giá">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Đánh giá của khách hàng</h1>
          <button
            onClick={loadReviews}
            disabled={loading || (filterType === 'facility' && !selectedFacilityId) || (filterType === 'court' && !selectedCourtId)}
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

        {/* Filter Type Toggle */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lọc theo
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFilterType('facility');
                setSelectedCourtId(null);
                setPage(1);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'facility'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chi nhánh
            </button>
            <button
              onClick={() => {
                setFilterType('court');
                setSelectedCourtId(null);
                setPage(1);
                if (!selectedFacilityId) {
                  setCourts([]);
                }
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'court'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sân
            </button>
          </div>
        </div>

        {/* Facility Selector */}
        {filterType === 'facility' && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn chi nhánh
                  </label>
                  <select
                    value={selectedFacilityId || ''}
                    onChange={(e) => {
                      setSelectedFacilityId(e.target.value ? Number(e.target.value) : null);
                      setSelectedCourtId(null);
                      setPage(1);
                    }}
                    disabled={loadingFacilities}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loadingFacilities ? (
                      <option>Đang tải...</option>
                    ) : facilities.length === 0 ? (
                      <option>Không có chi nhánh</option>
                    ) : (
                      <>
                        <option value="">Chọn chi nhánh</option>
                        {facilities.map((facility) => (
                          <option key={facility.facilityId} value={facility.facilityId}>
                            {facility.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Facility Stats */}
            {selectedFacilityId && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê đánh giá</h3>
                {loadingStats ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải thống kê...</p>
                  </div>
                ) : statsError ? (
                  <div className="text-center py-4 text-red-600 text-sm">{statsError}</div>
                ) : facilityStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Tổng đánh giá</div>
                        <div className="text-2xl font-bold text-blue-600">{facilityStats.totalReviews || 0}</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Điểm trung bình</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {facilityStats.averageRating ? facilityStats.averageRating.toFixed(1) : '0.0'}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">5 sao</div>
                        <div className="text-2xl font-bold text-green-600">{facilityStats.fiveStars || 0}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">4 sao</div>
                        <div className="text-2xl font-bold text-purple-600">{facilityStats.fourStars || 0}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">3 sao</div>
                        <div className="text-lg font-bold text-orange-600">{facilityStats.threeStars || 0}</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">2 sao</div>
                        <div className="text-lg font-bold text-red-600">{facilityStats.twoStars || 0}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">1 sao</div>
                        <div className="text-lg font-bold text-gray-600">{facilityStats.oneStar || 0}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}

        {/* Court Selector */}
        {filterType === 'court' && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn chi nhánh
                  </label>
                  <select
                    value={selectedFacilityId || ''}
                    onChange={(e) => {
                      const newFacilityId = e.target.value ? Number(e.target.value) : null;
                      setSelectedFacilityId(newFacilityId);
                      setSelectedCourtId(null);
                      setPage(1);
                      if (!newFacilityId) {
                        setCourts([]);
                      }
                    }}
                    disabled={loadingFacilities}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mb-3"
                  >
                    {loadingFacilities ? (
                      <option>Đang tải...</option>
                    ) : facilities.length === 0 ? (
                      <option>Không có chi nhánh</option>
                    ) : (
                      <>
                        <option value="">Chọn chi nhánh</option>
                        {facilities.map((facility) => (
                          <option key={facility.facilityId} value={facility.facilityId}>
                            {facility.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn sân
                  </label>
                  <select
                    value={selectedCourtId || ''}
                    onChange={(e) => {
                      setSelectedCourtId(e.target.value ? Number(e.target.value) : null);
                      setPage(1);
                    }}
                    disabled={loadingCourts || !selectedFacilityId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loadingCourts ? (
                      <option>Đang tải...</option>
                    ) : !selectedFacilityId ? (
                      <option>Chọn chi nhánh trước</option>
                    ) : courts.length === 0 ? (
                      <option>Không có sân</option>
                    ) : (
                      <>
                        <option value="">Chọn sân</option>
                        {courts.map((court) => {
                          const displayName = court.name && court.name.trim() 
                            ? court.name 
                            : (court.courtType && court.courtType.trim() 
                                ? `${court.courtType} (ID: ${court.courtId})`
                                : `Sân #${court.courtId}`);
                          return (
                            <option key={court.courtId} value={court.courtId}>
                              {displayName}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Court Stats */}
            {selectedCourtId && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê đánh giá</h3>
                {loadingCourtStats ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải thống kê...</p>
                  </div>
                ) : courtStatsError ? (
                  <div className="text-center py-4 text-red-600 text-sm">{courtStatsError}</div>
                ) : courtStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Tổng đánh giá</div>
                      <div className="text-2xl font-bold text-blue-600">{courtStats.totalReviews || 0}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Điểm trung bình</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {courtStats.averageRating ? courtStats.averageRating.toFixed(1) : '0.0'}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}

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

        {loading && reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách đánh giá...</p>
          </div>
        ) : (filterType === 'facility' && !selectedFacilityId) || (filterType === 'court' && (!selectedFacilityId || !selectedCourtId)) ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterType === 'facility' ? 'Chọn chi nhánh' : 'Chọn sân'}
            </h3>
            <p className="text-gray-600">
              {filterType === 'facility' 
                ? 'Vui lòng chọn chi nhánh để xem đánh giá'
                : 'Vui lòng chọn chi nhánh và sân để xem đánh giá'}
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
            <p className="text-gray-600">
              {filterType === 'facility' 
                ? 'Chi nhánh này chưa nhận được đánh giá từ khách hàng'
                : 'Sân này chưa nhận được đánh giá từ khách hàng'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.reviewId}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl">⭐</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {review.courtName}
                        </h3>
                        <p className="text-sm text-gray-600">{review.facilityName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>Booking ID: <span className="font-medium text-gray-900">#{review.bookingId}</span></span>
                      <span>Khách hàng: <span className="font-medium text-gray-900">{review.userName}</span></span>
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
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && ((filterType === 'facility' && selectedFacilityId) || (filterType === 'court' && selectedCourtId)) && reviews.length > 0 && (
          <div className="flex items-center justify-between">
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
      </div>
    </BusinessLayout>
  );
}

