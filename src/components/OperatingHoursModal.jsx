import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

const DAYS_OF_WEEK = [
  { key: 'sunday', label: 'Chủ nhật' },
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' }
];

export default function OperatingHoursModal({ courtId, isOpen, onClose, user }) {
  const [operatingHours, setOperatingHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize default operating hours
  const initializeDefaultHours = () => {
    return DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.key,
      isClosed: false,
      openTime: '08:00:00',
      closeTime: '20:00:00'
    }));
  };

  // Load operating hours
  const loadOperatingHours = async () => {
    if (!courtId) return;
    
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(getApiUrl(`provider/courts/${courtId}/operating-hours`), {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          // No operating hours set yet, use defaults
          setOperatingHours(initializeDefaultHours());
          return;
        }
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      
      // Ensure we have all 7 days
      const hoursMap = new Map();
      if (Array.isArray(data)) {
        data.forEach(hour => {
          // Convert API format to lowercase for consistency
          const dayKey = hour.dayOfWeek.toLowerCase();
          hoursMap.set(dayKey, {
            dayOfWeek: dayKey,
            isClosed: hour.isClosed,
            openTime: hour.openTime,
            closeTime: hour.closeTime
          });
        });
      }

      const completeHours = DAYS_OF_WEEK.map(day => {
        const existing = hoursMap.get(day.key);
        return existing || {
          dayOfWeek: day.key,
          isClosed: false,
          openTime: '08:00:00',
          closeTime: '20:00:00'
        };
      });

      setOperatingHours(completeHours);
    } catch (e) {
      setError(e.message || String(e));
      // Fallback to defaults on error
      setOperatingHours(initializeDefaultHours());
    } finally {
      setLoading(false);
    }
  };

  // Save operating hours
  const saveOperatingHours = async () => {
    if (!courtId) return;

    try {
      setSaving(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');

      // Convert to API format (capitalize dayOfWeek)
      const apiFormatHours = operatingHours.map(hour => ({
        dayOfWeek: hour.dayOfWeek.charAt(0).toUpperCase() + hour.dayOfWeek.slice(1),
        isClosed: hour.isClosed,
        openTime: hour.openTime,
        closeTime: hour.closeTime
      }));

      const res = await fetch(getApiUrl(`provider/courts/${courtId}/operating-hours/bulk`), {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(apiFormatHours)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      alert('Đã cập nhật giờ hoạt động thành công.');
      onClose();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  // Update operating hours for a specific day
  const updateDayHours = (dayOfWeek, field, value) => {
    setOperatingHours(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, [field]: value }
          : day
      )
    );
  };

  // Handle day toggle (open/closed)
  const toggleDayClosed = (dayOfWeek) => {
    const day = operatingHours.find(d => d.dayOfWeek === dayOfWeek);
    updateDayHours(dayOfWeek, 'isClosed', !day.isClosed);
    
    // Clear times when closing
    if (!day.isClosed) {
      updateDayHours(dayOfWeek, 'openTime', null);
      updateDayHours(dayOfWeek, 'closeTime', null);
    } else {
      // Set default times when opening
      updateDayHours(dayOfWeek, 'openTime', '08:00:00');
      updateDayHours(dayOfWeek, 'closeTime', '20:00:00');
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && courtId) {
      loadOperatingHours();
    }
  }, [isOpen, courtId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90vw] max-w-2xl rounded-2xl shadow-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Giờ hoạt động - Sân #{courtId}</h3>
          <button 
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50" 
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {operatingHours.map((day) => {
              const dayInfo = DAYS_OF_WEEK.find(d => d.key === day.dayOfWeek);
              return (
                <div key={day.dayOfWeek} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="w-20 text-sm font-medium">{dayInfo.label}</div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!day.isClosed}
                      onChange={() => toggleDayClosed(day.dayOfWeek)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Mở cửa</span>
                  </div>

                  {!day.isClosed && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Mở:</label>
                        <input
                          type="time"
                          value={day.openTime || '08:00'}
                          onChange={(e) => updateDayHours(day.dayOfWeek, 'openTime', e.target.value + ':00')}
                          className="border border-gray-200 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Đóng:</label>
                        <input
                          type="time"
                          value={day.closeTime || '20:00'}
                          onChange={(e) => updateDayHours(day.dayOfWeek, 'closeTime', e.target.value + ':00')}
                          className="border border-gray-200 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </>
                  )}

                  {day.isClosed && (
                    <div className="text-sm text-gray-500">Đóng cửa</div>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </button>
              <button
                onClick={saveOperatingHours}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
