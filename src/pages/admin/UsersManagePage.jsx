import React from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';

export default function UsersManagePage() {
  const users = [
    { id: 'U-001', name: 'Nguyễn Văn A', email: 'a.nguyen@example.com', role: 'user', status: 'active' },
    { id: 'U-002', name: 'Trần Thị B', email: 'b.tran@example.com', role: 'provider', status: 'inactive' },
    { id: 'U-003', name: 'Lê C', email: 'c.le@example.com', role: 'admin', status: 'active' },
    { id: 'U-004', name: 'Phạm D', email: 'd.pham@example.com', role: 'user', status: 'banned' },
    { id: 'U-005', name: 'Hoàng Thị Mai', email: 'mai.hoang@example.com', role: 'user', status: 'active' },
    { id: 'U-006', name: 'Vũ Đức Anh', email: 'anh.vu@example.com', role: 'user', status: 'active' },
    { id: 'U-007', name: 'Đỗ Thị Lan', email: 'lan.do@example.com', role: 'provider', status: 'active' },
    { id: 'U-008', name: 'Bùi Văn Hùng', email: 'hung.bui@example.com', role: 'user', status: 'active' },
    { id: 'U-009', name: 'Phan Thị Hoa', email: 'hoa.phan@example.com', role: 'user', status: 'inactive' },
    { id: 'U-010', name: 'Trịnh Văn Nam', email: 'nam.trinh@example.com', role: 'provider', status: 'active' },
    { id: 'U-011', name: 'Lý Thị Hương', email: 'huong.ly@example.com', role: 'user', status: 'active' },
    { id: 'U-012', name: 'Đinh Văn Tuấn', email: 'tuan.dinh@example.com', role: 'user', status: 'active' },
    { id: 'U-013', name: 'Ngô Thị Linh', email: 'linh.ngo@example.com', role: 'provider', status: 'inactive' },
    { id: 'U-014', name: 'Dương Văn Minh', email: 'minh.duong@example.com', role: 'user', status: 'active' },
    { id: 'U-015', name: 'Võ Thị Nga', email: 'nga.vo@example.com', role: 'user', status: 'banned' },
    { id: 'U-016', name: 'Lương Văn Quang', email: 'quang.luong@example.com', role: 'provider', status: 'active' },
    { id: 'U-017', name: 'Hồ Thị Thảo', email: 'thao.ho@example.com', role: 'user', status: 'active' },
    { id: 'U-018', name: 'Đặng Văn Long', email: 'long.dang@example.com', role: 'user', status: 'active' },
    { id: 'U-019', name: 'Bạch Thị Yến', email: 'yen.bach@example.com', role: 'provider', status: 'active' },
    { id: 'U-020', name: 'Chu Văn Đức', email: 'duc.chu@example.com', role: 'user', status: 'inactive' },
    { id: 'U-021', name: 'Lưu Thị Phương', email: 'phuong.luu@example.com', role: 'user', status: 'active' },
    { id: 'U-022', name: 'Tạ Văn Sơn', email: 'son.ta@example.com', role: 'provider', status: 'active' },
    { id: 'U-023', name: 'Vương Thị Hạnh', email: 'hanh.vuong@example.com', role: 'user', status: 'active' },
    { id: 'U-024', name: 'Tôn Văn Bình', email: 'binh.ton@example.com', role: 'user', status: 'active' },
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



