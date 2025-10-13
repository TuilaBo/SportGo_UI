import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function AdminLayout({ title = 'Admin', children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-800">SportGo Admin</Link>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
            <NavLink to="/admin" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Bảng điều khiển</NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Người dùng</NavLink>
            <NavLink to="/admin/providers" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Doanh nghiệp</NavLink>
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




