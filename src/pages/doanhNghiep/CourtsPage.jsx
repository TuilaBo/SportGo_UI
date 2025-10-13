import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/layouts/BusinessLayout';
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
            <label className="text-xs text-gray-500">SportTypeId</label>
            <input type="number" value={sportTypeId} onChange={(e) => { setSportTypeId(Number(e.target.value) || 1); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
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
            <label>SportTypeId</label>
            <input type="number" value={form.sportTypeId} onChange={(e) => setForm((f) => ({ ...f, sportTypeId: Number(e.target.value) || 1 }))} className="w-24 border border-gray-200 rounded px-2 py-1" />
          </div>
          <div className="md:col-span-2">
            <button onClick={createCourt} className="px-4 py-2 rounded bg-emerald-600 text-white hover:brightness-110">Thêm sân</button>
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
                  <td className="px-4 py-2">{c.sport}</td>
                  <td className="px-4 py-2">{c.courtType}</td>
                  <td className="px-4 py-2">{c.defaultPrice?.toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2">{c.isActive ? '✅' : '❌'}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="px-2 py-1 text-xs rounded border" onClick={() => { setSelectedCourtId(c.courtId); setPricingError(null); loadPricingList(c.courtId); }}>Thêm giá</button>
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
              <button className="text-xs px-3 py-1 border rounded" onClick={() => setSelectedCourtId(null)}>Đóng</button>
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
                }} className="px-4 py-2 rounded bg-emerald-600 text-white hover:brightness-110 disabled:opacity-50">Lưu giá</button>
                {pricingError && <span className="ml-3 text-sm text-red-600">{pricingError}</span>}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Cấu hình giá hiện có</div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {pricingListLoading && (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={8}>Đang tải...</td></tr>
                    )}
                    {pricingListError && !pricingListLoading && (
                      <tr><td className="px-3 py-3 text-red-600" colSpan={8}>{pricingListError}</td></tr>
                    )}
                    {!pricingListLoading && !pricingListError && pricingList.length === 0 && (
                      <tr><td className="px-3 py-3 text-gray-500" colSpan={8}>Chưa có cấu hình.</td></tr>
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
      </div>
    </BusinessLayout>
  );
}


