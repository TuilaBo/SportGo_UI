import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import GoogleMapEmbed from '../../components/GoogleMapEmbed';
import BookingPaymentModal from '../../components/BookingPaymentModal';

const BookingPage = () => {
  const { isLoggedIn, user, logout } = useAuth();
  
  // Booking flow states
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Facility, 2: Select Court, 3: Select Slot
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Data states
  const [facilities, setFacilities] = useState([]);
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  
  // Loading states
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // Error states
  const [facilitiesError, setFacilitiesError] = useState(null);
  const [courtsError, setCourtsError] = useState(null);
  const [slotsError, setSlotsError] = useState(null);
  
  // Sport types
  const [sportTypes, setSportTypes] = useState([]);
  const [selectedSportType, setSelectedSportType] = useState(null);
  
  // Date selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTier, setSelectedTier] = useState('Normal');
  const toApiDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const [y, m, d] = yyyyMmDd.split('-');
    return `${m}/${d}/${y}`; // MM/DD/YYYY
  };

  const [facilitiesRef, facilitiesVisible] = useScrollAnimation(0.1);
  const [courtsRef, courtsVisible] = useScrollAnimation(0.1);
  const [slotsRef, slotsVisible] = useScrollAnimation(0.1);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(null);

  // Load sport types
  useEffect(() => {
    const loadSportTypes = async () => {
      try {
        const res = await fetch('/api/sport-types', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setSportTypes(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setSelectedSportType(data[0]);
        }
      } catch (e) {
        console.error('Failed to load sport types:', e);
        setSportTypes([]);
      }
    };

    loadSportTypes();
  }, []);

  // Load facilities when sport type is selected
  useEffect(() => {
    if (selectedSportType && selectedDate) {
      loadFacilities();
    }
  }, [selectedSportType, selectedDate]);

  const loadFacilities = async () => {
    try {
      setFacilitiesLoading(true);
      setFacilitiesError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const apiDate = encodeURIComponent(toApiDate(selectedDate));
      const res = await fetch(`/api/search/facilities?sportTypeId=${selectedSportType.sportTypeId}&date=${apiDate}&tier=${selectedTier}&page=1&size=20&q=`, {
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
      setFacilities(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setFacilitiesError(e.message || String(e));
      setFacilities([]);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const loadCourts = async (facilityId) => {
    try {
      setCourtsLoading(true);
      setCourtsError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/search/facilities/${facilityId}/courts?sportTypeId=${selectedSportType.sportTypeId}&page=1&size=20`, {
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

  const loadSlots = async (courtId) => {
    try {
      setSlotsLoading(true);
      setSlotsError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/courts/courts/${courtId}/slots?date=${selectedDate}&tier=${selectedTier}`, {
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

  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setSelectedCourt(null);
    setSelectedSlot(null);
    setBookingStep(2);
    loadCourts(facility.facilityId);
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    setSelectedSlot(null);
    setBookingStep(3);
    loadSlots(court.courtId);
  };

  const handleSlotSelect = async (slot) => {
    if (!slot.isBooked) {
      setSelectedSlot(slot);
      
      // Confirm booking
      const confirmed = window.confirm(
        `Xác nhận đặt sân?\n\n` +
        `Sân: ${selectedCourt?.name}\n` +
        `Thời gian: ${slot.startTime} - ${slot.endTime}\n` +
        `Giá: ${slot.price?.toLocaleString('vi-VN')} VNĐ\n` +
        `Ngày: ${selectedDate}`
      );
      
      if (confirmed) {
        await handleBookingConfirm(slot);
      }
    }
  };

  const handleBookingConfirm = async (slot) => {
    if (!slot || !selectedCourt) return;
    
    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      // Call the actual booking API
      const response = await fetch('/api/Bookings', {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          courtId: selectedCourt.courtId,
          slotIds: [slot.slotId],
          bookingType: selectedTier
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const bookingResult = await response.json();
      
      // If booking is Pending, show payment modal for deposit
      if (bookingResult.status === 'Pending' && bookingResult.bookingId) {
        setPendingBookingId(bookingResult.bookingId);
        setShowPaymentModal(true);
      } else {
        // Show success message
        alert(`Đặt sân thành công!\n\n` +
          `Sân: ${selectedCourt.name}\n` +
          `Cơ sở: ${selectedFacility?.facilityName}\n` +
          `Thời gian: ${slot.startTime} - ${slot.endTime}\n` +
          `Ngày: ${selectedDate}\n` +
          `Giá: ${bookingResult.totalAmount?.toLocaleString('vi-VN')} VNĐ\n` +
          `Trạng thái: ${bookingResult.status}\n` +
          `Mã đặt sân: ${bookingResult.bookingId || 'N/A'}`);
        
        // Reset booking flow
        resetBooking();
      }
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert(`❌ Có lỗi xảy ra khi đặt sân: ${error.message}\nVui lòng thử lại.`);
    }
  };

  const resetBooking = () => {
    setBookingStep(1);
    setSelectedFacility(null);
    setSelectedCourt(null);
    setSelectedSlot(null);
    setFacilities([]);
    setCourts([]);
    setSlots([]);
  };

  const goBack = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
      if (bookingStep === 3) {
        setSelectedSlot(null);
        setSlots([]);
      } else if (bookingStep === 2) {
        setSelectedCourt(null);
        setCourts([]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full overflow-x-hidden">
      {/* Manager Bar */}
      <ManagerBar 
        isLoggedIn={isLoggedIn}
        userName={user?.name}
        userAvatar={user?.avatar}
        onLogout={logout}
      />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Đặt Sân Thể Thao
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Chọn cơ sở, sân và slot phù hợp để đặt lịch ngay hôm nay.
          </motion.p>
        </div>
      </div>

      {/* Booking Steps */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-8 mb-12">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    bookingStep >= step
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {step}
                </motion.div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                    bookingStep > step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {bookingStep === 1 && 'Bước 1: Chọn Cơ Sở'}
              {bookingStep === 2 && 'Bước 2: Chọn Sân'}
              {bookingStep === 3 && 'Bước 3: Chọn Slot'}
            </h2>
            <p className="text-gray-600">
              {bookingStep === 1 && 'Chọn cơ sở thể thao bạn muốn đặt'}
              {bookingStep === 2 && 'Chọn sân trong cơ sở đã chọn'}
              {bookingStep === 3 && 'Chọn thời gian slot phù hợp'}
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Môn thể thao</label>
                <select
                  value={selectedSportType?.sportTypeId || ''}
                  onChange={(e) => {
                    const sportType = sportTypes.find(st => st.sportTypeId === parseInt(e.target.value));
                    setSelectedSportType(sportType);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sportTypes.map((sport) => (
                    <option key={sport.sportTypeId} value={sport.sportTypeId}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Normal">Normal</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Facility Selection */}
      {bookingStep === 1 && (
        <motion.div
          ref={facilitiesRef}
          initial={{ opacity: 0, y: 50 }}
          animate={facilitiesVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div className="max-w-7xl mx-auto">
            {/* Loading State */}
            {facilitiesLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg text-gray-600">Đang tải danh sách cơ sở...</p>
              </div>
            )}

            {/* Error State */}
            {facilitiesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg text-red-700">{facilitiesError}</span>
                </div>
                    </div>
                  )}
                  
            {/* Facilities Grid */}
            {!facilitiesLoading && !facilitiesError && facilities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {facilities.map((facility, index) => (
                  <motion.div
                    key={facility.facilityId}
                    initial={{ opacity: 0, y: 50 }}
                    animate={facilitiesVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-105"
                    onClick={() => handleFacilitySelect(facility)}
                  >
                  <div className="p-6">
                    <div className="text-center mb-4">
                        <div className="text-6xl mb-4">🏟️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{facility.facilityName}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{facility.fullAddress}</p>
                    </div>
                    
                      {facility.recommended && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Sân được đề xuất:</h4>
                          <div className="text-sm">
                            <p className="font-medium">{facility.recommended.courtName}</p>
                            <p className="text-green-600 font-semibold">
                              {facility.recommended.priceFrom?.toLocaleString('vi-VN')} VNĐ/giờ
                            </p>
                            <p className="text-gray-600">
                              {facility.recommended.firstAvailableStart && facility.recommended.firstAvailableEnd && 
                                `${facility.recommended.firstAvailableStart.split('T')[1].substring(0,5)} - ${facility.recommended.firstAvailableEnd.split('T')[1].substring(0,5)}`
                              }
                            </p>
                      </div>
                    </div>
                      )}
                    
                      <motion.button
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Chọn Cơ Sở Này
                      </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            )}

            {/* No Facilities */}
            {!facilitiesLoading && !facilitiesError && facilities.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy cơ sở nào</h3>
                <p className="text-gray-600">Vui lòng thử lại với bộ lọc khác</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 2: Court Selection */}
      {bookingStep === 2 && (
        <motion.div
          ref={courtsRef}
          initial={{ opacity: 0, x: 50 }}
          animate={courtsVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Cơ Sở Đã Chọn</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">🏟️</div>
                      <div>
                      <h4 className="text-xl font-bold text-gray-800">{selectedFacility?.facilityName}</h4>
                      <p className="text-gray-600">{selectedFacility?.fullAddress}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={goBack}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  ← Quay lại
                </button>
                  </div>
                </div>

            {/* Loading State */}
            {courtsLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg text-gray-600">Đang tải danh sách sân...</p>
              </div>
            )}

            {/* Error State */}
            {courtsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg text-red-700">{courtsError}</span>
                </div>
                    </div>
            )}

            {/* Courts Grid */}
            {!courtsLoading && !courtsError && courts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courts.map((court, index) => (
                  <motion.div
                    key={court.courtId}
                    initial={{ opacity: 0, y: 50 }}
                    animate={courtsVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-105"
                    onClick={() => handleCourtSelect(court)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">⚽</div>
                    <div>
                            <h3 className="text-lg font-bold text-gray-800">{court.name}</h3>
                            <p className="text-gray-600 text-sm">{court.courtType}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          court.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {court.isActive ? '🟢 Hoạt động' : '🔴 Tạm ngưng'}
                        </span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg mb-4">
                        <div className="text-lg font-bold">
                          {court.defaultPrice?.toLocaleString('vi-VN')} VNĐ
                    </div>
                        <div className="text-sm opacity-90">Giá/giờ</div>
                  </div>

                    <motion.button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                        Chọn Sân Này
                    </motion.button>
                  </div>
                  </motion.div>
                ))}
                </div>
            )}

            {/* No Courts */}
            {!courtsLoading && !courtsError && courts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không có sân nào</h3>
                <p className="text-gray-600">Cơ sở này không có sân phù hợp</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 3: Slot Selection */}
      {bookingStep === 3 && (
        <motion.div
          ref={slotsRef}
          initial={{ opacity: 0, x: 50 }}
          animate={slotsVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Sân Đã Chọn</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">⚽</div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{selectedCourt?.name}</h4>
                      <p className="text-gray-600">{selectedCourt?.courtType} - {selectedFacility?.facilityName}</p>
                  </div>
                  </div>
                </div>
                <button
                  onClick={goBack}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  ← Quay lại
                </button>
              </div>
                  </div>

            {/* Loading State */}
            {slotsLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg text-gray-600">Đang tải danh sách slot...</p>
                  </div>
            )}

            {/* Error State */}
            {slotsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg text-red-700">{slotsError}</span>
                </div>
              </div>
            )}

            {/* Slots Grid */}
            {!slotsLoading && !slotsError && slots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot, index) => (
                  <motion.div
                    key={slot.slotId}
                    initial={{ opacity: 0, y: 50 }}
                    animate={slotsVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                      slot.isBooked 
                        ? 'bg-red-50 border-red-200 cursor-not-allowed opacity-60' 
                        : 'bg-green-50 border-green-200 hover:bg-green-100 hover:shadow-lg hover:scale-105'
                    }`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">🕐</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {slot.startTime} - {slot.endTime}
                      </h3>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          Tier: <span className="font-semibold">{slot.tier}</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {slot.price?.toLocaleString('vi-VN')} VNĐ
                        </div>
                        <div className={`text-sm font-medium ${
                          slot.isBooked ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {slot.isBooked ? '❌ Đã đặt' : '✅ Có thể đặt'}
              </div>
            </div>
          </div>
        </motion.div>
                ))}
              </div>
            )}

            {/* No Slots */}
            {!slotsLoading && !slotsError && slots.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🕐</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không có slot nào</h3>
                <p className="text-gray-600">Không có slot trống trong ngày này</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <Footer />

      {/* Payment Modal */}
      {user && (
        <BookingPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingBookingId(null);
            resetBooking();
          }}
          bookingId={pendingBookingId}
          paymentType="deposit"
          accessToken={user.accessToken || localStorage.getItem('accessToken')}
          onPaymentSuccess={() => {
            alert('Thanh toán cọc thành công! Đặt sân đã được xác nhận.');
          }}
        />
      )}
    </div>
  );
};

export default BookingPage;