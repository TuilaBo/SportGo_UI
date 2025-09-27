import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="mb-8">
                <motion.h2 
                  className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-serif mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  SportGo
                </motion.h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  Nền tảng đặt sân thể thao hàng đầu Việt Nam. Kết nối người chơi với các sân thể thao chất lượng cao.
                </p>
              </div>
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                {[
                  { name: 'Facebook', icon: '📘', color: 'hover:bg-blue-600' },
                  { name: 'Instagram', icon: '📷', color: 'hover:bg-pink-600' },
                  { name: 'Twitter', icon: '🐦', color: 'hover:bg-blue-400' },
                  { name: 'YouTube', icon: '📺', color: 'hover:bg-red-600' }
                ].map((social, index) => (
                  <motion.a
                    key={social.name}
                    href="#"
                    className={`w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${social.color} hover:scale-110 hover:shadow-lg`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold mb-6 text-white">Liên kết nhanh</h3>
              <ul className="space-y-3">
                {['Trang chủ', 'Đặt sân', 'Liên hệ', 'Về chúng tôi', 'Tin tức'].map((link, index) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <a 
                      href="#" 
                      className="text-gray-300 hover:text-white transition-colors duration-300 hover:pl-2 block"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-6 text-white">Liên hệ</h3>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📍</span>
                  </div>
                  <span className="text-gray-300 text-sm">Số 1 Lưu Hữu Phước, Đông Hoà, Dĩ An</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📞</span>
                  </div>
                  <span className="text-gray-300 text-sm">+84 923 237 611</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm">✉️</span>
                  </div>
                  <span className="text-gray-300 text-sm">SportGo@gmail.com</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div 
          className="py-12 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4 text-white">Đăng ký nhận tin tức</h3>
            <p className="text-gray-300 mb-8">Nhận thông tin về các sân thể thao mới và ưu đãi đặc biệt</p>
            
            <motion.div 
              className="max-w-md mx-auto flex gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <input 
                type="email" 
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <motion.button 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đăng ký
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="py-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 SportGo. Tất cả quyền được bảo lưu.
            </div>
            
            <div className="flex space-x-6 text-sm">
              {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Cookie'].map((link, index) => (
                <motion.a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
    </footer>
  );
};

export default Footer;