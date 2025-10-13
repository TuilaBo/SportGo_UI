import React, { useMemo, useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import GoogleMapEmbed from '../../components/GoogleMapEmbed';

export default function AdminDashboard() {
  const { user } = useAuth();
  const stats = {
    users: 1284,
    providers: 76,
    bookingsToday: 214,
  };

  const activities = [
    { id: 'A-1001', type: 'Đăng ký mới', detail: 'Nguyễn Văn A', time: '10 phút trước' },
    { id: 'A-1002', type: 'Tạo doanh nghiệp', detail: 'Sân 5 Quận 7', time: '28 phút trước' },
    { id: 'A-1003', type: 'Khóa tài khoản', detail: 'user123@example.com', time: '1 giờ trước' },
    { id: 'A-1004', type: 'Đơn đặt sân', detail: '#BK-92314', time: '2 giờ trước' },
    { id: 'A-1005', type: 'Khôi phục tài khoản', detail: 'b.tran@example.com', time: '3 giờ trước' },
    { id: 'A-1006', type: 'Đơn đặt sân', detail: '#BK-92345', time: '4 giờ trước' },
    { id: 'A-1007', type: 'Đăng ký mới', detail: 'Phạm D', time: 'Hôm qua' },
  ];
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.detail.toLowerCase().includes(q) ||
      a.time.toLowerCase().includes(q)
    );
  }, [activities, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize), [filtered, pageSafe]);
  const [provPage, setProvPage] = useState(1);
  const [provPageSize, setProvPageSize] = useState(5);
  const [providersPending, setProvidersPending] = useState([]);
  const [providersTotal, setProvidersTotal] = useState(null);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState(null);
  const [providerStatuses, setProviderStatuses] = useState({}); // { [userId]: status }
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [providerDetail, setProviderDetail] = useState(null);
  const [providerDetailLoading, setProviderDetailLoading] = useState(false);
  const [providerDetailError, setProviderDetailError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProviders() {
      try {
        setProvidersLoading(true);
        setProvidersError(null);
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        if (!accessToken) {
          setProvidersPending([]);
          setProvidersLoading(false);
          return;
        }
        const url = `/api/Admin/providers?PageNumber=${provPage}&PageSize=${provPageSize}`;
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
        const contentType = res.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const txt = await res.text();
          try { data = JSON.parse(txt); } catch { data = []; }
        }
        // Backend returns array; total not provided -> infer presence only
        setProvidersPending(Array.isArray(data) ? data : []);
        setProvidersTotal(null);
        // reset statuses when list changes
        setProviderStatuses({});
      } catch (e) {
        if (e && (e.name === 'AbortError' || String(e).toLowerCase().includes('aborted'))) {
          return; // ignore aborted fetch
        }
        setProvidersError(e.message || String(e));
      } finally {
        setProvidersLoading(false);
      }
    }
    loadProviders();
    return () => controller.abort();
  }, [user, provPage, provPageSize]);

  // Enrich each row's status from detail endpoint by UserId
  useEffect(() => {
    let abort = false;
    async function hydrateStatuses() {
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      if (!accessToken) return;
      const idsToFetch = providersPending
        .map((p) => p.userId)
        .filter((id) => providerStatuses[id] === undefined);
      for (const id of idsToFetch) {
        try {
          const res = await fetch(`/api/Admin/providers/${id}`, {
            method: 'GET',
            headers: {
              'accept': 'application/json, text/plain',
              'Authorization': `Bearer ${accessToken}`
            }
          });
          if (!res.ok) {
            // keep undefined on failure
            continue;
          }
          const ct = res.headers.get('content-type') || '';
          const data = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text()).catch(() => null);
          if (abort) return;
          setProviderStatuses((prev) => ({ ...prev, [id]: data && data.providerStatus ? data.providerStatus : 'Pending' }));
        } catch (e) {
          if (String(e).toLowerCase().includes('aborted')) return;
          // ignore per-row error
        }
      }
    }
    hydrateStatuses();
    return () => { abort = true; };
  }, [providersPending, user, providerStatuses]);

  const openProviderDetail = async (userId) => {
    try {
      setSelectedProviderId(userId);
      setProviderDetail(null);
      setProviderDetailError(null);
      setProviderDetailLoading(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const url = `/api/Admin/providers/${userId}`;
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
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const txt = await res.text();
        try { data = JSON.parse(txt); } catch { data = null; }
      }
      setProviderDetail(data);
    } catch (e) {
      if (e && (e.name === 'AbortError' || String(e).toLowerCase().includes('aborted'))) {
        return; // ignore aborted fetch
      }
      setProviderDetailError(e.message || String(e));
    } finally {
      setProviderDetailLoading(false);
    }
  };

  const closeProviderDetail = () => {
    setSelectedProviderId(null);
    setProviderDetail(null);
    setProviderDetailError(null);
    setProviderDetailLoading(false);
    setRejectReason('');
    setActionLoading(false);
  };

  const approveProvider = async (userId) => {
    try {
      setActionLoading(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const url = `/api/Admin/providers/${userId}/approve`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${accessToken}`
        },
        body: ''
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      // Optimistically remove from list and close
      setProvidersPending((prev) => prev.filter((p) => p.userId !== userId));
      closeProviderDetail();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setActionLoading(false);
    }
  };

  const rejectProvider = async (userId, reason) => {
    try {
      setActionLoading(true);
      const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
      const url = `/api/Admin/providers/${userId}/reject`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      setProvidersPending((prev) => prev.filter((p) => p.userId !== userId));
      closeProviderDetail();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setActionLoading(false);
    }
  };
  return (
    <AdminLayout title="Bảng điều khiển">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 mb-6">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 blur-3xl opacity-40" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-200 to-indigo-200 blur-3xl opacity-30" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Bảng điều khiển quản trị</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi hoạt động và duyệt hồ sơ nhà cung cấp nhanh chóng.</p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <a href="#providers" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white shadow hover:shadow-md hover:brightness-110 transition">Xem hồ sơ chờ duyệt</a>
            <a href="#activities" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 bg-white/60 backdrop-blur hover:bg-white transition">Hoạt động gần đây</a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="group rounded-2xl border border-gray-200 p-4 bg-white hover:border-indigo-200 hover:shadow transition">
          <div className="text-sm text-gray-500">Người dùng</div>
          <div className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">{stats.users.toLocaleString('vi-VN')}</div>
        </div>
        <div className="group rounded-2xl border border-gray-200 p-4 bg-white hover:border-purple-200 hover:shadow transition">
          <div className="text-sm text-gray-500">Doanh nghiệp</div>
          <div className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">{stats.providers.toLocaleString('vi-VN')}</div>
        </div>
        <div className="group rounded-2xl border border-gray-200 p-4 bg-white hover:border-blue-200 hover:shadow transition">
          <div className="text-sm text-gray-500">Đặt sân hôm nay</div>
          <div className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">{stats.bookingsToday.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div id="providers" className="mt-8">
        <h2 className="text-base font-semibold mb-3">Hồ sơ nhà cung cấp chờ duyệt</h2>
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="text-gray-500">Trang {provPage}</div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setProvPage((p) => Math.max(1, p - 1))}
              disabled={provPage === 1 || providersLoading}
            >Trước</button>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setProvPage((p) => p + 1)}
              disabled={providersLoading || (providersPending && providersPending.length < provPageSize)}
            >Sau</button>
            <select
              className="px-2 py-1 border rounded"
              value={provPageSize}
              onChange={(e) => { setProvPageSize(parseInt(e.target.value, 10)); setProvPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-2">UserId</th>
                <th className="text-left px-4 py-2">Họ tên</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Doanh nghiệp</th>
                <th className="text-left px-4 py-2">Trạng thái</th>
                <th className="text-left px-4 py-2">Gửi lúc</th>
              </tr>
            </thead>
            <tbody>
              {providersLoading && (
                <tr><td className="px-4 py-4 text-gray-500" colSpan={5}>Đang tải...</td></tr>
              )}
              {providersError && !providersLoading && (
                <tr><td className="px-4 py-4 text-red-600" colSpan={5}>{providersError}</td></tr>
              )}
              {!providersLoading && !providersError && providersPending.length === 0 && (
                <tr><td className="px-4 py-4 text-gray-500" colSpan={5}>Không có hồ sơ nào</td></tr>
              )}
              {!providersLoading && !providersError && providersPending.map((p) => (
                <tr key={`${p.userId}-${p.email}`} className="border-t cursor-pointer hover:bg-indigo-50/50 transition" onClick={() => openProviderDetail(p.userId)}>
                  <td className="px-4 py-2">{p.userId}</td>
                  <td className="px-4 py-2">{p.fullName}</td>
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2">{p.businessName}</td>
                  <td className="px-4 py-2">
                    {providerStatuses[p.userId] === undefined ? (
                      <span className="px-2 py-1 text-xs rounded bg-gray-50 text-gray-600 border border-gray-100">Đang tải...</span>
                    ) : (
                      <span className={
                        `px-2 py-1 text-xs rounded border ` +
                        (providerStatuses[p.userId] === 'Approved'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : providerStatuses[p.userId] === 'Rejected'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-100')
                      }>
                        {providerStatuses[p.userId]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{new Date(p.submittedAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedProviderId !== null && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90vw] max-w-xl rounded-2xl shadow-2xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Chi tiết hồ sơ #{selectedProviderId}</h3>
                <button className="text-sm px-3 py-1 border rounded hover:bg-gray-50" onClick={closeProviderDetail}>Đóng</button>
              </div>
              {providerDetailLoading && (
                <div className="text-gray-500 text-sm">Đang tải chi tiết...</div>
              )}
              {providerDetailError && !providerDetailLoading && (
                <div className="text-red-600 text-sm">{providerDetailError}</div>
              )}
              {providerDetail && !providerDetailLoading && (
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Họ tên:</span> {providerDetail.fullName}</div>
                  <div><span className="text-gray-500">Email:</span> {providerDetail.email}</div>
                  <div><span className="text-gray-500">SĐT:</span> {providerDetail.phoneNumber}</div>
                  <div><span className="text-gray-500">Trạng thái:</span> {providerDetail.providerStatus}</div>
                  <div><span className="text-gray-500">Doanh nghiệp:</span> {providerDetail.businessName}</div>
                  <div><span className="text-gray-500">Địa chỉ:</span> {providerDetail.address}</div>
                  {providerDetail.address && (
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-1">Bản đồ</div>
                      <GoogleMapEmbed address={providerDetail.address} />
                      <div className="mt-1">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(providerDetail.address)}`} target="_blank" rel="noreferrer" className="text-indigo-600 underline text-xs">Mở trên Google Maps</a>
                      </div>
                    </div>
                  )}
                  <div><span className="text-gray-500">SĐT DN:</span> {providerDetail.businessPhoneNumber}</div>
                  <div>
                    <span className="text-gray-500">Giấy phép:</span>{' '}
                    {providerDetail.businessLicenseUrl ? (
                      <a href={providerDetail.businessLicenseUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Xem tài liệu</a>
                    ) : '—'}
                  </div>
                  <div><span className="text-gray-500">Chủ TK:</span> {providerDetail.bankAccountName}</div>
                  <div><span className="text-gray-500">Số TK:</span> {providerDetail.bankAccountNumber}</div>
                  <div><span className="text-gray-500">Ngân hàng:</span> {providerDetail.bankName}</div>
                  <div className="pt-3 flex flex-col gap-2">
                    <label className="text-xs text-gray-500" htmlFor="reject-reason">Lý do từ chối (nếu từ chối)</label>
                    <input id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Nhập lý do..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div className="pt-3 flex items-center gap-3">
                    <button disabled={actionLoading} onClick={() => approveProvider(selectedProviderId)} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:brightness-110 disabled:opacity-50">Phê duyệt</button>
                    <button disabled={actionLoading || !rejectReason.trim()} onClick={() => rejectProvider(selectedProviderId, rejectReason.trim())} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:brightness-110 disabled:opacity-50">Từ chối</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div id="activities" className="mt-6">
        <h2 className="text-base font-semibold mb-3">Hoạt động gần đây</h2>
        <div className="flex items-center justify-between mb-3 gap-3">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm mã/loại/chi tiết..."
            className="w-full md:w-80 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <div className="text-sm text-gray-500">{filtered.length} mục</div>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Mã</th>
                <th className="text-left px-4 py-2">Loại</th>
                <th className="text-left px-4 py-2">Chi tiết</th>
                <th className="text-left px-4 py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((a, idx) => (
                <tr key={a.id} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/40 transition`}>
                  <td className="px-4 py-2">{a.id}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-100">{a.type}</span>
                  </td>
                  <td className="px-4 py-2">{a.detail}</td>
                  <td className="px-4 py-2 text-gray-500">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div>Trang {pageSafe}/{totalPages}</div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
            >Trước</button>
            <button
              className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
            >Sau</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}



