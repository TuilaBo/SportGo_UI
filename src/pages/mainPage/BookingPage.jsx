import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const BookingPage = () => {
  const [selectedField, setSelectedField] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Field, 2: Select Time, 3: Confirm

  const [fieldsRef, fieldsVisible] = useScrollAnimation(0.1);
  const [bookingRef, bookingVisible] = useScrollAnimation(0.1);

  const fieldTypes = [
    {
      id: 1,
      name: 'Sân Bóng Đá 7 Người',
      image: '⚽',
      description: 'Sân bóng đá chuẩn 7 người với cỏ nhân tạo chất lượng cao',
      price: '200,000 VNĐ/giờ',
      features: ['Cỏ nhân tạo', 'Hệ thống chiếu sáng', 'Lưới chắn', 'Ghế ngồi'],
      available: true,
      rating: 4.8,
      reviews: 156
    },
    {
      id: 2,
      name: 'Sân Bóng Đá 11 Người',
      image: '🏟️',
      description: 'Sân bóng đá chuẩn quốc tế 11 người với cỏ tự nhiên',
      price: '500,000 VNĐ/giờ',
      features: ['Cỏ tự nhiên', 'Hệ thống chiếu sáng LED', 'Khán đài', 'Phòng thay đồ'],
      available: true,
      rating: 4.9,
      reviews: 89
    },
    {
      id: 3,
      name: 'Sân Tennis',
      image: '🎾',
      description: 'Sân tennis trong nhà với mặt sân cứng chuyên nghiệp',
      price: '150,000 VNĐ/giờ',
      features: ['Mặt sân cứng', 'Trong nhà', 'Hệ thống thông gió', 'Ghế ngồi'],
      available: true,
      rating: 4.7,
      reviews: 203
    },
    {
      id: 4,
      name: 'Sân Cầu Lông',
      image: '🏸',
      description: 'Sân cầu lông trong nhà với sàn gỗ cao cấp',
      price: '80,000 VNĐ/giờ',
      features: ['Sàn gỗ', 'Trong nhà', 'Điều hòa', 'Lưới chuyên dụng'],
      available: false,
      rating: 4.6,
      reviews: 134
    },
    {
      id: 5,
      name: 'Sân Bóng Chuyền',
      image: '🏐',
      description: 'Sân bóng chuyền trong nhà với sàn cao su',
      price: '120,000 VNĐ/giờ',
      features: ['Sàn cao su', 'Trong nhà', 'Lưới chuẩn', 'Ghế ngồi'],
      available: true,
      rating: 4.5,
      reviews: 78
    },
    {
      id: 6,
      name: 'Sân Bóng Rổ',
      image: '🏀',
      description: 'Sân bóng rổ ngoài trời với mặt sân cứng',
      price: '100,000 VNĐ/giờ',
      features: ['Mặt sân cứng', 'Ngoài trời', 'Rổ chuẩn', 'Hệ thống chiếu sáng'],
      available: true,
      rating: 4.4,
      reviews: 92
    }
  ];

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleFieldSelect = (field) => {
    setSelectedField(field);
    setBookingStep(2);
  };

  const handleBookingConfirm = () => {
    setBookingStep(3);
    // Here you would typically send the booking data to your API
    console.log('Booking confirmed:', {
      field: selectedField,
      date: selectedDate,
      time: selectedTime
    });
  };

  const resetBooking = () => {
    setSelectedField(null);
    setSelectedDate('');
    setSelectedTime('');
    setBookingStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full overflow-x-hidden">
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
            Chọn sân thể thao yêu thích và đặt lịch ngay hôm nay. 
            Trải nghiệm dịch vụ đặt sân tiện lợi và chuyên nghiệp.
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
              {bookingStep === 1 && 'Bước 1: Chọn Loại Sân'}
              {bookingStep === 2 && 'Bước 2: Chọn Thời Gian'}
              {bookingStep === 3 && 'Bước 3: Xác Nhận Đặt Sân'}
            </h2>
            <p className="text-gray-600">
              {bookingStep === 1 && 'Chọn loại sân thể thao bạn muốn đặt'}
              {bookingStep === 2 && 'Chọn ngày và giờ bạn muốn đặt sân'}
              {bookingStep === 3 && 'Xem lại thông tin và xác nhận đặt sân'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Field Selection */}
      {bookingStep === 1 && (
        <motion.div
          ref={fieldsRef}
          initial={{ opacity: 0, y: 50 }}
          animate={fieldsVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fieldTypes.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={fieldsVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer ${
                    !field.available ? 'opacity-60' : 'hover:scale-105'
                  }`}
                  onClick={() => field.available && handleFieldSelect(field)}
                >
                  {!field.available && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                        Tạm Ngừng
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-4">{field.image}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{field.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{field.description}</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">{field.price}</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm text-gray-600">{field.rating} ({field.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">Tiện ích:</h4>
                      <div className="flex flex-wrap gap-2">
                        {field.features.map((feature, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {field.available && (
                      <motion.button
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Chọn Sân Này
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Time Selection */}
      {bookingStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Selected Field Info */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Sân Đã Chọn</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-4xl">{selectedField?.image}</div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{selectedField?.name}</h4>
                        <p className="text-green-600 font-semibold">{selectedField?.price}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{selectedField?.description}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600">{selectedField?.rating} ({selectedField?.reviews} đánh giá)</span>
                    </div>
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Chọn Thời Gian</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn Ngày</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn Giờ</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <motion.button
                            key={time}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                              selectedTime === time
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedTime(time)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-8">
                    <motion.button
                      onClick={() => setBookingStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Quay Lại
                    </motion.button>
                    <motion.button
                      onClick={() => setBookingStep(3)}
                      disabled={!selectedDate || !selectedTime}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedDate && selectedTime
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      whileHover={selectedDate && selectedTime ? { scale: 1.02 } : {}}
                      whileTap={selectedDate && selectedTime ? { scale: 0.98 } : {}}
                    >
                      Tiếp Tục
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirmation */}
      {bookingStep === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full px-4 sm:px-6 lg:px-8 pb-16"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Xác Nhận Đặt Sân</h3>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{selectedField?.image}</div>
                    <h4 className="font-bold text-gray-800">{selectedField?.name}</h4>
                    <p className="text-green-600 font-semibold">{selectedField?.price}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">📅</div>
                    <h4 className="font-bold text-gray-800">Ngày</h4>
                    <p className="text-gray-600">{new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🕐</div>
                    <h4 className="font-bold text-gray-800">Giờ</h4>
                    <p className="text-gray-600">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-800 mb-4">Tổng Thanh Toán</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Giá sân ({selectedField?.name})</span>
                    <span>{selectedField?.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí dịch vụ</span>
                    <span>20,000 VNĐ</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">220,000 VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quay Lại
                </motion.button>
                <motion.button
                  onClick={handleBookingConfirm}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Xác Nhận Đặt Sân
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {bookingStep === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Đặt Sân Thành Công!</h3>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã đặt sân. Chúng tôi sẽ gửi thông tin chi tiết qua email.
            </p>
            <motion.button
              onClick={resetBooking}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Đặt Sân Khác
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BookingPage;
