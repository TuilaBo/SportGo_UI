import React from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';

export default function UsersManagePage() {
  const users = [
    { id: 'U-001', name: 'Nguyễn Văn A', email: 'a.nguyen@example.com', role: 'user', status: 'active' },
    { id: 'U-002', name: 'Trần Thị B', email: 'b.tran@example.com', role: 'provider', status: 'inactive' },
    { id: 'U-003', name: 'Lê C', email: 'c.le@example.com', role: 'admin', status: 'active' },
    { id: 'U-004', name: 'Phạm D', email: 'd.pham@example.com', role: 'user', status: 'banned' },
  ];
  return (
    <AdminLayout title="Người dùng">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quản lý người dùng</h1>
        <button className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white">Thêm người dùng</button>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Tên</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Vai trò</th>
              <th className="text-left px-4 py-2">Trạng thái</th>
              <th className="text-right px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 text-gray-600">{u.email}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 text-xs rounded bg-gray-50 border">{u.role}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded border ${u.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : u.status === 'inactive' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{u.status}</span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button className="px-2 py-1 text-xs rounded border">Sửa</button>
                  <button className="px-2 py-1 text-xs rounded border text-red-600">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}



