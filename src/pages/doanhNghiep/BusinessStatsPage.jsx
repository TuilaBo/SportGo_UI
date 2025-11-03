  import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BusinessLayout from '../../components/layouts/BusinessLayout';
import { useAuth } from '../../contexts/AuthContext';

const BusinessStatsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const toApiDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const [y, m, d] = yyyyMmDd.split('-');
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${mm}/${dd}/${y}`;
  };
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const [fromDate, setFromDate] = useState(sevenDaysAgo.toISOString().slice(0,10));
  const [toDate, setToDate] = useState(today.toISOString().slice(0,10));
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [errorOverview, setErrorOverview] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(false);
  const [timeSeriesError, setTimeSeriesError] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [courtsOptions, setCourtsOptions] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [courtsError, setCourtsError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsSize, setBookingsSize] = useState(10);
  const [filterCourtId, setFilterCourtId] = useState('');
  const [tempCourtId, setTempCourtId] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [timeSeriesRequested, setTimeSeriesRequested] = useState(false);
  const [timeSeriesTrigger, setTimeSeriesTrigger] = useState(0);

  // Mock data for business statistics
  const statsData = {
    totalBookings: 1247,
    totalRevenue: 45600000,
    totalCourts: 12,
    totalFacilities: 3,
    monthlyBookings: [120, 135, 142, 158, 167, 189, 201, 215, 198, 187, 203, 218],
    monthlyRevenue: [3500000, 4200000, 4800000, 5500000, 6200000, 6800000, 7500000, 8200000, 7800000, 7100000, 7900000, 8500000],
    topCourts: [
      { name: 'Sân 01 - Chi nhánh Thủ Thiêm', bookings: 456, revenue: 12500000 },
      { name: 'Sân 02 - Chi nhánh Thủ Thiêm', bookings: 389, revenue: 10800000 },
      { name: 'Sân 03 - Chi nhánh Quận 7', bookings: 234, revenue: 6800000 },
      { name: 'Sân 04 - Chi nhánh Quận 7', bookings: 198, revenue: 5800000 },
      { name: 'Sân 05 - Chi nhánh Quận 2', bookings: 156, revenue: 4500000 }
    ],
    bookingTimes: [
      { time: '06:00-08:00', bookings: 45, percentage: 8 },
      { time: '08:00-10:00', bookings: 78, percentage: 14 },
      { time: '10:00-12:00', bookings: 89, percentage: 16 },
      { time: '12:00-14:00', bookings: 67, percentage: 12 },
      { time: '14:00-16:00', bookings: 98, percentage: 18 },
      { time: '16:00-18:00', bookings: 123, percentage: 22 },
      { time: '18:00-20:00', bookings: 89, percentage: 16 },
      { time: '20:00-22:00', bookings: 45, percentage: 8 }
    ],
    customerTypes: [
      { type: 'Khách hàng cá nhân', bookings: 789, percentage: 63 },
      { type: 'Khách hàng doanh nghiệp', bookings: 234, percentage: 19 },
      { type: 'Khách VIP', bookings: 156, percentage: 12 },
      { type: 'Khách thường xuyên', bookings: 68, percentage: 6 }
    ]
  };

  // Load facilities for selector
  useEffect(() => {
    const controller = new AbortController();
    const loadFacilities = async () => {
      try {
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        if (!accessToken) { setFacilities([]); return; }
        const res = await fetch('/api/provider/facilities?page=1&size=50', {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setFacilities(items);
        if (items.length > 0 && selectedFacilityIds.length === 0) {
          setSelectedFacilityIds([items[0].facilityId]);
        }
      } catch (_) {}
    };
    loadFacilities();
    return () => controller.abort();
  }, [user]);

  // Load provider overview stats (triggered manually)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        if (!hasSearched || !accessToken || selectedFacilityIds.length === 0) { setOverview(null); return; }
        setLoadingOverview(true);
        setErrorOverview(null);
        const params = new URLSearchParams({
          from: toApiDate(fromDate),
          to: toApiDate(toDate),
          facilityIds: selectedFacilityIds.join(',')
        });
        const res = await fetch(`/api/provider/dashboard/overview?${params.toString()}`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setOverview(data);
      } catch (e) {
        if (!cancelled) setErrorOverview(e.message || String(e));
      } finally {
        if (!cancelled) setLoadingOverview(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, searchTrigger, selectedFacilityIds.join(',')]);

  // Load courts for selected facility (suggestions for Court ID)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        const facilityId = selectedFacilityIds[0];
        if (!accessToken || !facilityId) { setCourtsOptions([]); return; }
        setCourtsLoading(true);
        setCourtsError(null);
        const res = await fetch(`/api/provider/facilities/${facilityId}/courts?page=1&size=50`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        if (!cancelled) setCourtsOptions(items);
      } catch (e) {
        if (!cancelled) setCourtsError(e.message || String(e));
      } finally {
        if (!cancelled) setCourtsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, selectedFacilityIds.join(',')]);

  // Load provider time-series for charts (triggered by section button)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        if (!timeSeriesRequested || !accessToken || selectedFacilityIds.length === 0) { setTimeSeries([]); return; }
        setTimeSeriesLoading(true);
        setTimeSeriesError(null);
        const params = new URLSearchParams({
          from: toApiDate(fromDate),
          to: toApiDate(toDate),
          granularity: 'day',
          facilityIds: selectedFacilityIds.join(',')
        });
        const res = await fetch(`/api/provider/dashboard/time-series?${params.toString()}`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setTimeSeries(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setTimeSeriesError(e.message || String(e));
      } finally {
        if (!cancelled) setTimeSeriesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, timeSeriesTrigger, selectedFacilityIds.join(',')]);

  // Load payment breakdown by booking status (triggered manually)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        if (!hasSearched || !accessToken || selectedFacilityIds.length === 0) { setPaymentBreakdown([]); return; }
        setPaymentLoading(true);
        setPaymentError(null);
        const params = new URLSearchParams({
          from: toApiDate(fromDate),
          to: toApiDate(toDate),
          facilityIds: selectedFacilityIds.join(',')
        });
        const res = await fetch(`/api/provider/dashboard/payment-breakdown?${params.toString()}`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setPaymentBreakdown(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setPaymentError(e.message || String(e));
      } finally {
        if (!cancelled) setPaymentLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, searchTrigger, selectedFacilityIds.join(',')]);

  // Load provider bookings list (triggered manually + pagination/filters)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
        const facilityId = selectedFacilityIds[0];
        if (!hasSearched || !accessToken || !facilityId) { setBookings([]); return; }
        setBookingsLoading(true);
        setBookingsError(null);
        const params = new URLSearchParams({
          from: toApiDate(fromDate),
          to: toApiDate(toDate),
          facilityId: String(facilityId),
          page: String(bookingsPage),
          size: String(bookingsSize)
        });
        if (filterCourtId && Number(filterCourtId) > 0) params.append('courtId', String(Number(filterCourtId)));
        const res = await fetch(`/api/provider/dashboard/bookings?${params.toString()}`, {
          headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setBookings(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setBookingsError(e.message || String(e));
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, searchTrigger, selectedFacilityIds.join(','), bookingsPage, bookingsSize, filterCourtId]);

  const StatCard = ({ title, value, icon, color, trend, trendValue, suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}{suffix}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">{trend === 'up' ? '↗' : '↘'}</span>
              <span>{trendValue}% so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const LineChart = ({ data, title, color = 'blue', suffix = '', labels }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {data.map((value, index) => {
            const height = ((value - minValue) / (maxValue - minValue)) * 200;
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: height }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`bg-gradient-to-t from-${color}-500 to-${color}-400 rounded-t-lg flex-1 min-h-[4px] relative group`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}{suffix}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          {(labels && labels.length ? labels : ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']).map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    );
  };

  const BarChart = ({ data, title, valueKey, labelKey }) => {
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item[valueKey] / maxValue) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item[labelKey]}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {typeof item[valueKey] === 'number' ? item[valueKey].toLocaleString('vi-VN') : item[valueKey]}
                    {valueKey === 'revenue' ? ' VNĐ' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const PieChart = ({ data, title, valueKey, labelKey }) => {
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    let cumulativePercentage = 0;
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              {data.map((item, index) => {
                const percentage = (item[valueKey] / total) * 100;
                const circumference = 2 * Math.PI * 100;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                
                const element = (
                  <circle
                    key={index}
                    cx="128"
                    cy="128"
                    r="100"
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-cumulativePercentage * circumference / 100}
                    className="transition-all duration-1000"
                  />
                );
                
                cumulativePercentage += percentage;
                return element;
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{total.toLocaleString('vi-VN')}</div>
                <div className="text-sm text-gray-600">Tổng {valueKey === 'bookings' ? 'lượt đặt' : 'doanh thu'}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3" 
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span className="text-sm text-gray-700">{item[labelKey]}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {typeof item[valueKey] === 'number' ? item[valueKey].toLocaleString('vi-VN') : item[valueKey]}
                  {valueKey === 'revenue' ? ' VNĐ' : ''}
                </div>
                <div className="text-xs text-gray-500">{Math.round((item[valueKey] / total) * 100)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-lg text-gray-600">Đang tải thống kê...</p>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thống Kê Doanh Nghiệp</h1>
                <p className="text-gray-600 mt-1">Bảng điều khiển quản lý doanh nghiệp</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Tổng Quan
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'analytics' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Phân Tích Chi Tiết
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Từ</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border rounded px-2 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Đến</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border rounded px-2 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Chi nhánh</label>
                  <select
                    value={String(selectedFacilityIds[0] || '')}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedFacilityIds(isNaN(id) ? [] : [id]);
                    }}
                    className="w-full border rounded px-2 py-2 text-sm"
                  >
                    {facilities.map(f => (
                      <option key={f.facilityId} value={f.facilityId}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    className="w-full h-[38px] mt-[22px] rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => { setHasSearched(true); setSearchTrigger((v) => v + 1); setBookingsPage(1); setTimeSeriesRequested(false); setTimeSeries([]); }}
                    disabled={!fromDate || !toDate || selectedFacilityIds.length === 0}
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {!hasSearched && (
                <div className="mt-3 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                  Nhập khoảng thời gian và chi nhánh, sau đó bấm "Tìm kiếm" để tải dữ liệu.
                </div>
              )}

              {hasSearched && errorOverview && (
                <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  Lỗi tải tổng quan: {errorOverview}
                </div>
              )}
              {hasSearched && !loadingOverview && !errorOverview && !overview && (
                <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                  Không có dữ liệu cho bộ lọc đã chọn.
                </div>
              )}

              {/* Stats Cards from API (only after search) */}
              {hasSearched ? (
                loadingOverview ? (
                  <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-600">Đang tải tổng quan...</div>
                ) : overview ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Tổng Lượt Đặt Sân" value={overview.totalBookings} icon="⚽" color="bg-blue-100 text-blue-600" />
                    <StatCard title="Tổng Doanh Thu" value={overview.totalRevenue} icon="💰" color="bg-green-100 text-green-600" suffix=" VNĐ" />
                    <StatCard title="Tỉ lệ thành công (%)" value={Number(overview.successRate || 0)} icon="📈" color="bg-indigo-100 text-indigo-600" />
                    <StatCard title="Đã hủy" value={overview.canceledBookings} icon="🛑" color="bg-rose-100 text-rose-600" />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-700">Không có dữ liệu</div>
                )
              ) : (
                <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-700">Không có dữ liệu</div>
              )}

              {/* Charts from API time-series */}
              {timeSeriesRequested ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LineChart
                    data={timeSeries.map(r => Number(r.bookingCount || 0))}
                    title="Lượt đặt theo ngày"
                    color="blue"
                    labels={timeSeries.map(r => {
                      const d = new Date(r.date);
                      return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
                    })}
                  />
                  <LineChart
                    data={timeSeries.map(r => Number(r.revenue || 0))}
                    title="Doanh thu theo ngày"
                    color="green"
                    suffix=" VNĐ"
                    labels={timeSeries.map(r => {
                      const d = new Date(r.date);
                      return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
                    })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-sm text-gray-600">Bấm "Tải chi tiết" ở bên dưới để hiển thị biểu đồ.</div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-sm text-gray-600">Bấm "Tải chi tiết" ở bên dưới để hiển thị biểu đồ.</div>
                </div>
              )}

              {/* Time-series details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Chi tiết chuỗi thời gian</h3>
                  <div className="flex items-center gap-3">
                    {timeSeriesLoading && <span className="text-sm text-gray-500">Đang tải...</span>}
                    <button
                      className="px-3 h-9 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => { setTimeSeriesRequested(true); setTimeSeriesTrigger((v) => v + 1); }}
                      disabled={!fromDate || !toDate || selectedFacilityIds.length === 0 || timeSeriesLoading}
                      title={!fromDate || !toDate || selectedFacilityIds.length === 0 ? 'Chọn ngày và chi nhánh trước' : ''}
                    >
                      Tải chi tiết
                    </button>
                  </div>
                </div>
                {!timeSeriesRequested && (
                  <div className="mb-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                    Bấm "Tải chi tiết" để tải chuỗi thời gian theo bộ lọc hiện tại.
                  </div>
                )}
                {timeSeriesError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{timeSeriesError}</div>
                )}
                {timeSeriesRequested && !timeSeriesLoading && !timeSeriesError && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="py-2 pr-4">Ngày</th>
                          <th className="py-2 pr-4">Lượt đặt</th>
                          <th className="py-2 pr-4">Hủy</th>
                          <th className="py-2 pr-4">Doanh thu</th>
                          <th className="py-2 pr-4">Cọc</th>
                          <th className="py-2 pr-4">Thanh toán cuối</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeSeries.length === 0 && (
                          <tr><td colSpan={6} className="py-6 text-center text-gray-500">Không có dữ liệu</td></tr>
                        )}
                        {timeSeries.map((row, idx) => {
                          const d = new Date(row.date);
                          const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
                          return (
                            <tr key={idx} className="border-b last:border-0">
                              <td className="py-2 pr-4">{label}</td>
                              <td className="py-2 pr-4">{Number(row.bookingCount || 0).toLocaleString('vi-VN')}</td>
                              <td className="py-2 pr-4">{Number(row.canceledCount || 0).toLocaleString('vi-VN')}</td>
                              <td className="py-2 pr-4">{Number(row.revenue || 0).toLocaleString('vi-VN')}</td>
                              <td className="py-2 pr-4">{Number(row.depositRevenue || 0).toLocaleString('vi-VN')}</td>
                              <td className="py-2 pr-4">{Number(row.finalRevenue || 0).toLocaleString('vi-VN')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top Courts from API */}
              {overview && overview.topCourts && overview.topCourts.length > 0 && (
                <BarChart
                  data={overview.topCourts.map(c => ({ name: c.courtName, bookings: c.bookings }))}
                  title="Top Sân Có Nhiều Lượt Đặt Nhất"
                  valueKey="bookings"
                  labelKey="name"
                />
              )}

              {/* Bookings List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-gray-900">Bảng trạng thái thanh toán theo sân</h3>
                  <p className="text-sm text-gray-600">Hiển thị các lượt đặt và trạng thái thanh toán theo chi nhánh, có thể lọc theo sân cụ thể</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                  <div className="flex items-end gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">ID sân (courtId)</label>
                      <input
                        type="number"
                        value={tempCourtId}
                        onChange={(e) => setTempCourtId(e.target.value)}
                        className="w-32 border rounded px-2 py-2 text-sm"
                        placeholder="Nhập ID (vd: 1)"
                      />
                      <div className="text-[11px] text-gray-500 mt-1">Hoặc chọn từ gợi ý bên cạnh</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Gợi ý sân</label>
                      <select
                        className="min-w-[220px] border rounded px-2 py-2 text-sm"
                        value={''}
                        onChange={(e) => setTempCourtId(e.target.value)}
                        disabled={courtsLoading}
                        title={courtsError || ''}
                      >
                        <option value="" disabled>{courtsLoading ? 'Đang tải...' : 'Chọn sân để điền ID'}</option>
                        {courtsOptions.map(c => (
                          <option key={c.courtId} value={c.courtId}>{c.name} — ID {c.courtId}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="h-9 px-3 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                      onClick={() => { setFilterCourtId(tempCourtId); setBookingsPage(1); }}
                    >
                      Lọc
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <label>Trang</label>
                    <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={bookingsPage === 1 || bookingsLoading} onClick={() => setBookingsPage((p) => Math.max(1, p - 1))}>Trước</button>
                    <span className="px-2">{bookingsPage}</span>
                    <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={bookingsLoading || bookings.length < bookingsSize} onClick={() => setBookingsPage((p) => p + 1)}>Sau</button>
                    <select className="ml-2 border rounded px-2 py-1" value={bookingsSize} onChange={(e) => { setBookingsSize(Number(e.target.value)); setBookingsPage(1); }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                {/* Context pill: payment status by court */}
                <div className="mb-4">
                  {filterCourtId ? (
                    <div className="inline-flex items-center gap-3 text-base px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <span className="font-semibold">Theo sân:</span>
                      <span className="font-semibold">
                        {(courtsOptions.find(c => String(c.courtId) === String(filterCourtId))?.name) || 'ID'}
                      </span>
                      <span className="text-blue-500">• ID {filterCourtId}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 text-base px-4 py-2 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                      <span className="font-semibold">Theo chi nhánh</span>
                      <span className="text-gray-500">(tất cả sân)</span>
                    </div>
                  )}
                </div>
                {bookingsLoading && <div className="text-gray-500">Đang tải danh sách đặt sân...</div>}
                {bookingsError && !bookingsLoading && <div className="text-red-600">{bookingsError}</div>}
                {!bookingsLoading && !bookingsError && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="py-2 pr-4">Mã</th>
                          <th className="py-2 pr-4">Chi nhánh</th>
                          <th className="py-2 pr-4">Sân</th>
                          <th className="py-2 pr-4">Thời gian</th>
                          <th className="py-2 pr-4">Trạng thái</th>
                          <th className="py-2 pr-4">Tổng tiền</th>
                          <th className="py-2 pr-4">Cọc</th>
                          <th className="py-2 pr-4">Đã cọc</th>
                          <th className="py-2 pr-4">Thanh toán đủ</th>
                          <th className="py-2 pr-4">Phương thức</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 && (
                          <tr><td colSpan={10} className="py-6 text-center text-gray-500">Không có dữ liệu</td></tr>
                        )}
                        {bookings.map((b) => (
                          <tr key={b.bookingId} className="border-b last:border-0">
                            <td className="py-2 pr-4">{b.bookingId}</td>
                            <td className="py-2 pr-4">{b.facilityName}</td>
                            <td className="py-2 pr-4">{b.courtName}</td>
                            <td className="py-2 pr-4">{new Date(b.startAt).toLocaleString('vi-VN')} - {new Date(b.endAt).toLocaleTimeString('vi-VN')}</td>
                            <td className="py-2 pr-4">{b.bookingStatus}</td>
                            <td className="py-2 pr-4">{(b.totalAmount || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{(b.depositAmount || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{b.depositPaid ? '✅' : '❌'}</td>
                            <td className="py-2 pr-4">{b.finalPaid ? '✅' : '❌'}</td>
                            <td className="py-2 pr-4">{b.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Bookings by Courts (from overview) */}
              {overview && overview.topCourts && overview.topCourts.length > 0 && (
                <BarChart
                  data={overview.topCourts.map(c => ({ name: c.courtName, bookings: c.bookings }))}
                  title="Lượt đặt theo sân"
                  valueKey="bookings"
                  labelKey="name"
                />
              )}

              {/* Charts Row using provider time-series (only after requested) */}
              {timeSeriesRequested ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PieChart
                    data={[
                      { name: 'Doanh thu cọc', revenue: timeSeries.reduce((s, r) => s + Number(r.depositRevenue || 0), 0) },
                      { name: 'Doanh thu cuối', revenue: timeSeries.reduce((s, r) => s + Number(r.finalRevenue || 0), 0) }
                    ]}
                    title="Cơ cấu doanh thu (cọc vs cuối)"
                    valueKey="revenue"
                    labelKey="name"
                  />

                  <PieChart
                    data={[
                      { name: 'Đặt thành công', count: timeSeries.reduce((s, r) => s + Number(r.bookingCount || 0), 0) },
                      { name: 'Đã hủy', count: timeSeries.reduce((s, r) => s + Number(r.canceledCount || 0), 0) }
                    ]}
                    title="Kết quả đặt sân"
                    valueKey="count"
                    labelKey="name"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-sm text-gray-600">Bấm "Tải chi tiết" ở tab Tổng Quan để hiển thị biểu đồ.</div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-sm text-gray-600">Bấm "Tải chi tiết" ở tab Tổng Quan để hiển thị biểu đồ.</div>
                </div>
              )}

              {/* Top Courts Detailed List (from overview) */}
              {overview && overview.topCourts && overview.topCourts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top sân theo lượt đặt</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="py-2 pr-4">#</th>
                          <th className="py-2 pr-4">Sân</th>
                          <th className="py-2 pr-4">Lượt đặt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.topCourts.map((c, idx) => (
                          <tr key={c.courtId} className="border-b last:border-0">
                            <td className="py-2 pr-4">{idx + 1}</td>
                            <td className="py-2 pr-4">{c.courtName}</td>
                            <td className="py-2 pr-4">{(c.bookings || 0).toLocaleString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Breakdown */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Trạng thái thanh toán</h3>
                  <span className="text-sm text-gray-500">{fromDate} → {toDate}</span>
                </div>
                <div className="mb-4">
                  {filterCourtId ? (
                    <div className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <span>Theo sân:</span>
                      <span className="font-medium">
                        {(courtsOptions.find(c => String(c.courtId) === String(filterCourtId))?.name) || 'ID'}
                      </span>
                      <span className="text-blue-500">(ID {filterCourtId})</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                      <span>Theo chi nhánh (tất cả sân)</span>
                    </div>
                  )}
                </div>
                {paymentLoading && <div className="text-gray-500">Đang tải...</div>}
                {paymentError && !paymentLoading && <div className="text-red-600">{paymentError}</div>}
                {!paymentLoading && !paymentError && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="py-2 pr-4">Trạng thái</th>
                          <th className="py-2 pr-4">Số lượt</th>
                          <th className="py-2 pr-4">Tổng tiền</th>
                          <th className="py-2 pr-4">Cọc đã thu</th>
                          <th className="py-2 pr-4">Còn lại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentBreakdown.length === 0 && (
                          <tr><td colSpan={5} className="py-6 text-center text-gray-500">Không có dữ liệu</td></tr>
                        )}
                        {paymentBreakdown.map((p) => (
                          <tr key={p.bookingStatus} className="border-b last:border-0">
                            <td className="py-2 pr-4">{p.bookingStatus}</td>
                            <td className="py-2 pr-4">{Number(p.count || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{Number(p.totalAmount || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{Number(p.depositCollected || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{Number(p.remainingAmount || 0).toLocaleString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Heatmap by day/hour */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                  <div className="flex items-end gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">ID sân (courtId)</label>
                      <input
                        type="number"
                        value={tempCourtId}
                        onChange={(e) => setTempCourtId(e.target.value)}
                        className="w-32 border rounded px-2 py-2 text-sm"
                        placeholder="Nhập ID (vd: 1)"
                      />
                      <div className="text-[11px] text-gray-500 mt-1">Hoặc chọn từ gợi ý bên cạnh</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Gợi ý sân</label>
                      <select
                        className="min-w-[220px] border rounded px-2 py-2 text-sm"
                        value={''}
                        onChange={(e) => setTempCourtId(e.target.value)}
                        disabled={courtsLoading}
                        title={courtsError || ''}
                      >
                        <option value="" disabled>{courtsLoading ? 'Đang tải...' : 'Chọn sân để điền ID'}</option>
                        {courtsOptions.map(c => (
                          <option key={c.courtId} value={c.courtId}>{c.name} — ID {c.courtId}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="h-9 px-3 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          const accessToken = (user && user.accessToken) || localStorage.getItem('accessToken');
                          const facilityId = selectedFacilityIds[0];
                          if (!accessToken || !facilityId || !tempCourtId) { setHeatmap([]); return; }
                          setHeatmapLoading(true);
                          setHeatmapError(null);
                          const params = new URLSearchParams({
                            from: toApiDate(fromDate),
                            to: toApiDate(toDate),
                            facilityId: String(facilityId),
                            courtId: String(Number(tempCourtId))
                          });
                          const res = await fetch(`/api/provider/dashboard/heatmap?${params.toString()}`, {
                            headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}` }
                          });
                          if (!res.ok) throw new Error(`HTTP ${res.status}`);
                          const data = await res.json();
                          setHeatmap(Array.isArray(data) ? data : []);
                        } catch (e) {
                          setHeatmapError(e.message || String(e));
                          setHeatmap([]);
                        } finally {
                          setHeatmapLoading(false);
                        }
                      }}
                    >
                      Tải heatmap
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">Khoảng: {fromDate} → {toDate}</div>
                </div>

                {heatmapLoading && <div className="text-gray-500">Đang tải heatmap...</div>}
                {heatmapError && !heatmapLoading && <div className="text-red-600">{heatmapError}</div>}
                {!heatmapLoading && !heatmapError && heatmap.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-2">Giờ
                          </th>
                          {['CN','T2','T3','T4','T5','T6','T7'].map((d) => (
                            <th key={d} className="py-2 px-2 text-center">{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const row = [0,1,2,3,4,5,6].map((dow) => heatmap.find((x) => x.dayOfWeek === dow && x.hour === hour));
                          return (
                            <tr key={hour}>
                              <td className="py-1 pr-2 text-gray-600 whitespace-nowrap">{String(hour).padStart(2,'0')}:00</td>
                              {row.map((cell, idx) => {
                                const intensity = Math.min(1, Math.max(0, Number(cell?.intensity || 0)));
                                const bg = `rgba(16,185,129,${0.12 + intensity * 0.6})`;
                                return (
                                  <td key={idx} className="px-1 py-1">
                                    <div className="h-6 w-10 rounded" style={{ backgroundColor: bg }} title={`${cell?.bookingCount || 0} lượt | ${cell?.revenue?.toLocaleString('vi-VN') || 0} VNĐ`}></div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {!heatmapLoading && !heatmapError && heatmap.length === 0 && (
                  <div className="text-gray-500 text-sm">Nhập Court ID và bấm "Tải heatmap" để xem mật độ theo giờ.</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessStatsPage;



