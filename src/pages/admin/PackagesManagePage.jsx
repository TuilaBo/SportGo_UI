import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

export default function PackagesManagePage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    durationDays: 0,
    description: '',
    normalTurns: 0,
    priorityTurns: 0,
    price: 0,
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Load packages
  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const params = new URLSearchParams({
        Page: page.toString(),
        Size: size.toString(),
        ...(search && { Search: search }),
        IsActive: isActive.toString()
      });

      const res = await fetch(`/api/admin/packages?${params}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPackages(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError(e.message || String(e));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Create package
  const createPackage = async () => {
    try {
      setFormLoading(true);
      setFormError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      const result = await res.json();
      alert('Đã tạo gói thành công!');
      resetForm();
      loadPackages();
    } catch (e) {
      setFormError(e.message || String(e));
    } finally {
      setFormLoading(false);
    }
  };

  // Update package
  const updatePackage = async () => {
    try {
      setFormLoading(true);
      setFormError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/admin/packages/${editingId}`, {
        method: 'PUT',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      alert('Đã cập nhật gói thành công!');
      resetForm();
      loadPackages();
    } catch (e) {
      setFormError(e.message || String(e));
    } finally {
      setFormLoading(false);
    }
  };

  // Delete package
  const deletePackage = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gói này?')) return;

    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      alert('Đã xóa gói thành công!');
      loadPackages();
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      durationDays: 0,
      description: '',
      normalTurns: 0,
      priorityTurns: 0,
      price: 0,
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
    setFormError(null);
  };

  // Start editing
  const startEdit = (packageItem) => {
    setFormData({
      name: packageItem.name,
      durationDays: packageItem.durationDays,
      description: packageItem.description,
      normalTurns: packageItem.normalTurns,
      priorityTurns: packageItem.priorityTurns,
      price: packageItem.price,
      isActive: packageItem.isActive
    });
    setEditingId(packageItem.packageId);
    setShowForm(true);
    setFormError(null);
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (user) {
      loadPackages();
    }
  }, [user, page, size, search, isActive]);

  return (
    <AdminLayout title="Quản lý gói">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Quản lý gói dịch vụ</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm gói mới
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên gói..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value={true}>Hoạt động</option>
              <option value={false}>Không hoạt động</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadPackages}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Tải lại'}
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingId ? 'Sửa gói' : 'Thêm gói mới'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nhập tên gói..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn (ngày)</label>
                    <input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lượt bình thường</label>
                    <input
                      type="number"
                      value={formData.normalTurns}
                      onChange={(e) => setFormData(prev => ({ ...prev, normalTurns: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lượt ưu tiên</label>
                    <input
                      type="number"
                      value={formData.priorityTurns}
                      onChange={(e) => setFormData(prev => ({ ...prev, priorityTurns: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Hoạt động
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Nhập mô tả gói..."
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-600 text-sm">{formError}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={editingId ? updatePackage : createPackage}
                    disabled={formLoading || !formData.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên gói
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && packages.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
                {!loading && !error && packages.map((packageItem) => (
                  <tr key={packageItem.packageId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {packageItem.packageId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div className="font-medium">{packageItem.name}</div>
                        {packageItem.description && (
                          <div className="text-xs text-gray-500 mt-1">{packageItem.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {packageItem.price?.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {packageItem.durationDays} ngày
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-xs">
                        <div>Bình thường: {packageItem.normalTurns}</div>
                        <div>Ưu tiên: {packageItem.priorityTurns}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        packageItem.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {packageItem.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEdit(packageItem)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => deletePackage(packageItem.packageId)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Trang {page}/{totalPages} — Tổng {total} gói
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
            <select
              value={size}
              onChange={(e) => {
                setSize(parseInt(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}



