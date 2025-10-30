import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GoogleMapEmbed from './GoogleMapEmbed';

export default function SearchFacilities() {
  const { user } = useAuth();
  const [sportTypes, setSportTypes] = useState([]);
  const [searchForm, setSearchForm] = useState({
    q: '',
    sportTypeId: 1,
    date: new Date().toISOString().split('T')[0],
    start: '08:00',
    end: '10:00',
    tier: 'Normal'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Facility detail modal states
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityDetail, setFacilityDetail] = useState(null);
  const [facilityDetailLoading, setFacilityDetailLoading] = useState(false);
  const [facilityDetailError, setFacilityDetailError] = useState(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  
  // Court detail states
  const [courts, setCourts] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [courtsError, setCourtsError] = useState(null);
  
  // Slot detail states
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [showSlotsModal, setShowSlotsModal] = useState(false);

  // Booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Slot, 2: Confirm
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Load sport types
  useEffect(() => {
    const loadSportTypes = async () => {
      try {
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        const res = await fetch('/api/provider/sport-types', {
          method: 'GET',
          headers: {
            'accept': 'text/plain',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setSportTypes(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to load sport types:', e);
        // Fallback data
        setSportTypes([
          { sportTypeId: 1, name: 'Bóng đá' },
          { sportTypeId: 2, name: 'Bóng rổ' },
          { sportTypeId: 3, name: 'Cầu lông' },
          { sportTypeId: 4, name: 'Tennis' }
        ]);
      }
    };

    if (user) {
      loadSportTypes();
    }
  }, [user]);

  const toApiDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const [y, m, d] = yyyyMmDd.split('-');
    return `${m}/${d}/${y}`; // MM/DD/YYYY
  };

  // Search facilities
  const searchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const params = new URLSearchParams({
        q: searchForm.q || '',
        sportTypeId: searchForm.sportTypeId.toString(),
        date: toApiDate(searchForm.date),
        tier: searchForm.tier,
        page: '1',
        size: '10'
      });

      const res = await fetch(`/api/search/facilities?${params}`, {
        method: 'GET',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResults(Array.isArray(data.items) ? data.items : []);
      setShowResults(true);
    } catch (e) {
      setError(e.message || String(e));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchFacilities();
  };

  // Load facility detail
  const loadFacilityDetail = async (facilityId) => {
    try {
      setFacilityDetailLoading(true);
      setFacilityDetailError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/facilities/${facilityId}`, {
        method: 'GET',
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
      setFacilityDetail(data);
    } catch (e) {
      setFacilityDetailError(e.message || String(e));
      setFacilityDetail(null);
    } finally {
      setFacilityDetailLoading(false);
    }
  };

  // Load courts for a facility
  const loadCourts = async (facilityId) => {
    try {
      setCourtsLoading(true);
      setCourtsError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/search/facilities/${facilityId}/courts?sportTypeId=${searchForm.sportTypeId}&page=1&size=20`, {
        method: 'GET',
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
      setCourts(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setCourtsError(e.message || String(e));
      setCourts([]);
    } finally {
      setCourtsLoading(false);
    }
  };

  // Load slots for a court
  const loadSlots = async (courtId) => {
    try {
      setSlotsLoading(true);
      setSlotsError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/courts/courts/${courtId}/slots?date=${searchForm.date}&tier=${searchForm.tier}`, {
        method: 'GET',
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
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      setSlotsError(e.message || String(e));
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Open facility detail modal
  const openFacilityDetail = (facility) => {
    setSelectedFacility(facility);
    setShowFacilityModal(true);
    loadFacilityDetail(facility.facilityId);
    loadCourts(facility.facilityId);
  };

  // Close facility detail modal
  const closeFacilityDetail = () => {
    setShowFacilityModal(false);
    setSelectedFacility(null);
    setFacilityDetail(null);
    setCourts([]);
    setFacilityDetailError(null);
    setCourtsError(null);
  };

  // Open slots modal
  const openSlotsModal = (court) => {
    setSelectedCourt(court);
    setShowSlotsModal(true);
    loadSlots(court.courtId);
  };

  // Close slots modal
  const closeSlotsModal = () => {
    setShowSlotsModal(false);
    setSelectedCourt(null);
    setSlots([]);
    setSlotsError(null);
  };

  // Booking functions
  const openBookingModal = (court) => {
    setSelectedCourt(court);
    setShowBookingModal(true);
    setBookingStep(1);
    setSelectedSlot(null);
    // Load available slots for booking
    loadSlots(court.courtId);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedCourt(null);
    setBookingStep(1);
    setSelectedSlot(null);
    setSlots([]);
    setSlotsError(null);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isBooked) {
      setSelectedSlot(slot);
      setBookingStep(2);
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedSlot || !selectedCourt) return;
    
    setBookingLoading(true);
    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      // Call the actual booking API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          courtId: selectedCourt.courtId,
          slotIds: [selectedSlot.slotId],
          bookingType: "123"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const bookingResult = await response.json();
      
      // Show success message
      alert(`Đặt sân thành công!\nSân: ${selectedCourt.name}\nThời gian: ${selectedSlot.startTime} - ${selectedSlot.endTime}\nGiá: ${selectedSlot.price?.toLocaleString('vi-VN')} VNĐ\nMã đặt sân: ${bookingResult.bookingId || 'N/A'}`);
      
      closeBookingModal();
      
      // Refresh slots to show updated availability
      loadSlots(selectedCourt.courtId);
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert(`Có lỗi xảy ra khi đặt sân: ${error.message}\nVui lòng thử lại.`);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm sân thể thao
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm và đặt sân thể thao phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Sport Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bộ môn
              </label>
              <select
                value={searchForm.sportTypeId}
                onChange={(e) => setSearchForm(prev => ({ ...prev, sportTypeId: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sportTypes.map((sport) => (
                  <option key={sport.sportTypeId} value={sport.sportTypeId}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày
              </label>
              <input
                type="date"
                value={searchForm.date}
                onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={searchForm.start}
                onChange={(e) => setSearchForm(prev => ({ ...prev, start: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={searchForm.end}
                onChange={(e) => setSearchForm(prev => ({ ...prev, end: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tìm...' : 'Tìm sân'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Kết quả tìm kiếm ({results.length} sân)
              </h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-400 text-6xl mb-4">🏟️</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sân nào</h4>
                <p className="text-gray-600">Thử thay đổi thời gian hoặc bộ môn để tìm kiếm khác</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {results.map((facility) => (
                  <div 
                    key={facility.facilityId} 
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openFacilityDetail(facility)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {facility.facilityName}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          📍 {facility.fullAddress}
                        </p>
                        {facility.distanceKm && (
                          <p className="text-blue-600 text-sm mt-1">
                            📏 Cách {facility.distanceKm}km
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Có sân trống
                        </span>
                      </div>
                    </div>

                    {facility.recommended && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-blue-900">
                            Sân được đề xuất: {facility.recommended.courtName}
                          </h5>
                          <span className="text-sm text-blue-700">
                            {facility.recommended.sportTypeName}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Thời gian:</span>
                            <div className="font-medium">
                              {formatTime(facility.recommended.firstAvailableStart)} - {formatTime(facility.recommended.firstAvailableEnd)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Giá từ:</span>
                            <div className="font-medium text-green-600">
                              {facility.recommended.priceFrom?.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Trạng thái:</span>
                            <div className="font-medium">
                              {facility.recommended.hasAvailableSlot ? (
                                <span className="text-green-600">Có sân trống</span>
                              ) : (
                                <span className="text-red-600">Hết sân</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Đặt sân ngay
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Facility Detail Modal */}
        {showFacilityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Chi tiết chi nhánh
                </h3>
                <button
                  onClick={closeFacilityDetail}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Loading State */}
              {facilityDetailLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải thông tin...</p>
                </div>
              )}

              {/* Error State */}
              {facilityDetailError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{facilityDetailError}</span>
                  </div>
                </div>
              )}

              {/* Facility Detail Content */}
              {!facilityDetailLoading && !facilityDetailError && facilityDetail && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {facilityDetail.name || selectedFacility?.facilityName}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Địa chỉ:</span>
                        <div className="font-medium">
                          {facilityDetail.address || selectedFacility?.fullAddress}
                        </div>
                      </div>
                      {facilityDetail.phoneNumber && (
                        <div>
                          <span className="text-gray-600">Số điện thoại:</span>
                          <div className="font-medium">{facilityDetail.phoneNumber}</div>
                        </div>
                      )}
                      {facilityDetail.email && (
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <div className="font-medium">{facilityDetail.email}</div>
                        </div>
                      )}
                      {facilityDetail.description && (
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Mô tả:</span>
                          <div className="font-medium">{facilityDetail.description}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Google Map */}
                  {(facilityDetail.address || selectedFacility?.fullAddress) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Vị trí trên bản đồ</h5>
                      <GoogleMapEmbed 
                        address={facilityDetail.address || selectedFacility?.fullAddress}
                        height={300}
                      />
                    </div>
                  )}

                  {/* Operating Hours */}
                  {facilityDetail.operatingHours && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 mb-3">Giờ hoạt động</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(facilityDetail.operatingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{day}:</span>
                            <span className="font-medium">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {facilityDetail.amenities && facilityDetail.amenities.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-900 mb-3">Tiện ích</h5>
                      <div className="flex flex-wrap gap-2">
                        {facilityDetail.amenities.map((amenity, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Courts */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-900 mb-3">Danh sách sân</h5>
                    
                    {/* Courts Loading */}
                    {courtsLoading && (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <p className="mt-2 text-sm text-gray-600">Đang tải danh sách sân...</p>
                      </div>
                    )}
                    
                    {/* Courts Error */}
                    {courtsError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-red-700">{courtsError}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Courts List */}
                    {!courtsLoading && !courtsError && courts.length > 0 && (
                      <div className="grid gap-4">
                        {courts.map((court) => (
                          <div key={court.courtId} className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              {/* Left side - Court Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h6 className="font-semibold text-gray-900 text-lg">{court.name}</h6>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    court.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {court.isActive ? '🟢 Hoạt động' : '🔴 Tạm ngưng'}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">🏟️</span>
                                    <span className="text-sm text-gray-600">{court.courtType}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">⚽</span>
                                    <span className="text-sm text-gray-600">{court.sport}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right side - Price and Action */}
                              <div className="text-right ml-4">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg mb-3">
                                  <div className="text-sm font-medium">
                                    {court.defaultPrice?.toLocaleString('vi-VN')} VNĐ
                                  </div>
                                  <div className="text-xs opacity-90">Giá/giờ</div>
                                </div>
                                
                                <button
                                  onClick={() => openBookingModal(court)}
                                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                  📅 Đặt sân ngay
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No Courts */}
                    {!courtsLoading && !courtsError && courts.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p>Không có sân nào phù hợp</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={closeFacilityDetail}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slots Detail Modal */}
        {showSlotsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Chi tiết slot - {selectedCourt?.name}
                </h3>
                <button
                  onClick={closeSlotsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Court Info */}
              {selectedCourt && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tên sân:</span>
                      <div className="font-medium">{selectedCourt.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Loại sân:</span>
                      <div className="font-medium">{selectedCourt.courtType}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Giá mặc định:</span>
                      <div className="font-medium text-green-600">
                        {selectedCourt.defaultPrice?.toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {slotsLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải danh sách slot...</p>
                </div>
              )}

              {/* Error State */}
              {slotsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{slotsError}</span>
                  </div>
                </div>
              )}

              {/* Slots List */}
              {!slotsLoading && !slotsError && slots.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Danh sách slot ngày {searchForm.date}</h4>
                  <div className="grid gap-3">
                    {slots.map((slot) => (
                      <div 
                        key={slot.slotId} 
                        className={`rounded-lg p-4 border ${
                          slot.isBooked 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="text-sm text-gray-600">
                              Tier: {slot.tier} | Giá: {slot.price?.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              slot.isBooked ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {slot.isBooked ? 'Đã đặt' : 'Có thể đặt'}
                            </div>
                            {!slot.isBooked && (
                              <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                                Đặt ngay
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Slots */}
              {!slotsLoading && !slotsError && slots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Không có slot nào trong ngày này</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  onClick={closeSlotsModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Đặt sân - {selectedCourt?.name}
                </h3>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Booking Steps */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${
                  bookingStep > 1 ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>

              {/* Step 1: Select Slot */}
              {bookingStep === 1 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Chọn slot đặt sân</h4>
                  
                  {/* Loading State */}
                  {slotsLoading && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-600">Đang tải danh sách slot...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {slotsError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-red-700">{slotsError}</span>
                      </div>
                    </div>
                  )}

                  {/* Slots List */}
                  {!slotsLoading && !slotsError && slots.length > 0 && (
                    <div className="grid gap-3">
                      {slots.map((slot) => (
                        <div 
                          key={slot.slotId} 
                          className={`rounded-lg p-4 border cursor-pointer transition-all ${
                            slot.isBooked 
                              ? 'bg-red-50 border-red-200 cursor-not-allowed opacity-60' 
                              : 'bg-green-50 border-green-200 hover:bg-green-100 hover:shadow-md'
                          }`}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <div className="text-sm text-gray-600">
                                Tier: {slot.tier} | Giá: {slot.price?.toLocaleString('vi-VN')} VNĐ
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                slot.isBooked ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {slot.isBooked ? '❌ Đã đặt' : '✅ Có thể đặt'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Slots */}
                  {!slotsLoading && !slotsError && slots.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Không có slot nào trong ngày này</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Confirm Booking */}
              {bookingStep === 2 && selectedSlot && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Xác nhận đặt sân</h4>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🏟️</div>
                        <h4 className="font-bold text-gray-800">{selectedCourt?.name}</h4>
                        <p className="text-sm text-gray-600">{selectedCourt?.courtType}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl mb-2">📅</div>
                        <h4 className="font-bold text-gray-800">Ngày</h4>
                        <p className="text-gray-600">{searchForm.date}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl mb-2">🕐</div>
                        <h4 className="font-bold text-gray-800">Thời gian</h4>
                        <p className="text-gray-600">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-gray-800 mb-4">Chi tiết thanh toán</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Giá slot</span>
                        <span>{selectedSlot.price?.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí dịch vụ</span>
                        <span>20,000 VNĐ</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span className="text-green-600">
                          {((selectedSlot.price || 0) + 20000).toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={handleBookingConfirm}
                      disabled={bookingLoading}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        bookingLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                      }`}
                    >
                      {bookingLoading ? 'Đang xử lý...' : 'Xác nhận đặt sân'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  onClick={closeBookingModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
