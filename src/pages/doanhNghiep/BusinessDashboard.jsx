import React, { useMemo, useState, useEffect } from 'react';
import BusinessLayout from '../../components/layouts/BusinessLayout';
import GoogleMapEmbed from '../../components/GoogleMapEmbed';
import { useAuth } from '../../contexts/AuthContext';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const stats = {
    fields: 12,
    bookingsToday: 38,
    revenue: 8650000,
  };

  const recentBookings = [
    { id: 'BK-1001', field: 'Sân 5 - A1', time: '07:00 - 08:00', customer: 'Nguyễn Văn A', price: 120000 },
    { id: 'BK-1002', field: 'Sân 7 - B2', time: '09:00 - 10:30', customer: 'Trần Thị B', price: 180000 },
    { id: 'BK-1003', field: 'Sân 11 - C3', time: '17:00 - 18:30', customer: 'Lê C', price: 250000 },
    { id: 'BK-1004', field: 'Sân 5 - A2', time: '19:00 - 20:00', customer: 'Phạm D', price: 120000 },
    { id: 'BK-1005', field: 'Sân 7 - B1', time: '20:00 - 21:00', customer: 'Đỗ E', price: 180000 },
  ];
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recentBookings;
    return recentBookings.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.field.toLowerCase().includes(q) ||
      b.customer.toLowerCase().includes(q) ||
      b.time.toLowerCase().includes(q)
    );
  }, [recentBookings, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize), [filtered, pageSafe]);

  // Facilities state
  const [facilities, setFacilities] = useState([]);
  const [facPage, setFacPage] = useState(1);
  const [facSize, setFacSize] = useState(20);
  const [facTotal, setFacTotal] = useState(0);
  const [facTotalPages, setFacTotalPages] = useState(1);
  const [facLoading, setFacLoading] = useState(false);
  const [facError, setFacError] = useState(null);
  const [facReloadTick, setFacReloadTick] = useState(0);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', description: '' });

  // Load facilities list
  useEffect(() => {
    const controller = new AbortController();
    async function loadFacilities() {
      try {
        setFacLoading(true);
        setFacError(null);
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        if (!accessToken) {
          setFacilities([]);
          setFacLoading(false);
          return;
        }
        const url = `/api/provider/facilities?page=${facPage}&size=${facSize}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json, text/plain',
            'Authorization': `Bearer ${accessToken}`
          },
          signal: controller.signal
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text());
        setFacilities(Array.isArray(data.items) ? data.items : []);
        setFacTotal(data.total || 0);
        setFacTotalPages(data.totalPages || 1);
      } catch (e) {
        if (e && (e.name === 'AbortError' || String(e).toLowerCase().includes('aborted'))) return;
        setFacError(e.message || String(e));
      } finally {
        setFacLoading(false);
      }
    }
    loadFacilities();
    return () => controller.abort();
  }, [user, facPage, facSize, facReloadTick]);

  // Create facility
  const createFacility = async (evt) => {
    evt.preventDefault();
    try {
      setCreating(true);
      setCreateError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const res = await fetch('/api/provider/facilities', {
        method: 'POST',
        headers: {
          'accept': 'text/plain, application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          description: form.description
        })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      // Refresh list and clear form
      setForm({ name: '', address: '', description: '' });
      // Notify and refresh list
      alert('Tạo chi nhánh thành công.');
      setFacPage(1);
      setFacReloadTick((x) => x + 1);
    } catch (e) {
      setCreateError(e.message || String(e));
    } finally {
      setCreating(false);
    }
  };

  // Facility detail modal state
  const [selectedFacId, setSelectedFacId] = useState(null);
  const [facDetail, setFacDetail] = useState(null);
  const [facDetailLoading, setFacDetailLoading] = useState(false);
  const [facDetailError, setFacDetailError] = useState(null);
  const [facSaving, setFacSaving] = useState(false);
  const [facDeleting, setFacDeleting] = useState(false);

  // Courts state under selected facility
  const [courts, setCourts] = useState([]);
  const [courtsPage, setCourtsPage] = useState(1);
  const [courtsSize, setCourtsSize] = useState(20);
  const [courtsTotal, setCourtsTotal] = useState(0);
  const [courtsTotalPages, setCourtsTotalPages] = useState(1);
  const [courtsSportTypeId, setCourtsSportTypeId] = useState(1);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [courtsError, setCourtsError] = useState(null);
  const [courtForm, setCourtForm] = useState({
    sportTypeId: 1,
    name: '',
    courtType: '',
    defaultPrice: 0,
    defaultOpenTime: '08:00:00',
    defaultCloseTime: '20:00:00',
    isActive: true
  });
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [courtDetail, setCourtDetail] = useState(null);
  const [courtDetailLoading, setCourtDetailLoading] = useState(false);
  const [courtDetailError, setCourtDetailError] = useState(null);
  const [courtSaving, setCourtSaving] = useState(false);

  const openFacility = async (facilityId) => {
    try {
      setSelectedFacId(facilityId);
      setFacDetail(null);
      setFacDetailError(null);
      setFacDetailLoading(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const res = await fetch(`/api/provider/facilities/${facilityId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text());
      setFacDetail({
        facilityId: data.facilityId,
        name: data.name || '',
        address: data.address || '',
        description: data.description || ''
      });
      // load courts list for this facility (default sportTypeId)
      await loadCourts(facilityId, courtsSportTypeId, courtsPage, courtsSize);
    } catch (e) {
      setFacDetailError(e.message || String(e));
    } finally {
      setFacDetailLoading(false);
    }
  };

  const closeFacility = () => {
    setSelectedFacId(null);
    setFacDetail(null);
    setFacDetailError(null);
    setFacDetailLoading(false);
    setFacSaving(false);
    setFacDeleting(false);
    setCourts([]);
    setCourtsPage(1);
    setCourtsSize(20);
    setCourtsTotal(0);
    setCourtsTotalPages(1);
    setCourtsSportTypeId(1);
    setCourtsLoading(false);
    setCourtsError(null);
    setCourtForm({ sportTypeId: 1, name: '', courtType: '', defaultPrice: 0, defaultOpenTime: '08:00:00', defaultCloseTime: '20:00:00', isActive: true });
  };

  const saveFacility = async () => {
    if (!facDetail) return;
    try {
      setFacSaving(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const res = await fetch(`/api/provider/facilities/${facDetail.facilityId}`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name: facDetail.name, address: facDetail.address, description: facDetail.description || '' })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      alert('Cập nhật chi nhánh thành công.');
      setFacReloadTick((x) => x + 1);
      closeFacility();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setFacSaving(false);
    }
  };

  const loadCourts = async (facilityId, sportTypeId, page, size) => {
    try {
      setCourtsLoading(true);
      setCourtsError(null);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const url = `/api/provider/facilities/${facilityId}/courts?sportTypeId=${sportTypeId}&page=${page}&size=${size}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text());
      setCourts(Array.isArray(data.items) ? data.items : []);
      setCourtsTotal(data.total || 0);
      setCourtsTotalPages(data.totalPages || 1);
    } catch (e) {
      setCourtsError(e.message || String(e));
    } finally {
      setCourtsLoading(false);
    }
  };

  const createCourt = async () => {
    if (!facDetail) return;
    try {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const res = await fetch(`/api/provider/facilities/${facDetail.facilityId}/courts`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain, application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          facilityId: facDetail.facilityId,
          sportTypeId: Number(courtForm.sportTypeId),
          name: courtForm.name,
          courtType: courtForm.courtType,
          defaultPrice: Number(courtForm.defaultPrice),
          defaultOpenTime: courtForm.defaultOpenTime,
          defaultCloseTime: courtForm.defaultCloseTime,
          isActive: Boolean(courtForm.isActive)
        })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      alert('Đã tạo sân.');
      // reload list using current filters
      await loadCourts(facDetail.facilityId, courtsSportTypeId, courtsPage, courtsSize);
      // clear form minimal
      setCourtForm((f) => ({ ...f, name: '' }));
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  const deleteFacility = async () => {
    if (!facDetail) return;
    const confirmDel = window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này?');
    if (!confirmDel) return;
    try {
      setFacDeleting(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const res = await fetch(`/api/provider/facilities/${facDetail.facilityId}`, {
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
      alert('Đã xóa chi nhánh.');
      setFacReloadTick((x) => x + 1);
      closeFacility();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setFacDeleting(false);
    }
  };

  return (
    <BusinessLayout title="Tổng quan">
      <h1 className="text-xl font-semibold mb-4">Tổng quan doanh nghiệp</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Số sân</div>
          <div className="text-2xl font-semibold">{stats.fields}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Đặt sân hôm nay</div>
          <div className="text-2xl font-semibold">{stats.bookingsToday}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Doanh thu</div>
          <div className="text-2xl font-semibold">{stats.revenue.toLocaleString('vi-VN')}₫</div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-base font-semibold mb-3">Tạo chi nhánh (Facility)</h2>
        <form onSubmit={createFacility} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-gray-200 rounded-xl p-4">
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Tên chi nhánh"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            required
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Địa chỉ"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả (tùy chọn)"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <div className="md:col-span-3 flex items-center gap-3">
            <button disabled={creating} type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-50">Tạo chi nhánh</button>
            {createError && <div className="text-sm text-red-600">{createError}</div>}
          </div>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold mb-3">Chi nhánh của tôi</h2>
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="text-gray-500">Trang {facPage}/{facTotalPages} — Tổng {facTotal}</div>
          <div className="space-x-2">
            <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setFacPage((p) => Math.max(1, p - 1))} disabled={facPage === 1 || facLoading}>Trước</button>
            <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setFacPage((p) => Math.min(facTotalPages, p + 1))} disabled={facPage === facTotalPages || facLoading}>Sau</button>
            <select className="px-2 py-1 border rounded" value={facSize} onChange={(e) => { setFacSize(parseInt(e.target.value, 10)); setFacPage(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Tên</th>
                <th className="text-left px-4 py-2">Địa chỉ</th>
                <th className="text-left px-4 py-2">Số sân</th>
                <th className="text-left px-4 py-2">Tạo lúc</th>
              </tr>
            </thead>
            <tbody>
              {facLoading && (
                <tr><td className="px-4 py-4 text-gray-500" colSpan={5}>Đang tải...</td></tr>
              )}
              {facError && !facLoading && (
                <tr><td className="px-4 py-4 text-red-600" colSpan={5}>{facError}</td></tr>
              )}
              {!facLoading && !facError && facilities.length === 0 && (
                <tr><td className="px-4 py-4 text-gray-500" colSpan={5}>Chưa có chi nhánh nào</td></tr>
              )}
              {!facLoading && !facError && facilities.map((f) => (
                <tr key={f.facilityId} className="border-t cursor-pointer hover:bg-emerald-50/50" onClick={() => openFacility(f.facilityId)}>
                  <td className="px-4 py-2">{f.facilityId}</td>
                  <td className="px-4 py-2">{f.name}</td>
                  <td className="px-4 py-2">{f.address}</td>
                  <td className="px-4 py-2">{f.courts}</td>
                  <td className="px-4 py-2">{new Date(f.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Management split view: Facilities (left) and Courts (right) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="font-semibold mb-2">Quản lý chi nhánh</h3>
          <p className="text-sm text-gray-500 mb-3">Chọn một chi nhánh từ bảng trên để xem chi tiết.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Quản lý sân</h3>
            {selectedFacId && (
              <button className="text-xs px-3 py-1 border rounded" onClick={closeFacility}>Bỏ chọn</button>
            )}
          </div>
          {!selectedFacId && (
            <div className="text-sm text-gray-500">Chưa chọn chi nhánh. Hãy click một dòng trong bảng để bắt đầu.</div>
          )}
          {selectedFacId !== null && (
            <div>
              {facDetailLoading && <div className="text-gray-500 text-sm">Đang tải chi tiết...</div>}
              {facDetailError && !facDetailLoading && <div className="text-red-600 text-sm">{facDetailError}</div>}
              {facDetail && !facDetailLoading && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-gray-500">Tên</label>
                    <input value={facDetail.name} onChange={(e) => setFacDetail((d) => ({ ...d, name: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-gray-500">Địa chỉ</label>
                    <input value={facDetail.address} onChange={(e) => setFacDetail((d) => ({ ...d, address: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                  {facDetail.address && (
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-1">Bản đồ</div>
                      <GoogleMapEmbed address={facDetail.address} />
                      <div className="mt-1">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facDetail.address)}`} target="_blank" rel="noreferrer" className="text-emerald-700 underline text-xs">Mở trên Google Maps</a>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-gray-500">Mô tả (tùy chọn)</label>
                    <input value={facDetail.description} onChange={(e) => setFacDetail((d) => ({ ...d, description: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                  <div className="pt-2 flex items-center gap-3">
                    <button disabled={facSaving} onClick={saveFacility} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-50">Lưu thay đổi</button>
                    <button disabled={facDeleting} onClick={deleteFacility} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:brightness-110 disabled:opacity-50">Xóa</button>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Danh sách sân</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <label>SportTypeId</label>
                        <input
                          type="number"
                          value={courtsSportTypeId}
                          onChange={(e) => { setCourtsSportTypeId(Number(e.target.value) || 1); setCourtsPage(1); loadCourts(facDetail.facilityId, Number(e.target.value) || 1, 1, courtsSize); }}
                          className="w-20 border border-gray-200 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <input value={courtForm.name} onChange={(e) => setCourtForm((f) => ({ ...f, name: e.target.value }))} placeholder="Tên sân" className="border border-gray-200 rounded px-3 py-2 text-sm" />
                      <input value={courtForm.courtType} onChange={(e) => setCourtForm((f) => ({ ...f, courtType: e.target.value }))} placeholder="Loại sân (vd: Sân 5)" className="border border-gray-200 rounded px-3 py-2 text-sm" />
                      <input type="number" value={courtForm.defaultPrice} onChange={(e) => setCourtForm((f) => ({ ...f, defaultPrice: e.target.value }))} placeholder="Giá mặc định" className="border border-gray-200 rounded px-3 py-2 text-sm" />
                      <div className="flex items-center gap-2">
                        <input value={courtForm.defaultOpenTime} onChange={(e) => setCourtForm((f) => ({ ...f, defaultOpenTime: e.target.value }))} placeholder="Mở" className="border border-gray-200 rounded px-3 py-2 text-sm w-full" />
                        <input value={courtForm.defaultCloseTime} onChange={(e) => setCourtForm((f) => ({ ...f, defaultCloseTime: e.target.value }))} placeholder="Đóng" className="border border-gray-200 rounded px-3 py-2 text-sm w-full" />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={courtForm.isActive} onChange={(e) => setCourtForm((f) => ({ ...f, isActive: e.target.checked }))} />
                        <span>Hoạt động</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <label>SportTypeId</label>
                        <input type="number" value={courtForm.sportTypeId} onChange={(e) => setCourtForm((f) => ({ ...f, sportTypeId: Number(e.target.value) || 1 }))} className="w-24 border border-gray-200 rounded px-2 py-1" />
                      </div>
                      <div className="md:col-span-2">
                        <button onClick={createCourt} className="px-4 py-2 rounded bg-emerald-600 text-white hover:brightness-110">Thêm sân</button>
                      </div>
                    </div>
                    <div className="overflow-x-auto border border-gray-200 rounded">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2">ID</th>
                            <th className="text-left px-3 py-2">Tên</th>
                            <th className="text-left px-3 py-2">Môn</th>
                            <th className="text-left px-3 py-2">Loại</th>
                            <th className="text-left px-3 py-2">Giá</th>
                            <th className="text-left px-3 py-2">TT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courtsLoading && (
                            <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>Đang tải...</td></tr>
                          )}
                          {courtsError && !courtsLoading && (
                            <tr><td className="px-3 py-3 text-red-600" colSpan={6}>{courtsError}</td></tr>
                          )}
                          {!courtsLoading && !courtsError && courts.length === 0 && (
                            <tr><td className="px-3 py-3 text-gray-500" colSpan={6}>Chưa có sân nào</td></tr>
                          )}
                          {!courtsLoading && !courtsError && courts.map((c) => (
                          <tr key={c.courtId} className="border-t cursor-pointer hover:bg-emerald-50/40" onClick={async () => {
                            try {
                              setSelectedCourtId(c.courtId);
                              setCourtDetail(null);
                              setCourtDetailError(null);
                              setCourtDetailLoading(true);
                              const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
                              const res = await fetch(`/api/provider/courts/${c.courtId}`, {
                                method: 'GET',
                                headers: {
                                  'accept': 'application/json, text/plain',
                                  'Authorization': `Bearer ${accessToken}`
                                }
                              });
                              if (!res.ok) {
                                const txt = await res.text();
                                throw new Error(txt || `HTTP ${res.status}`);
                              }
                              const ct = res.headers.get('content-type') || '';
                              const data = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text());
                              setCourtDetail({
                                courtId: data.courtId,
                                name: data.name || '',
                                sport: data.sport || '',
                                courtType: data.courtType || '',
                                defaultPrice: data.defaultPrice ?? 0,
                                isActive: Boolean(data.isActive)
                              });
                            } catch (e) {
                              setCourtDetailError(e.message || String(e));
                            } finally {
                              setCourtDetailLoading(false);
                            }
                          }}>
                              <td className="px-3 py-2">{c.courtId}</td>
                              <td className="px-3 py-2">{c.name}</td>
                              <td className="px-3 py-2">{c.sport}</td>
                              <td className="px-3 py-2">{c.courtType}</td>
                              <td className="px-3 py-2">{c.defaultPrice?.toLocaleString('vi-VN')}</td>
                              <td className="px-3 py-2">{c.isActive ? '✅' : '❌'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div>Trang {courtsPage}/{courtsTotalPages} — Tổng {courtsTotal}</div>
                      <div className="space-x-2">
                        <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => { const p = Math.max(1, courtsPage - 1); setCourtsPage(p); loadCourts(facDetail.facilityId, courtsSportTypeId, p, courtsSize); }} disabled={courtsPage === 1 || courtsLoading}>Trước</button>
                        <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => { const p = Math.min(courtsTotalPages, courtsPage + 1); setCourtsPage(p); loadCourts(facDetail.facilityId, courtsSportTypeId, p, courtsSize); }} disabled={courtsPage === courtsTotalPages || courtsLoading}>Sau</button>
                        <select className="px-2 py-1 border rounded" value={courtsSize} onChange={(e) => { const s = parseInt(e.target.value, 10); setCourtsSize(s); setCourtsPage(1); loadCourts(facDetail.facilityId, courtsSportTypeId, 1, s); }}>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {selectedCourtId !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[90vw] max-w-lg rounded-2xl shadow-2xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Chi tiết sân #{selectedCourtId}</h3>
              <button className="text-sm px-3 py-1 border rounded hover:bg-gray-50" onClick={() => { setSelectedCourtId(null); setCourtDetail(null); setCourtDetailError(null); setCourtDetailLoading(false); setCourtSaving(false); }}>Đóng</button>
            </div>
            {courtDetailLoading && <div className="text-gray-500 text-sm">Đang tải...</div>}
            {courtDetailError && !courtDetailLoading && <div className="text-red-600 text-sm">{courtDetailError}</div>}
            {courtDetail && !courtDetailLoading && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-xs text-gray-500">Tên sân</label>
                  <input value={courtDetail.name} onChange={(e) => setCourtDetail((d) => ({ ...d, name: e.target.value }))} className="border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-xs text-gray-500">Môn</label>
                  <input value={courtDetail.sport} disabled className="border border-gray-200 rounded px-3 py-2 bg-gray-50 text-gray-600" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-xs text-gray-500">Loại sân</label>
                  <input value={courtDetail.courtType} onChange={(e) => setCourtDetail((d) => ({ ...d, courtType: e.target.value }))} className="border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-xs text-gray-500">Giá mặc định</label>
                  <input type="number" value={courtDetail.defaultPrice} onChange={(e) => setCourtDetail((d) => ({ ...d, defaultPrice: Number(e.target.value) }))} className="border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={courtDetail.isActive} onChange={(e) => setCourtDetail((d) => ({ ...d, isActive: e.target.checked }))} />
                  <span>Hoạt động</span>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button disabled={courtSaving} onClick={async () => {
                    try {
                      setCourtSaving(true);
                      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
                      const res = await fetch(`/api/provider/courts/${selectedCourtId}`, {
                        method: 'PUT',
                        headers: {
                          'accept': '*/*',
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({
                          name: courtDetail.name,
                          courtType: courtDetail.courtType,
                          defaultPrice: courtDetail.defaultPrice,
                          isActive: courtDetail.isActive
                        })
                      });
                      if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(txt || `HTTP ${res.status}`);
                      }
                      alert('Đã cập nhật sân.');
                      // refresh courts list
                      if (facDetail) await loadCourts(facDetail.facilityId, courtsSportTypeId, courtsPage, courtsSize);
                      setSelectedCourtId(null);
                    } catch (e) {
                      alert(e.message || String(e));
                    } finally {
                      setCourtSaving(false);
                    }
                  }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-50">Lưu thay đổi</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6">
        <h2 className="text-base font-semibold mb-3">Đặt sân gần đây</h2>
        <div className="flex items-center justify-between mb-3 gap-3">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm mã/sân/khách hàng..."
            className="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <div className="text-sm text-gray-500">{filtered.length} mục</div>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Mã</th>
                <th className="text-left px-4 py-2">Sân</th>
                <th className="text-left px-4 py-2">Khung giờ</th>
                <th className="text-left px-4 py-2">Khách hàng</th>
                <th className="text-right px-4 py-2">Giá</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.id}</td>
                  <td className="px-4 py-2">{b.field}</td>
                  <td className="px-4 py-2">{b.time}</td>
                  <td className="px-4 py-2">{b.customer}</td>
                  <td className="px-4 py-2 text-right">{b.price.toLocaleString('vi-VN')}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div>Trang {pageSafe}/{totalPages}</div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
            >Trước</button>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
            >Sau</button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}



