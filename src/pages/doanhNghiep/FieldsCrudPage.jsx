import React from 'react';
import BusinessLayout from '../../components/layouts/BusinessLayout';

export default function FieldsCrudPage() {
  const fields = [
    { id: 'F-001', name: 'Sân 5 - A1', type: '5 người', price: 120000, status: 'available' },
    { id: 'F-002', name: 'Sân 7 - B2', type: '7 người', price: 180000, status: 'maintenance' },
    { id: 'F-003', name: 'Sân 11 - C3', type: '11 người', price: 250000, status: 'occupied' },
  ];
  return (
    <BusinessLayout title="Quản lý sân">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quản lý sân</h1>
        <button className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white">Thêm sân</button>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Tên sân</th>
              <th className="text-left px-4 py-2">Loại</th>
              <th className="text-left px-4 py-2">Giá/giờ</th>
              <th className="text-left px-4 py-2">Trạng thái</th>
              <th className="text-right px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="px-4 py-2">{f.name}</td>
                <td className="px-4 py-2">{f.type}</td>
                <td className="px-4 py-2">{f.price.toLocaleString('vi-VN')}₫</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded border ${f.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : f.status === 'maintenance' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{f.status}</span>
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
    </BusinessLayout>
  );
}



