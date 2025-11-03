import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const AdminStatsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [topProviders, setTopProviders] = useState([]);
  const [isTopProvidersLoading, setIsTopProvidersLoading] = useState(false);
  const [topProvidersError, setTopProvidersError] = useState(null);
  const [topProvidersLimit, setTopProvidersLimit] = useState(10);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [isRevenueLoading, setIsRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [isTimeSeriesLoading, setIsTimeSeriesLoading] = useState(false);
  const [timeSeriesError, setTimeSeriesError] = useState(null);
  const [topPackages, setTopPackages] = useState([]);
  const [isTopPackagesLoading, setIsTopPackagesLoading] = useState(false);
  const [topPackagesError, setTopPackagesError] = useState(null);
  const [topPackagesLimit, setTopPackagesLimit] = useState(5);
  const [systemHealth, setSystemHealth] = useState(null);
  const [isSystemHealthLoading, setIsSystemHealthLoading] = useState(false);
  const [systemHealthError, setSystemHealthError] = useState(null);

  const formatDate = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(today.getDate() - 5);
  const [fromDate, setFromDate] = useState(formatDate(fiveDaysAgo));
  const [toDate, setToDate] = useState(formatDate(today));
  const toApiDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return '';
    const [y, m, d] = yyyyMmDd.split('-');
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${mm}/${dd}/${y}`; // MM/DD/YYYY
  };

  // Local fallback series for charts (until backend provides series data)
  const statsData = {
    monthlyUsers: [120, 135, 142, 158, 167, 189, 201, 215, 198, 187, 203, 218],
    monthlyBusinesses: [8, 12, 15, 18, 22, 25, 28, 31, 29, 26, 30, 33],
    monthlyPackages: [35, 42, 48, 55, 62, 68, 75, 82, 78, 71, 79, 85],
    monthlyBookings: [180, 195, 210, 225, 240, 255, 270, 285, 275, 265, 280, 295],
    topSports: [
      { name: 'Bóng đá', bookings: 1247, percentage: 45 },
      { name: 'Tennis', bookings: 689, percentage: 25 },
      { name: 'Cầu lông', bookings: 456, percentage: 17 },
      { name: 'Bóng chuyền', bookings: 234, percentage: 8 },
      { name: 'Bóng rổ', bookings: 123, percentage: 5 }
    ],
    revenueData: [
      { month: 'Th1', revenue: 12500000 },
      { month: 'Th2', revenue: 15800000 },
      { month: 'Th3', revenue: 14200000 },
      { month: 'Th4', revenue: 18900000 },
      { month: 'Th5', revenue: 20100000 },
      { month: 'Th6', revenue: 23500000 },
      { month: 'Th7', revenue: 26800000 },
      { month: 'Th8', revenue: 28500000 },
      { month: 'Th9', revenue: 27500000 },
      { month: 'Th10', revenue: 26500000 },
      { month: 'Th11', revenue: 28000000 },
      { month: 'Th12', revenue: 29500000 }
    ]
  };

  useEffect(() => {
    let isCancelled = false;
    const loadOverview = async () => {
      if (!user || !user.accessToken) {
        setOverview(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const url = `/api/admin/dashboard/overview?from=${fromDate}&to=${toDate}`;
        const res = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        if (!res.ok) {
          throw new Error(`Failed to load overview (${res.status})`);
        }
        const data = await res.json();
        if (!isCancelled) {
          setOverview(data);
        }
      } catch (e) {
        if (!isCancelled) {
          setError(e.message || 'Load overview failed');
          setOverview(null);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    loadOverview();
    return () => { isCancelled = true; };
  }, [user?.accessToken, fromDate, toDate]);

  // Load Top Providers
  useEffect(() => {
    let isCancelled = false;
    const loadTopProviders = async () => {
      if (!user || !user.accessToken) {
        setTopProviders([]);
        return;
      }
      setIsTopProvidersLoading(true);
      setTopProvidersError(null);
      try {
        const url = `/api/admin/dashboard/top-providers?from=${encodeURIComponent(toApiDate(fromDate))}&to=${encodeURIComponent(toApiDate(toDate))}&top=${encodeURIComponent(String(topProvidersLimit))}`;
        const res = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        if (!res.ok) throw new Error(`Failed to load top providers (${res.status})`);
        const data = await res.json();
        if (!isCancelled) setTopProviders(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!isCancelled) setTopProvidersError(e.message || 'Load top providers failed');
      } finally {
        if (!isCancelled) setIsTopProvidersLoading(false);
      }
    };
    loadTopProviders();
    return () => { isCancelled = true; };
  }, [user?.accessToken, fromDate, toDate, topProvidersLimit]);

  // Load Revenue Breakdown
  useEffect(() => {
    let isCancelled = false;
    const loadRevenue = async () => {
      if (!user || !user.accessToken) {
        setRevenueBreakdown([]);
        return;
      }
      setIsRevenueLoading(true);
      setRevenueError(null);
      try {
        const url = `/api/admin/dashboard/revenue-breakdown?from=${encodeURIComponent(toApiDate(fromDate))}&to=${encodeURIComponent(toApiDate(toDate))}`;
        const res = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        if (!res.ok) throw new Error(`Failed to load revenue breakdown (${res.status})`);
        const data = await res.json();
        if (!isCancelled) setRevenueBreakdown(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!isCancelled) setRevenueError(e.message || 'Load revenue breakdown failed');
      } finally {
        if (!isCancelled) setIsRevenueLoading(false);
      }
    };
    loadRevenue();
    return () => { isCancelled = true; };
  }, [user?.accessToken, fromDate, toDate]);

  // Load Time Series (daily)
  useEffect(() => {
    let isCancelled = false;
    const loadTimeSeries = async () => {
      if (!user || !user.accessToken) {
        setTimeSeries([]);
        return;
      }
      setIsTimeSeriesLoading(true);
      setTimeSeriesError(null);
      try {
        const url = `/api/admin/dashboard/time-series?from=${encodeURIComponent(toApiDate(fromDate))}&to=${encodeURIComponent(toApiDate(toDate))}&granularity=day`;
        const res = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        if (!res.ok) throw new Error(`Failed to load time series (${res.status})`);
        const data = await res.json();
        if (!isCancelled) setTimeSeries(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!isCancelled) setTimeSeriesError(e.message || 'Load time series failed');
      } finally {
        if (!isCancelled) setIsTimeSeriesLoading(false);
      }
    };
    loadTimeSeries();
    return () => { isCancelled = true; };
  }, [user?.accessToken, fromDate, toDate]);

  // Load Top Packages
  useEffect(() => {
    let isCancelled = false;
    const loadTopPackages = async () => {
      if (!user || !user.accessToken) {
        setTopPackages([]);
        return;
      }
      setIsTopPackagesLoading(true);
      setTopPackagesError(null);
      try {
        const url = `/api/admin/dashboard/top-packages?from=${encodeURIComponent(toApiDate(fromDate))}&to=${encodeURIComponent(toApiDate(toDate))}&top=${encodeURIComponent(String(topPackagesLimit))}`;
        const res = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        if (!res.ok) throw new Error(`Failed to load top packages (${res.status})`);
        const data = await res.json();
        if (!isCancelled) setTopPackages(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!isCancelled) setTopPackagesError(e.message || 'Load top packages failed');
      } finally {
        if (!isCancelled) setIsTopPackagesLoading(false);
      }
    };
    loadTopPackages();
    return () => { isCancelled = true; };
  }, [user?.accessToken, fromDate, toDate, topPackagesLimit]);

  // Load System Health
  useEffect(() => {
    let isCancelled = false;
    const loadSystemHealth = async () => {
      if (!user || !user.accessToken) {
        setSystemHealth(null);
        return;
      }
      setIsSystemHealthLoading(true);
      setSystemHealthError(null);
      try {
        const res = await fetch('/api/admin/dashboard/system-health', {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        if (!res.ok) throw new Error(`Failed to load system health (${res.status})`);
        const data = await res.json();
        if (!isCancelled) setSystemHealth(data);
      } catch (e) {
        if (!isCancelled) setSystemHealthError(e.message || 'Load system health failed');
      } finally {
        if (!isCancelled) setIsSystemHealthLoading(false);
      }
    };
    loadSystemHealth();
    return () => { isCancelled = true; };
  }, [user?.accessToken]);

  // no-op: loading handled by fetch above

  const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('vi-VN')}</p>
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

  const LineChart = ({ data, title, color = 'blue', labels }) => {
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
                  {value.toLocaleString('vi-VN')}
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

  const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.bookings, 0);
    let cumulativePercentage = 0;
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              {data.map((item, index) => {
                const percentage = (item.bookings / total) * 100;
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
                <div className="text-sm text-gray-600">Tổng lượt đặt</div>
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
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{item.bookings.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RevenueChart = ({ data, title }) => {
    const maxRevenue = Math.max(...data.map(item => item.revenue));
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 flex items-end justify-between space-x-1">
          {data.map((item, index) => {
            const height = (item.revenue / maxRevenue) * 200;
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: height }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg flex-1 min-h-[4px] relative group"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {(item.revenue / 1000000).toFixed(1)}M VNĐ
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index}>{item.month}</span>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              {error}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thống Kê Hệ Thống</h1>
                <p className="text-gray-600 mt-1">Bảng điều khiển quản trị viên</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 mr-4">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-500 text-sm">đến</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Tổng Quan
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'analytics' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Phân Tích
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Tổng Người Dùng"
                value={overview ? overview.totalUsers : 0}
                icon="👥"
                color="bg-blue-100 text-blue-600"
                trend="up"
                trendValue="12.5"
              />
              <StatCard
                title="Doanh Nghiệp Đăng Ký"
                value={overview ? overview.totalProviders : 0}
                icon="🏢"
                color="bg-green-100 text-green-600"
                trend="up"
                trendValue="8.3"
              />
              <StatCard
                title="Gói Đang Hoạt Động"
                value={overview ? overview.activePackages : 0}
                icon="📦"
                color="bg-yellow-100 text-yellow-600"
                trend="up"
                trendValue="15.7"
              />
              <StatCard
                title="Lượt Đặt Sân"
                value={overview ? overview.totalBookings : 0}
                icon="⚽"
                color="bg-purple-100 text-purple-600"
                trend="up"
                trendValue="22.1"
              />
            </div>

            {/* Secondary KPIs */}
            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Hoàn Thành"
                  value={overview.completedBookings}
                  icon="✅"
                  color="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                  title="Đã Hủy"
                  value={overview.canceledBookings}
                  icon="🛑"
                  color="bg-rose-100 text-rose-600"
                />
                <StatCard
                  title="Tỉ Lệ Thành Công (%)"
                  value={Number(overview.bookingSuccessRate || 0)}
                  icon="📈"
                  color="bg-indigo-100 text-indigo-600"
                />
                <StatCard
                  title="Doanh Thu (VNĐ)"
                  value={overview.totalRevenue}
                  icon="💰"
                  color="bg-amber-100 text-amber-600"
                />
              </div>
            )}

            {/* Charts Row 1 (from API time-series) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                data={(timeSeries || []).map(r => Number(r.newUsers || 0))}
                title="Người dùng mới theo ngày"
              color="blue"
              labels={(timeSeries || []).map(r => {
                const d = new Date(r.date);
                return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
              })}
              />
              <LineChart
                data={(timeSeries || []).map(r => Number(r.newProviders || 0))}
                title="Nhà cung cấp mới theo ngày"
              color="green"
              labels={(timeSeries || []).map(r => {
                const d = new Date(r.date);
                return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
              })}
              />
            </div>

            {/* Charts Row 2 (from API time-series) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                data={(timeSeries || []).map(r => Number(r.newBookings || 0))}
                title="Lượt đặt mới theo ngày"
              color="purple"
              labels={(timeSeries || []).map(r => {
                const d = new Date(r.date);
                return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
              })}
              />
              <LineChart
                data={(timeSeries || []).map(r => Number(r.revenue || 0))}
                title="Doanh thu theo ngày (VNĐ)"
              color="yellow"
              labels={(timeSeries || []).map(r => {
                const d = new Date(r.date);
                return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
              })}
              />
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
            {/* Revenue Chart */}
            <RevenueChart
              data={statsData.revenueData}
              title="Doanh Thu Theo Tháng (VNĐ)"
            />

            {/* Sports Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart
                data={statsData.topSports}
                title="Phân Bố Theo Môn Thể Thao"
              />
              
              {/* Top Performers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Môn Thể Thao</h3>
                <div className="space-y-4">
                  {statsData.topSports.map((sport, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{sport.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">{sport.bookings.toLocaleString('vi-VN')} lượt</div>
                        <div className="text-xs text-gray-500">{sport.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Series (Daily) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Chuỗi thời gian (ngày)</h3>
                <span className="text-sm text-gray-500">{fromDate} → {toDate}</span>
              </div>
              {isTimeSeriesLoading && (
                <div className="text-center py-6 text-gray-600">Đang tải...</div>
              )}
              {timeSeriesError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{timeSeriesError}</div>
              )}
              {!isTimeSeriesLoading && !timeSeriesError && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2 pr-4">Ngày</th>
                        <th className="py-2 pr-4">User mới</th>
                        <th className="py-2 pr-4">Provider mới</th>
                        <th className="py-2 pr-4">Đặt mới</th>
                        <th className="py-2 pr-4">Doanh thu (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeSeries.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500">Không có dữ liệu</td>
                        </tr>
                      )}
                      {timeSeries.map((row, idx) => {
                        const d = new Date(row.date);
                        const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                        return (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-medium text-gray-900">{label}</td>
                            <td className="py-2 pr-4">{(row.newUsers || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{(row.newProviders || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{(row.newBookings || 0).toLocaleString('vi-VN')}</td>
                            <td className="py-2 pr-4">{(row.revenue || 0).toLocaleString('vi-VN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Cơ Cấu Doanh Thu</h3>
                <span className="text-sm text-gray-500">{fromDate} → {toDate}</span>
              </div>
              {isRevenueLoading && (
                <div className="text-center py-6 text-gray-600">Đang tải...</div>
              )}
              {revenueError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{revenueError}</div>
              )}
              {!isRevenueLoading && !revenueError && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2 pr-4">Loại</th>
                        <th className="py-2 pr-4">Giao dịch</th>
                        <th className="py-2 pr-4">Tỉ lệ (%)</th>
                        <th className="py-2 pr-4">Số tiền (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueBreakdown.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-gray-500">Không có dữ liệu</td>
                        </tr>
                      )}
                      {revenueBreakdown.map((r) => (
                        <tr key={r.revenueType} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium text-gray-900">{r.revenueType}</td>
                          <td className="py-2 pr-4">{(r.transactionCount || 0).toLocaleString('vi-VN')}</td>
                          <td className="py-2 pr-4">{Number(r.percentage || 0).toFixed(2)}</td>
                          <td className="py-2 pr-4">{(r.amount || 0).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Packages */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Gói Dịch Vụ Bán Ra</h3>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600">Top</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={topPackagesLimit}
                    onChange={(e) => setTopPackagesLimit(Number(e.target.value) || 1)}
                    className="w-20 border rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-gray-500">{fromDate} → {toDate}</span>
                </div>
              </div>
              {isTopPackagesLoading && (
                <div className="text-center py-6 text-gray-600">Đang tải...</div>
              )}
              {topPackagesError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{topPackagesError}</div>
              )}
              {!isTopPackagesLoading && !topPackagesError && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">Tên gói</th>
                        <th className="py-2 pr-4">Lượt mua</th>
                        <th className="py-2 pr-4">Doanh thu (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPackages.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-gray-500">Không có dữ liệu</td>
                        </tr>
                      )}
                      {topPackages.map((pkg, idx) => (
                        <tr key={pkg.packageId} className="border-b last:border-0">
                          <td className="py-2 pr-4">{idx + 1}</td>
                          <td className="py-2 pr-4 font-medium text-gray-900">{pkg.packageName}</td>
                          <td className="py-2 pr-4">{(pkg.purchaseCount || 0).toLocaleString('vi-VN')}</td>
                          <td className="py-2 pr-4">{(pkg.totalRevenue || 0).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sức khỏe hệ thống</h3>
              </div>
              {isSystemHealthLoading && (
                <div className="text-center py-6 text-gray-600">Đang tải...</div>
              )}
              {systemHealthError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{systemHealthError}</div>
              )}
              {!isSystemHealthLoading && !systemHealthError && systemHealth && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Tỉ lệ đặt thành công (%)"
                    value={Number(systemHealth.bookingSuccessRate || 0)}
                    color="bg-emerald-100 text-emerald-600"
                  />
                  <StatCard
                    title="Duyệt nhà cung cấp (%)"
                    value={Number(systemHealth.providerApprovalRate || 0)}
                    color="bg-indigo-100 text-indigo-600"
                  />
                    <StatCard
                      title="Giá trị đặt trung bình (VNĐ)"
                      value={Number(systemHealth.averageBookingValue || 0)}
                      color="bg-amber-100 text-amber-600"
                    />
                  <StatCard
                    title="Tỉ lệ sử dụng slot (%)"
                    value={Number(systemHealth.slotUtilizationRate || 0)}
                    color="bg-fuchsia-100 text-fuchsia-600"
                  />
                  <StatCard
                    title="Người dùng hoạt động"
                    value={Number(systemHealth.activeUsers || 0)}
                    color="bg-blue-100 text-blue-600"
                  />
                  <StatCard
                    title="Nhà cung cấp hoạt động"
                    value={Number(systemHealth.activeProviders || 0)}
                    color="bg-teal-100 text-teal-600"
                  />
                </div>
              )}
            </div>

            {/* Top Providers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Nhà Cung Cấp</h3>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600">Top</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={topProvidersLimit}
                    onChange={(e) => setTopProvidersLimit(Number(e.target.value) || 1)}
                    className="w-20 border rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-gray-500">{fromDate} → {toDate}</span>
                </div>
              </div>
              {isTopProvidersLoading && (
                <div className="text-center py-6 text-gray-600">Đang tải...</div>
              )}
              {topProvidersError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{topProvidersError}</div>
              )}
              {!isTopProvidersLoading && !topProvidersError && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">Nhà cung cấp</th>
                        <th className="py-2 pr-4">Doanh nghiệp</th>
                        <th className="py-2 pr-4">Cơ sở</th>
                        <th className="py-2 pr-4">Lượt đặt</th>
                        <th className="py-2 pr-4">Doanh thu (VNĐ)</th>
                        <th className="py-2 pr-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProviders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-gray-500">Không có dữ liệu</td>
                        </tr>
                      )}
                      {topProviders.map((p, idx) => (
                        <tr key={p.providerId} className="border-b last:border-0">
                          <td className="py-2 pr-4">{idx + 1}</td>
                          <td className="py-2 pr-4 font-medium text-gray-900">{p.providerName}</td>
                          <td className="py-2 pr-4">{p.businessName}</td>
                          <td className="py-2 pr-4">{p.facilityCount}</td>
                          <td className="py-2 pr-4">{(p.totalBookings || 0).toLocaleString('vi-VN')}</td>
                          <td className="py-2 pr-4">{(p.totalRevenue || 0).toLocaleString('vi-VN')}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStatsPage;
