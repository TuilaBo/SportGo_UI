import React from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';

export default function ProvidersManagePage() {
  const providers = [
    { id: 'P-001', name: 'Sân 5 Quận 7', phone: '0901 234 567', address: '123 Nguyễn Văn Linh, Q7' },
    { id: 'P-002', name: 'Sân 7 Bình Thạnh', phone: '0902 345 678', address: '45 Điện Biên Phủ, BT' },
    { id: 'P-003', name: 'Sân 11 Thủ Đức', phone: '0903 456 789', address: '78 Võ Văn Ngân, TD' },
  ];
  return (
    <AdminLayout title="Doanh nghiệp">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quản lý doanh nghiệp</h1>
        <button className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white">Thêm doanh nghiệp</button>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Tên</th>
              <th className="text-left px-4 py-2">SĐT</th>
              <th className="text-left px-4 py-2">Địa chỉ</th>
              <th className="text-right px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-gray-600">{p.phone}</td>
                <td className="px-4 py-2">{p.address}</td>
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



