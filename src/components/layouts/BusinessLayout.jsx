import React from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function BusinessLayout({ title = 'Doanh nghiệp', children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-800">SportGo Business</Link>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">{title}</div>
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  Xin chào, <span className="font-medium">{user.fullName || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
            <NavLink 
              to="/doanh-nghiep" 
              end
              className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              🏠 Tổng quan
            </NavLink>
            <NavLink 
              to="/doanh-nghiep/san" 
              className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              ⚽ Quản lý sân
            </NavLink>
            <NavLink 
              to="/doanh-nghiep/chi-nhanh" 
              className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              🏢 Quản lý chi nhánh
            </NavLink>
            <NavLink 
              to="/doanh-nghiep/dat-san" 
              className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              📅 Quản lý đặt sân
            </NavLink>
            <NavLink 
              to="/doanh-nghiep/stats" 
              className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              📈 Thống Kê Doanh Nghiệp
            </NavLink>
            <NavLink 
              to="/doanh-nghiep/reviews" 
              className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              ⭐ Đánh giá
            </NavLink>
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}




