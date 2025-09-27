import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.jpg';
import backgroundImage from '../../assets/bong-da-mon-the-thao-vua.jpg';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const HomePage = () => {
  const { isLoggedIn, user, logout, checkAuth } = useAuth();
  const [managementRef, managementVisible] = useScrollAnimation(0.1);
  const [bookingRef, bookingVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Manager Bar */}
      <ManagerBar 
        isLoggedIn={isLoggedIn}
        userName={user?.name}
        userAvatar={user?.avatar}
        onLogout={logout}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 lg:p-12 animate-fade-in">
              <h1 className="hero-text text-sportgo-green mb-6 animate-slide-up">
                SportGo
              </h1>
              <p className="text-white text-lg lg:text-xl mb-8 leading-relaxed animate-slide-up">
                Ứng dụng dành cho những người yêu thích thể thao để dễ dàng tìm kiếm và đặt sân cho các môn thể thao như bóng đá, tennis, pickleball, cầu lông,... kết nối với những người có cùng sở thích và lên lịch thời gian mong muốn.
              </p>
              <button className="btn-primary text-lg px-8 py-4 mb-6 animate-slide-up">
                Đặt sân ngay
              </button>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-12 w-auto"
                />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  className="h-12 w-auto"
                />
              </div>
            </div>

            {/* Right Athletes */}
            <div className="relative animate-fade-in">
              <div className="grid grid-cols-2 gap-8">
                {/* Athlete 1 - Soccer */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 animate-bounce-slow">
                  <div className="text-6xl mb-4">⚽</div>
                  <p className="text-white font-semibold">Bóng đá</p>
                </div>
                
                {/* Athlete 2 - Basketball */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 animate-bounce-slow" style={{animationDelay: '0.5s'}}>
                  <div className="text-6xl mb-4">🏀</div>
                  <p className="text-white font-semibold">Bóng rổ</p>
                </div>
                
                {/* Athlete 3 - Badminton */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 animate-bounce-slow" style={{animationDelay: '1s'}}>
                  <div className="text-6xl mb-4">🏸</div>
                  <p className="text-white font-semibold">Cầu lông</p>
                </div>
                
                {/* Athlete 4 - Tennis */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 animate-bounce-slow" style={{animationDelay: '1.5s'}}>
                  <div className="text-6xl mb-4">🎾</div>
                  <p className="text-white font-semibold">Tennis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Management Software Section */}
      <section className="py-20 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div 
            ref={managementRef}
            initial={{ opacity: 0, y: 50 }}
            animate={managementVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              PHẦN MỀM QUẢN LÝ CỦA <span className="text-red-500">SPORTGO</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Quản lý các sân thể thao đa dạng như pickleball, cầu lông, bóng đá, bóng rổ và tennis trở nên dễ dàng hơn với SportGo. 
              Tận dụng các tính năng của SportGo để nâng cao hiệu quả kinh doanh, cải thiện trải nghiệm khách hàng và tối đa hóa doanh thu cho các sân thể thao.
            </p>
          </motion.div>

          {/* Management Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={managementVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            {/* Court Status Card */}
            <div className="card p-8 group">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-4 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <div className="text-3xl">📅</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">XEM TRẠNG THÁI SÂN</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Chủ sân có thể xem các sân có sẵn/đã đặt, kiểm tra trạng thái thanh toán (chưa thanh toán, đã thanh toán, đang sử dụng) 
                và xác định khách hàng cá nhân hoặc khách hàng thường xuyên.
              </p>
            </div>

            {/* Booking Management Card */}
            <div className="card p-8 group">
              <div className="flex items-center mb-6">
                <div className="bg-pink-100 p-4 rounded-xl mr-4 group-hover:bg-pink-200 transition-colors duration-300">
                  <div className="text-3xl">📅</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">QUẢN LÝ LỊCH ĐẶT</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                SportGo cung cấp các tính năng quản lý toàn diện để tạo lịch đặt linh hoạt hàng ngày, hàng tuần hoặc hàng tháng. 
                Cũng cho phép theo dõi và phê duyệt yêu cầu đặt chỗ của khách hàng để tổ chức công việc thuận tiện và dễ dàng.
              </p>
            </div>
          </motion.div>

          {/* Branch Management and Revenue Statistics */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={managementVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Branch Management Card */}
            <div className="card p-8 group">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-4 rounded-xl mr-4 group-hover:bg-red-200 transition-colors duration-300">
                  <div className="text-3xl">🏢</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">QUẢN LÝ CHI NHÁNH</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                SportGo giúp quản lý nhiều chi nhánh, tạo danh sách giá riêng, dịch vụ và doanh thu cho từng chi nhánh, 
                giúp việc quản lý trở nên thuận tiện và linh hoạt.
              </p>
            </div>

            {/* Revenue Statistics Card */}
            <div className="card p-8 group">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-4 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <div className="text-3xl">📊</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">THỐNG KÊ DOANH THU</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Alobo cung cấp báo cáo chi tiết và thống kê về doanh thu, đặt chỗ, dịch vụ tại chỗ và các chỉ số kinh doanh khác 
                để giúp đánh giá hiệu quả kinh doanh, tối ưu hóa và đưa ra quyết định đúng đắn.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Booking Software Section */}
      <section className="py-20 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div 
            ref={bookingRef}
            initial={{ opacity: 0, y: 50 }}
            animate={bookingVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              PHẦN MỀM ĐẶT LỊCH CỦA <span className="text-red-500">SPORTGO</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              SportGo mang đến sự kết hợp của các tính năng độc đáo để trải nghiệm dễ dàng và thuận tiện khi tìm kiếm và đặt sân thể thao.
            </p>
          </motion.div>

          {/* Booking Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={bookingVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Easy Booking Card */}
            <div className="card p-8 group">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-4 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                  <div className="text-3xl">📅</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">ĐẶT LỊCH DỄ DÀNG</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Chủ sân có thể xem các sân có sẵn/đã đặt, theo dõi trạng thái thanh toán (chưa thanh toán, đã thanh toán, đang sử dụng) 
                và xác định loại khách hàng (khách lẻ hoặc khách thường xuyên).
              </p>
            </div>

            {/* Search Nearby Venues Card */}
            <div className="card p-8 group">
              <div className="flex items-center mb-6">
                <div className="bg-pink-100 p-4 rounded-xl mr-4 group-hover:bg-pink-200 transition-colors duration-300">
                  <div className="text-3xl">🔍</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">TÌM KIẾM SÂN XUNG QUANH</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Người dùng có thể tìm kiếm các nhà cung cấp dịch vụ gần đó bằng cách nhập địa điểm hoặc cho phép truy cập vị trí, 
                xem danh sách các sân gần nhất và xem thông tin chi tiết bao gồm đánh giá và xếp hạng từ người dùng khác.
              </p>
            </div>

            {/* Venue Quality Rating Card */}
            <div className="card p-8 group md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-4 rounded-xl mr-4 group-hover:bg-red-200 transition-colors duration-300">
                  <div className="text-3xl">⭐</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">ĐÁNH GIÁ CHẤT LƯỢNG SÂN</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Người dùng có thể đánh giá và đánh giá các dịch vụ họ đã trải nghiệm, giúp cộng đồng có thông tin đáng tin cậy 
                và hỗ trợ chủ sân cải thiện chất lượng dịch vụ.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;