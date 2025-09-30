import React from 'react';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const ContactPage = () => {
  const { isLoggedIn, user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-white w-full">
      {/* Manager Bar */}
      <ManagerBar 
        isLoggedIn={isLoggedIn}
        userName={user?.name}
        userAvatar={user?.avatar}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">LIÊN HỆ VỚI CHÚNG TÔI</h1>
        </div>

        {/* Contact Information and Map */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Information */}
          <div className="space-y-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                CÔNG TY SPORTGO xin chào quý khách !
              </h2>
              
              {/* Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Địa chỉ:</h3>
                <div className="border-b-2 border-sportgo-green mb-2"></div>
                <p className="text-gray-600">Số 1 Lưu Hữu Phước, Đông Hoà, Dĩ An, Hồ Chí Minh</p>
              </div>

              {/* Phone Numbers */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Số điện thoại:</h3>
                <div className="border-b border-gray-300 mb-2"></div>
                <div className="space-y-1">
                  <p className="text-gray-600">+ 0923237611</p>
                  <p className="text-gray-600">+ 0374881628</p>
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Email:</h3>
                <div className="border-b border-gray-300 mb-2"></div>
                <p className="text-gray-600">SportGo@gmail.com</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Gửi tin nhắn cho chúng tôi</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sportgo-green transition-colors"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sportgo-green transition-colors"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sportgo-green transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tin nhắn</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sportgo-green transition-colors"
                    placeholder="Nhập tin nhắn của bạn"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-sportgo-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300"
                >
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            <div className="h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.1234567890123!2d106.1234567890123!3d10.1234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDA3JzI0LjQiTiAxMDbCsDA3JzI0LjQiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SportGo Location Map"
              ></iframe>
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm text-gray-500 text-center">
                Map data ©2025 Google Terms
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-sportgo-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Địa chỉ</h3>
            <p className="text-gray-600">Số 1 Lưu Hữu Phước, Đông Hoà, Dĩ An, Hồ Chí Minh</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-sportgo-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📞</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Điện thoại</h3>
            <p className="text-gray-600">+ 0923237611</p>
            <p className="text-gray-600">+ 0374881628</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-sportgo-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✉️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
            <p className="text-gray-600">SportGo@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;
