import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function CalendarExceptionsModal({ courtId, isOpen, onClose, user }) {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0], // Today
    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });

  // Form for creating new exception
  const [newException, setNewException] = useState({
    date: '',
    isClosed: false,
    openTime: '08:00:00',
    closeTime: '20:00:00',
    reason: ''
  });

  // Load calendar exceptions
  const loadExceptions = async () => {
    if (!courtId) return;
    
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const url = getApiUrl(`provider/courts/${courtId}/calendar-exceptions?from=${dateRange.from}&to=${dateRange.to}`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          // No exceptions found
          setExceptions([]);
          return;
        }
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setExceptions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || String(e));
      setExceptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new exception
  const createException = async () => {
    if (!courtId || !newException.date) return;

    try {
      setSaving(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      const res = await fetch(getApiUrl(`provider/courts/${courtId}/calendar-exceptions`), {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          date: newException.date,
          isClosed: newException.isClosed,
          openTime: newException.isClosed ? null : newException.openTime,
          closeTime: newException.isClosed ? null : newException.closeTime,
          reason: newException.reason || null
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      alert('Đã thêm ngoại lệ lịch thành công.');
      // Reset form
      setNewException({
        date: '',
        isClosed: false,
        openTime: '08:00:00',
        closeTime: '20:00:00',
        reason: ''
      });
      // Reload exceptions
      await loadExceptions();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  // Delete exception
  const deleteException = async (exceptionId) => {
    if (!courtId || !exceptionId) return;
    
    const confirmDel = window.confirm('Bạn có chắc chắn muốn xóa ngoại lệ này?');
    if (!confirmDel) return;

    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(getApiUrl(`provider/courts/${courtId}/calendar-exceptions/${exceptionId}`), {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      alert('Đã xóa ngoại lệ lịch.');
      await loadExceptions();
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  // Load data when modal opens or date range changes
  useEffect(() => {
    if (isOpen && courtId) {
      loadExceptions();
    }
  }, [isOpen, courtId, dateRange.from, dateRange.to]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90vw] max-w-4xl rounded-2xl shadow-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Ngoại lệ lịch - Sân #{courtId}</h3>
          <button 
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50" 
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Từ ngày:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Đến ngày:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadExceptions}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:brightness-110 disabled:opacity-50 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Đang tải...' : 'Tải lại'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* Add New Exception Form */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium mb-3">Thêm ngoại lệ mới</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Ngày:</label>
              <input
                type="date"
                value={newException.date}
                onChange={(e) => setNewException(prev => ({ ...prev, date: e.target.value }))}
                className="border border-gray-200 rounded px-2 py-1 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newException.isClosed}
                onChange={(e) => setNewException(prev => ({ ...prev, isClosed: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Đóng cửa</span>
            </div>

            {!newException.isClosed && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">Mở:</label>
                  <input
                    type="time"
                    value={newException.openTime}
                    onChange={(e) => setNewException(prev => ({ ...prev, openTime: e.target.value + ':00' }))}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">Đóng:</label>
                  <input
                    type="time"
                    value={newException.closeTime}
                    onChange={(e) => setNewException(prev => ({ ...prev, closeTime: e.target.value + ':00' }))}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <input
                type="text"
                value={newException.reason}
                onChange={(e) => setNewException(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Lý do (tùy chọn)"
                className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <button
                onClick={createException}
                disabled={saving || !newException.date}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {saving ? 'Đang thêm...' : 'Thêm ngoại lệ'}
              </button>
            </div>
          </div>
        </div>

        {/* Exceptions List */}
        <div className="border border-gray-200 rounded-lg">
          <div className="p-3 bg-gray-50 border-b">
            <h4 className="font-medium">Danh sách ngoại lệ ({exceptions.length})</h4>
          </div>
          
          {loading && (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          )}

          {!loading && exceptions.length === 0 && (
            <div className="p-4 text-center text-gray-500">Không có ngoại lệ nào trong khoảng thời gian này</div>
          )}

          {!loading && exceptions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Ngày</th>
                    <th className="text-left px-3 py-2">Trạng thái</th>
                    <th className="text-left px-3 py-2">Giờ hoạt động</th>
                    <th className="text-left px-3 py-2">Lý do</th>
                    <th className="text-right px-3 py-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map((exception) => (
                    <tr key={exception.id} className="border-t">
                      <td className="px-3 py-2">
                        {new Date(exception.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-3 py-2">
                        {exception.isClosed ? (
                          <span className="text-red-600 font-medium">Đóng cửa</span>
                        ) : (
                          <span className="text-green-600 font-medium">Mở cửa</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {exception.isClosed ? (
                          <span className="text-gray-500">-</span>
                        ) : (
                          <span>{exception.openTime} - {exception.closeTime}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {exception.reason || <span className="text-gray-500">-</span>}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => deleteException(exception.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:brightness-110 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
