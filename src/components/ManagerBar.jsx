import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.jpg';
import { useAuth } from '../contexts/AuthContext';
import { generateUserAvatar } from '../utils/avatarGenerator';

const ManagerBar = ({ isLoggedIn = false, userName = null, userAvatar = null, onLogin, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  // Use auth context data if available, otherwise fall back to props
  const currentUser = user || { name: userName, avatar: userAvatar };
  const isUserLoggedIn = user ? true : isLoggedIn;
  const handleLogout = onLogout || logout;
  
  // Generate avatar if not provided
  const userAvatarUrl = currentUser.avatar || generateUserAvatar(currentUser.name, currentUser.email);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header 
      className="relative bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50 w-full"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30"></div>
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo Section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <img src={logo} alt="SportGo Logo" className="h-12 w-12 object-contain rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
              <motion.span 
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-serif"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                SportGo
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {[
              { path: '/', label: 'Trang chủ', icon: '🏠' },
              { path: '/booking', label: 'Đặt sân', icon: '⚽' },
              { path: '/search', label: 'Tìm sân', icon: '🔍' },
              { path: '/contact', label: 'Liên hệ', icon: '📞' }
            ].map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Link 
                  to={item.path} 
                  className={`relative group px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                    isActive(item.path) 
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg font-semibold' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <motion.span 
                    className="flex items-center space-x-2 relative z-10"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-inherit">{item.label}</span>
                  </motion.span>
                  
                  {isActive(item.path) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {!isActive(item.path) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-0 group-hover:opacity-100 -z-10"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {isUserLoggedIn ? (
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.span 
                  className="text-gray-700 font-medium px-3 py-1 bg-gray-100 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentUser.fullName || currentUser.name || 'User'}
                </motion.span>
                
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <img 
                    src={userAvatarUrl} 
                    alt="User Avatar" 
                    className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </motion.div>
                
                <motion.button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors duration-300 text-sm px-3 py-1 rounded-lg hover:bg-red-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng xuất
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
                  >
                    Đăng nhập
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    Đăng ký
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <motion.span 
                  className="w-full h-0.5 bg-gray-700"
                  animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 6 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span 
                  className="w-full h-0.5 bg-gray-700"
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span 
                  className="w-full h-0.5 bg-gray-700"
                  animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -6 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200/50"
            >
              <div className="py-4 space-y-2">
                {[
                  { path: '/', label: 'Trang chủ', icon: '🏠' },
                  { path: '/booking', label: 'Đặt sân', icon: '⚽' },
                  { path: '/search', label: 'Tìm sân', icon: '🔍' },
                  { path: '/contact', label: 'Liên hệ', icon: '📞' }
                ].map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link 
                      to={item.path} 
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                        isActive(item.path) 
                          ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 font-semibold' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-2 right-20 w-2 h-2 bg-blue-500/30 rounded-full animate-pulse"></div>
      <div className="absolute top-4 left-32 w-1 h-1 bg-purple-500/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
    </motion.header>
  );
};

export default ManagerBar;