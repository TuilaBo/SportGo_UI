import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/layouts/BusinessLayout';
import OperatingHoursModal from '../../components/OperatingHoursModal';
import CalendarExceptionsModal from '../../components/CalendarExceptionsModal';
import { useAuth } from '../../contexts/AuthContext';

export default function CourtsPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(false);
  const [facError, setFacError] = useState(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);

  const [sportTypeId, setSportTypeId] = useState(1);
  const [courts, setCourts] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    courtType: '',
    defaultPrice: 0,
    defaultOpenTime: '08:00:00',
    defaultCloseTime: '20:00:00',
    isActive: true,
    sportTypeId: 1
  });

  // Pricing state for a selected court
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    dayOfWeek: 'Sunday',
    startTime: '08:00:00',
    endTime: '09:00:00',
    tier: 'Normal',
    price: 0,
    stepMinutes: 60,
    minDurationMinutes: 60
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState(null);
  const [pricingList, setPricingList] = useState([]);
  const [pricingListLoading, setPricingListLoading] = useState(false);
  const [pricingListError, setPricingListError] = useState(null);
  const [operatingHoursModalOpen, setOperatingHoursModalOpen] = useState(false);
  const [selectedOperatingHoursCourtId, setSelectedOperatingHoursCourtId] = useState(null);
  const [calendarExceptionsModalOpen, setCalendarExceptionsModalOpen] = useState(false);
  const [selectedCalendarExceptionsCourtId, setSelectedCalendarExceptionsCourtId] = useState(null);
  const [editingPricingId, setEditingPricingId] = useState(null);
  const [editPricingForm, setEditPricingForm] = useState({
    dayOfWeek: 'Sunday',
    startTime: '08:00:00',
    endTime: '09:00:00',
    tier: 'Normal',
    price: 0,
    stepMinutes: 60,
    minDurationMinutes: 60
  });
  const [editPricingLoading, setEditPricingLoading] = useState(false);
  const [editPricingError, setEditPricingError] = useState(null);
  const [slotGenerationModalOpen, setSlotGenerationModalOpen] = useState(false);
  const [slotGenerationLoading, setSlotGenerationLoading] = useState(false);
  const [slotGenerationError, setSlotGenerationError] = useState(null);
  const [slotGenerationResult, setSlotGenerationResult] = useState(null);
  const [slotGenerationForm, setSlotGenerationForm] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    overwriteExisting: false,
    dryRun: false
  });
  const [sportTypes, setSportTypes] = useState([]);
  const [sportTypesLoading, setSportTypesLoading] = useState(false);
  const [sportTypesError, setSportTypesError] = useState(null);
  const [slotsModalOpen, setSlotsModalOpen] = useState(false);
  const [selectedSlotsCourtId, setSelectedSlotsCourtId] = useState(null);
  const [slotsDate, setSlotsDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [deleteSlotsModalOpen, setDeleteSlotsModalOpen] = useState(false);
  const [deleteSlotsForm, setDeleteSlotsForm] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [deleteSlotsLoading, setDeleteSlotsLoading] = useState(false);
  const [deleteSlotsError, setDeleteSlotsError] = useState(null);
  const [deleteSlotsResult, setDeleteSlotsResult] = useState(null);

  // Load sport types
  const loadSportTypes = async () => {
    try {
      setSportTypesLoading(true);
      setSportTypesError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch('/api/provider/sport-types', {
        method: 'GET',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setSportTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setSportTypesError(e.message || String(e));
      setSportTypes([]);
    } finally {
      setSportTypesLoading(false);
    }
  };

  // Get sport name by ID
  const getSportName = (sportTypeId) => {
    const sport = sportTypes.find(s => s.sportTypeId === sportTypeId);
    return sport ? sport.name : `Môn ${sportTypeId}`;
  };

  // Load slots for a specific court and date
  const loadSlots = async (courtId, date) => {
    if (!courtId || !date) return;
    
    try {
      setSlotsLoading(true);
      setSlotsError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/provider/courts/${courtId}/slots?date=${date}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      setSlotsError(e.message || String(e));
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Open slots modal
  const openSlotsModal = (courtId) => {
    setSelectedSlotsCourtId(courtId);
    setSlotsModalOpen(true);
    loadSlots(courtId, slotsDate);
  };

  // Delete slots in date range
  const deleteSlots = async () => {
    if (!selectedCourtId) return;

    try {
      setDeleteSlotsLoading(true);
      setDeleteSlotsError(null);
      setDeleteSlotsResult(null);
      
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const url = `/api/provider/courts/${selectedCourtId}/slots?from=${deleteSlotsForm.from}&to=${deleteSlotsForm.to}&onlyAvailable=true`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setDeleteSlotsResult(data);
      
      // Refresh slots if modal is open
      if (slotsModalOpen && selectedSlotsCourtId === selectedCourtId) {
        loadSlots(selectedCourtId, slotsDate);
      }
    } catch (e) {
      setDeleteSlotsError(e.message || String(e));
    } finally {
      setDeleteSlotsLoading(false);
    }
  };

  // Open delete slots modal
  const openDeleteSlotsModal = (courtId) => {
    setSelectedCourtId(courtId);
    setDeleteSlotsModalOpen(true);
    setDeleteSlotsResult(null);
    setDeleteSlotsError(null);
  };

  // Generate slots for a court
  const generateSlots = async () => {
    if (!selectedCourtId) return;

    try {
      setSlotGenerationLoading(true);
      setSlotGenerationError(null);
      setSlotGenerationResult(null);
      
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        from: slotGenerationForm.from,
        to: slotGenerationForm.to,
        overwriteExisting: slotGenerationForm.overwriteExisting.toString(),
        dryRun: slotGenerationForm.dryRun.toString()
      });
      
      const res = await fetch(`/api/provider/courts/${selectedCourtId}/slots/generate?${params}`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const result = await res.json();
      setSlotGenerationResult(result);
      
      if (!slotGenerationForm.dryRun) {
        alert(`Đã sinh ${result.created} slot thành công!`);
      }
    } catch (e) {
      setSlotGenerationError(e.message || String(e));
    } finally {
      setSlotGenerationLoading(false);
    }
  };

  // Start editing a pricing item
  const startEditPricing = (pricing) => {
    setEditingPricingId(pricing.id);
    setEditPricingForm({
      dayOfWeek: pricing.dayOfWeek,
      startTime: pricing.startTime,
      endTime: pricing.endTime,
      tier: pricing.tier,
      price: pricing.price,
      stepMinutes: pricing.stepMinutes,
      minDurationMinutes: pricing.minDurationMinutes
    });
    setEditPricingError(null);
  };

  // Cancel editing
  const cancelEditPricing = () => {
    setEditingPricingId(null);
    setEditPricingForm({
      dayOfWeek: 'Sunday',
      startTime: '08:00:00',
      endTime: '09:00:00',
      tier: 'Normal',
      price: 0,
      stepMinutes: 60,
      minDurationMinutes: 60
    });
    setEditPricingError(null);
  };

  // Save edited pricing
  const saveEditPricing = async () => {
    if (!selectedCourtId || !editingPricingId) return;

    try {
      setEditPricingLoading(true);
      setEditPricingError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      
      const res = await fetch(`/api/provider/courts/${selectedCourtId}/pricings/${editingPricingId}`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(editPricingForm)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      alert('Đã cập nhật cấu hình giá.');
      await loadPricingList(selectedCourtId);
      cancelEditPricing();
    } catch (e) {
      setEditPricingError(e.message || String(e));
    } finally {
      setEditPricingLoading(false);
    }
  };

  const loadPricingList = async (courtId) => {
    try {
      setPricingListLoading(true);
      setPricingListError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const res = await fetch(`/api/provider/courts/${courtId}/pricings`, {
        headers: {
          'accept': 'application/json, text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error(await res.text());
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text());
      setPricingList(Array.isArray(data) ? data : []);
    } catch (e) {
      setPricingListError(e.message || String(e));
    } finally {
      setPricingListLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadFacilities() {
      try {
        setFacLoading(true);
        setFacError(null);
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        const res = await fetch('/api/provider/facilities?page=1&size=50', {
          headers: {
            'accept': 'application/json, text/plain',
            'Authorization': `Bearer ${accessToken}`
          },
          signal: controller.signal
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setFacilities(items);
        if (items.length > 0) setSelectedFacilityId(items[0].facilityId);
      } catch (e) {
        if (String(e).toLowerCase().includes('aborted')) return;
        setFacError(e.message || String(e));
      } finally {
        setFacLoading(false);
      }
    }
    loadFacilities();
    return () => controller.abort();
  }, [user]);

  // Load sport types on mount
  useEffect(() => {
    if (user) {
      loadSportTypes();
    }
  }, [user]);

  const loadCourts = async (facilityId, sport, p, s) => {
    if (!facilityId) return;
    try {
      setLoading(true);
      setError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const url = `/api/provider/facilities/${facilityId}/courts?sportTypeId=${sport}&page=${p}&size=${s}`;
      const res = await fetch(url, {
        headers: {
          'accept': 'application/json, text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCourts(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFacilityId) loadCourts(selectedFacilityId, sportTypeId, page, size);
  }, [selectedFacilityId, sportTypeId, page, size]);

  const createCourt = async () => {
    if (!selectedFacilityId) return;
    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const res = await fetch(`/api/provider/facilities/${selectedFacilityId}/courts`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain, application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          facilityId: selectedFacilityId,
          sportTypeId: Number(form.sportTypeId),
          name: form.name,
          courtType: form.courtType,
          defaultPrice: Number(form.defaultPrice),
          defaultOpenTime: form.defaultOpenTime,
          defaultCloseTime: form.defaultCloseTime,
          isActive: Boolean(form.isActive)
        })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Đã tạo sân.');
      setForm((f) => ({ ...f, name: '' }));
      await loadCourts(selectedFacilityId, sportTypeId, page, size);
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  return (
    <BusinessLayout title="Quản lý sân">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="grid grid-cols-1 gap-1">
            <label className="text-xs text-gray-500">Chi nhánh</label>
            <select value={selectedFacilityId || ''} onChange={(e) => { setSelectedFacilityId(Number(e.target.value) || null); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {facilities.map((f) => (
                <option key={f.facilityId} value={f.facilityId}>{f.name}</option>
              ))}
            </select>
            {facLoading && <span className="text-xs text-gray-500">Đang tải...</span>}
            {facError && <span className="text-xs text-red-600">{facError}</span>}
          </div>
          <div className="grid grid-cols-1 gap-1">
            <label className="text-xs text-gray-500">Bộ Môn</label>
            <select 
              value={sportTypeId} 
              onChange={(e) => { setSportTypeId(Number(e.target.value) || 1); setPage(1); }} 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              disabled={sportTypesLoading}
            >
              {sportTypesLoading ? (
                <option value={sportTypeId}>Đang tải...</option>
              ) : (
                sportTypes.map((sport) => (
                  <option key={sport.sportTypeId} value={sport.sportTypeId}>
                    {sport.name}
                  </option>
                ))
              )}
            </select>
            {sportTypesError && <span className="text-xs text-red-600">{sportTypesError}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Tên sân" className="border border-gray-200 rounded px-3 py-2 text-sm" />
          <input value={form.courtType} onChange={(e) => setForm((f) => ({ ...f, courtType: e.target.value }))} placeholder="Loại sân (vd: Sân 5)" className="border border-gray-200 rounded px-3 py-2 text-sm" />
          <input type="number" value={form.defaultPrice} onChange={(e) => setForm((f) => ({ ...f, defaultPrice: e.target.value }))} placeholder="Giá mặc định" className="border border-gray-200 rounded px-3 py-2 text-sm" />
          <div className="flex items-center gap-2">
            <input value={form.defaultOpenTime} onChange={(e) => setForm((f) => ({ ...f, defaultOpenTime: e.target.value }))} placeholder="Mở" className="border border-gray-200 rounded px-3 py-2 text-sm w-full" />
            <input value={form.defaultCloseTime} onChange={(e) => setForm((f) => ({ ...f, defaultCloseTime: e.target.value }))} placeholder="Đóng" className="border border-gray-200 rounded px-3 py-2 text-sm w-full" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            <span>Hoạt động</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label>Bộ Môn</label>
            <select 
              value={form.sportTypeId} 
              onChange={(e) => setForm((f) => ({ ...f, sportTypeId: Number(e.target.value) || 1 }))} 
              className="w-32 border border-gray-200 rounded px-2 py-1"
              disabled={sportTypesLoading}
            >
              {sportTypesLoading ? (
                <option value={form.sportTypeId}>Đang tải...</option>
              ) : (
                sportTypes.map((sport) => (
                  <option key={sport.sportTypeId} value={sport.sportTypeId}>
                    {sport.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="md:col-span-2">
            <button onClick={createCourt} className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm sân
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Tên</th>
                <th className="text-left px-4 py-2">Môn</th>
                <th className="text-left px-4 py-2">Loại</th>
                <th className="text-left px-4 py-2">Giá</th>
                <th className="text-left px-4 py-2">TT</th>
                <th className="text-right px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="px-4 py-4 text-gray-500" colSpan={6}>Đang tải...</td></tr>
              )}
              {error && !loading && (
                <tr><td className="px-4 py-4 text-red-600" colSpan={6}>{error}</td></tr>
              )}
              {!loading && !error && courts.length === 0 && (
                <tr><td className="px-4 py-4 text-gray-500" colSpan={6}>Chưa có sân nào</td></tr>
              )}
              {!loading && !error && courts.map((c) => (
                <tr key={c.courtId} className="border-t">
                  <td className="px-4 py-2">{c.courtId}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{getSportName(c.sportTypeId || c.sport)}</td>
                  <td className="px-4 py-2">{c.courtType}</td>
                  <td className="px-4 py-2">{c.defaultPrice?.toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2">{c.isActive ? '✅' : '❌'}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <button 
                        className="px-3 py-1.5 text-xs rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center gap-1" 
                        onClick={() => { 
                          setSelectedOperatingHoursCourtId(c.courtId); 
                          setOperatingHoursModalOpen(true); 
                        }}
                        title="Quản lý giờ hoạt động"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Giờ hoạt động
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-colors flex items-center gap-1" 
                        onClick={() => { 
                          setSelectedCalendarExceptionsCourtId(c.courtId); 
                          setCalendarExceptionsModalOpen(true); 
                        }}
                        title="Quản lý ngoại lệ lịch"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Ngoại lệ lịch
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors flex items-center gap-1" 
                        onClick={() => { setSelectedCourtId(c.courtId); setPricingError(null); loadPricingList(c.courtId); }}
                        title="Quản lý giá theo khung giờ"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Quản lý giá
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 transition-colors flex items-center gap-1" 
                        onClick={() => openSlotsModal(c.courtId)}
                        title="Xem slots của sân"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Xem Slots
                      </button>
                      <button 
                        className="px-3 py-1.5 text-xs rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors flex items-center gap-1" 
                        onClick={() => openDeleteSlotsModal(c.courtId)}
                        title="Xóa slots chưa đặt trong khoảng thời gian"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa Slots
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedCourtId && (
          <div className="mt-4 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Thêm giá theo khung giờ — Sân #{selectedCourtId}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSlotGenerationModalOpen(true)}
                  className="px-3 py-1 text-xs rounded-md border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-colors flex items-center gap-1"
                  title="Sinh slot tự động"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Sinh slot
                </button>
                <button className="text-xs px-3 py-1 border rounded" onClick={() => setSelectedCourtId(null)}>Đóng</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-sm">
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs text-gray-500">Ngày trong tuần</label>
                <select value={pricingForm.dayOfWeek} onChange={(e) => setPricingForm((f) => ({ ...f, dayOfWeek: e.target.value }))} className="border border-gray-200 rounded px-3 py-2">
                  {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs text-gray-500">Bắt đầu</label>
                <input value={pricingForm.startTime} onChange={(e) => setPricingForm((f) => ({ ...f, startTime: e.target.value }))} className="border border-gray-200 rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs text-gray-500">Kết thúc</label>
                <input value={pricingForm.endTime} onChange={(e) => setPricingForm((f) => ({ ...f, endTime: e.target.value }))} className="border border-gray-200 rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs text-gray-500">Bậc giá</label>
                <input value={pricingForm.tier} onChange={(e) => setPricingForm((f) => ({ ...f, tier: e.target.value }))} className="border border-gray-200 rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs text-gray-500">Giá</label>
                <input type="number" value={pricingForm.price} onChange={(e) => setPricingForm((f) => ({ ...f, price: Number(e.target.value) }))} className="border border-gray-200 rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs text-gray-500">Bước (phút)</label>
                <input type="number" value={pricingForm.stepMinutes} onChange={(e) => setPricingForm((f) => ({ ...f, stepMinutes: Number(e.target.value) }))} className="border border-gray-200 rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs text-gray-500">Tối thiểu (phút)</label>
                <input type="number" value={pricingForm.minDurationMinutes} onChange={(e) => setPricingForm((f) => ({ ...f, minDurationMinutes: Number(e.target.value) }))} className="border border-gray-200 rounded px-3 py-2" />
              </div>
              <div className="md:col-span-3">
                <button disabled={pricingLoading} onClick={async () => {
                  try {
                    setPricingLoading(true);
                    setPricingError(null);
                    const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
                    const res = await fetch(`/api/provider/courts/${selectedCourtId}/pricings`, {
                      method: 'POST',
                      headers: {
                        'accept': 'text/plain, application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                      },
                      body: JSON.stringify(pricingForm)
                    });
                    if (!res.ok) throw new Error(await res.text());
                    alert('Đã thêm cấu hình giá.');
                    await loadPricingList(selectedCourtId);
                  } catch (e) {
                    setPricingError(e.message || String(e));
                  } finally {
                    setPricingLoading(false);
                  }
                }} className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Lưu giá
                </button>
                {pricingError && <span className="ml-3 text-sm text-red-600">{pricingError}</span>}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Cấu hình giá hiện có</div>
              
              {/* Edit Pricing Form */}
              {editingPricingId && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm text-blue-800">Chỉnh sửa cấu hình giá</h4>
                    <button 
                      onClick={cancelEditPricing}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-xs text-gray-500">Ngày trong tuần</label>
                      <select 
                        value={editPricingForm.dayOfWeek} 
                        onChange={(e) => setEditPricingForm((f) => ({ ...f, dayOfWeek: e.target.value }))} 
                        className="border border-gray-200 rounded px-3 py-2"
                      >
                        {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => 
                          <option key={d} value={d}>{d}</option>
                        )}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-xs text-gray-500">Bắt đầu</label>
                      <input 
                        value={editPricingForm.startTime} 
                        onChange={(e) => setEditPricingForm((f) => ({ ...f, startTime: e.target.value }))} 
                        className="border border-gray-200 rounded px-3 py-2" 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-xs text-gray-500">Kết thúc</label>
                      <input 
                        value={editPricingForm.endTime} 
                        onChange={(e) => setEditPricingForm((f) => ({ ...f, endTime: e.target.value }))} 
                        className="border border-gray-200 rounded px-3 py-2" 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-xs text-gray-500">Bậc giá</label>
                      <input 
                        value={editPricingForm.tier} 
                        onChange={(e) => setEditPricingForm((f) => ({ ...f, tier: e.target.value }))} 
                        className="border border-gray-200 rounded px-3 py-2" 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-xs text-gray-500">Giá</label>
                      <input 
                        type="number" 
                        value={editPricingForm.price} 
                        onChange={(e) => setEditPricingForm((f) => ({ ...f, price: Number(e.target.value) }))} 
                        className="border border-gray-200 rounded px-3 py-2" 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-xs text-gray-500">Bước (phút)</label>
                      <input 
                        type="number" 
                        value={editPricingForm.stepMinutes} 
                        onChange={(e) => setEditPricingForm((f) => ({ ...f, stepMinutes: Number(e.target.value) }))} 
                        className="border border-gray-200 rounded px-3 py-2" 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-xs text-gray-500">Tối thiểu (phút)</label>
                      <input 
                        type="number" 
                        value={editPricingForm.minDurationMinutes} 
                        onChange={(e) => setEditPricingForm((f) => ({ ...f, minDurationMinutes: Number(e.target.value) }))} 
                        className="border border-gray-200 rounded px-3 py-2" 
                      />
                    </div>
                    <div className="md:col-span-3">
                      <button
                        onClick={saveEditPricing}
                        disabled={editPricingLoading}
                        className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {editPricingLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      {editPricingError && <span className="ml-3 text-sm text-red-600">{editPricingError}</span>}
                    </div>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">Ngày</th>
                      <th className="text-left px-3 py-2">Bắt đầu</th>
                      <th className="text-left px-3 py-2">Kết thúc</th>
                      <th className="text-left px-3 py-2">Bậc</th>
                      <th className="text-left px-3 py-2">Giá</th>
                      <th className="text-left px-3 py-2">Bước</th>
                      <th className="text-left px-3 py-2">Tối thiểu</th>
                      <th className="text-right px-3 py-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingListLoading && (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={9}>Đang tải...</td></tr>
                    )}
                    {pricingListError && !pricingListLoading && (
                      <tr><td className="px-3 py-3 text-red-600" colSpan={9}>{pricingListError}</td></tr>
                    )}
                    {!pricingListLoading && !pricingListError && pricingList.length === 0 && (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={9}>Chưa có cấu hình.</td></tr>
                    )}
                    {!pricingListLoading && !pricingListError && pricingList.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-3 py-2">{p.id}</td>
                        <td className="px-3 py-2">{p.dayOfWeek}</td>
                        <td className="px-3 py-2">{p.startTime}</td>
                        <td className="px-3 py-2">{p.endTime}</td>
                        <td className="px-3 py-2">{p.tier}</td>
                        <td className="px-3 py-2">{p.price?.toLocaleString('vi-VN')}</td>
                        <td className="px-3 py-2">{p.stepMinutes}</td>
                        <td className="px-3 py-2">{p.minDurationMinutes}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => startEditPricing(p)}
                              className="px-2 py-1 text-xs rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center gap-1"
                              title="Chỉnh sửa cấu hình giá"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Sửa
                            </button>
                            <button
                              onClick={async () => {
                                const confirmDel = window.confirm('Bạn có chắc chắn muốn xóa cấu hình giá này?');
                                if (!confirmDel) return;
                                
                                try {
                                  const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
                                  const res = await fetch(`/api/provider/courts/${selectedCourtId}/pricings/${p.id}`, {
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
                                  
                                  alert('Đã xóa cấu hình giá.');
                                  await loadPricingList(selectedCourtId);
                                } catch (e) {
                                  alert(e.message || String(e));
                                }
                              }}
                              className="px-2 py-1 text-xs rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors flex items-center gap-1"
                              title="Xóa cấu hình giá"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
          </div>
        )}
        <div className="flex items-center justify-between mt-3 text-sm">
          <div>Trang {page}/{totalPages} — Tổng {total}</div>
          <div className="space-x-2">
            <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>Trước</button>
            <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>Sau</button>
            <select className="px-2 py-1 border rounded" value={size} onChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Operating Hours Modal */}
        <OperatingHoursModal
          courtId={selectedOperatingHoursCourtId}
          isOpen={operatingHoursModalOpen}
          onClose={() => {
            setOperatingHoursModalOpen(false);
            setSelectedOperatingHoursCourtId(null);
          }}
          user={user}
        />

        {/* Calendar Exceptions Modal */}
        <CalendarExceptionsModal
          courtId={selectedCalendarExceptionsCourtId}
          isOpen={calendarExceptionsModalOpen}
          onClose={() => {
            setCalendarExceptionsModalOpen(false);
            setSelectedCalendarExceptionsCourtId(null);
          }}
          user={user}
        />

        {/* Slots Modal */}
        {slotsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Danh sách Slots</h3>
                <button
                  onClick={() => setSlotsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Date Selector */}
              <div className="mb-4 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Chọn ngày:</label>
                <input
                  type="date"
                  value={slotsDate}
                  onChange={(e) => {
                    setSlotsDate(e.target.value);
                    if (selectedSlotsCourtId) {
                      loadSlots(selectedSlotsCourtId, e.target.value);
                    }
                  }}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    if (selectedSlotsCourtId) {
                      loadSlots(selectedSlotsCourtId, slotsDate);
                    }
                  }}
                  disabled={slotsLoading}
                  className="px-3 py-2 text-sm rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tải lại
                </button>
              </div>

              {/* Loading State */}
              {slotsLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải slots...</p>
                </div>
              )}

              {/* Error State */}
              {slotsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{slotsError}</span>
                  </div>
                </div>
              )}

              {/* Slots Table */}
              {!slotsLoading && !slotsError && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Slot ID</th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Ngày</th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Giờ bắt đầu</th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Giờ kết thúc</th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Loại</th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Giá</th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                            Không có slot nào cho ngày này
                          </td>
                        </tr>
                      ) : (
                        slots.map((slot) => (
                          <tr key={slot.slotId} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900 font-mono">
                              {slot.slotId}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                              {slot.slotDate}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                              {slot.startTime}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                              {slot.endTime}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                slot.tier === 'priority' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {slot.tier === 'priority' ? 'Ưu tiên' : 'Bình thường'}
                              </span>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900 font-medium">
                              {slot.price?.toLocaleString('vi-VN')} VNĐ
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                slot.isBooked 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {slot.isBooked ? 'Đã đặt' : 'Trống'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary */}
              {!slotsLoading && !slotsError && slots.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tổng slots:</span>
                      <span className="ml-2 font-medium">{slots.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Đã đặt:</span>
                      <span className="ml-2 font-medium text-red-600">{slots.filter(s => s.isBooked).length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trống:</span>
                      <span className="ml-2 font-medium text-green-600">{slots.filter(s => !s.isBooked).length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ưu tiên:</span>
                      <span className="ml-2 font-medium text-yellow-600">{slots.filter(s => s.tier === 'priority').length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Slots Modal */}
        {deleteSlotsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Xóa Slots Chưa Đặt</h3>
                <button
                  onClick={() => {
                    setDeleteSlotsModalOpen(false);
                    setDeleteSlotsResult(null);
                    setDeleteSlotsError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Cảnh báo</p>
                    <p className="text-sm text-yellow-700">Chỉ xóa các slots chưa được đặt trong khoảng thời gian đã chọn. Slots đã đặt sẽ được bỏ qua.</p>
                  </div>
                </div>
              </div>

              {/* Date Range Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={deleteSlotsForm.from}
                    onChange={(e) => setDeleteSlotsForm(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={deleteSlotsForm.to}
                    onChange={(e) => setDeleteSlotsForm(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteSlotsModalOpen(false);
                    setDeleteSlotsResult(null);
                    setDeleteSlotsError(null);
                  }}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={deleteSlots}
                  disabled={deleteSlotsLoading || !deleteSlotsForm.from || !deleteSlotsForm.to}
                  className="px-4 py-2 text-sm rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleteSlotsLoading ? 'Đang xóa...' : 'Xóa Slots'}
                </button>
              </div>

              {/* Loading State */}
              {deleteSlotsLoading && (
                <div className="mt-4 text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang xóa slots...</p>
                </div>
              )}

              {/* Error State */}
              {deleteSlotsError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{deleteSlotsError}</span>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {deleteSlotsResult && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">Xóa slots thành công!</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p><strong>Từ ngày:</strong> {deleteSlotsResult.from}</p>
                    <p><strong>Đến ngày:</strong> {deleteSlotsResult.to}</p>
                    <p><strong>Đã xóa:</strong> {deleteSlotsResult.deleted} slots</p>
                    <p><strong>Bỏ qua (đã đặt):</strong> {deleteSlotsResult.skippedBooked} slots</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slot Generation Modal */}
        {slotGenerationModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90vw] max-w-2xl rounded-2xl shadow-2xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sinh slot tự động - Sân #{selectedCourtId}</h3>
                <button 
                  className="text-sm px-3 py-1 border rounded hover:bg-gray-50" 
                  onClick={() => {
                    setSlotGenerationModalOpen(false);
                    setSlotGenerationResult(null);
                    setSlotGenerationError(null);
                  }}
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-4">
                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Từ ngày:</label>
                    <input
                      type="date"
                      value={slotGenerationForm.from}
                      onChange={(e) => setSlotGenerationForm(prev => ({ ...prev, from: e.target.value }))}
                      className="border border-gray-200 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Đến ngày:</label>
                    <input
                      type="date"
                      value={slotGenerationForm.to}
                      onChange={(e) => setSlotGenerationForm(prev => ({ ...prev, to: e.target.value }))}
                      className="border border-gray-200 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={slotGenerationForm.overwriteExisting}
                      onChange={(e) => setSlotGenerationForm(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Ghi đè slot đã tồn tại</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={slotGenerationForm.dryRun}
                      onChange={(e) => setSlotGenerationForm(prev => ({ ...prev, dryRun: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Chế độ thử nghiệm (không tạo slot thực)</span>
                  </div>
                </div>

                {/* Error */}
                {slotGenerationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-red-600 text-sm">{slotGenerationError}</div>
                  </div>
                )}

                {/* Result */}
                {slotGenerationResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Kết quả sinh slot:</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>Từ: {slotGenerationResult.from}</div>
                      <div>Đến: {slotGenerationResult.to}</div>
                      <div>Đã tạo: <span className="font-semibold">{slotGenerationResult.created}</span> slot</div>
                      <div>Bỏ qua slot đã tồn tại: {slotGenerationResult.skippedExisting}</div>
                      <div>Bỏ qua ngày đóng cửa: {slotGenerationResult.skippedClosed}</div>
                      <div>Bỏ qua ngoài giờ hoạt động: {slotGenerationResult.skippedOutsideHours}</div>
                      {slotGenerationResult.notes && slotGenerationResult.notes.length > 0 && (
                        <div className="mt-2">
                          <div className="font-medium">Ghi chú:</div>
                          <ul className="list-disc list-inside">
                            {slotGenerationResult.notes.map((note, index) => (
                              <li key={index}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSlotGenerationModalOpen(false);
                      setSlotGenerationResult(null);
                      setSlotGenerationError(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={generateSlots}
                    disabled={slotGenerationLoading}
                    className="px-4 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {slotGenerationLoading ? 'Đang sinh...' : 'Sinh slot'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}


