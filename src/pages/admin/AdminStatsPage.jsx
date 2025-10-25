import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';

const AdminStatsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for statistics
  const statsData = {
    totalUsers: 1247,
    totalBusinesses: 89,
    totalPackagesSold: 456,
    totalBookings: 2341,
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
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const LineChart = ({ data, title, color = 'blue' }) => {
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
          {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((month, index) => (
            <span key={index}>{month}</span>
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
              <div className="flex space-x-2">
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
                value={statsData.totalUsers}
                icon="👥"
                color="bg-blue-100 text-blue-600"
                trend="up"
                trendValue="12.5"
              />
              <StatCard
                title="Doanh Nghiệp Đăng Ký"
                value={statsData.totalBusinesses}
                icon="🏢"
                color="bg-green-100 text-green-600"
                trend="up"
                trendValue="8.3"
              />
              <StatCard
                title="Gói Đã Bán"
                value={statsData.totalPackagesSold}
                icon="📦"
                color="bg-yellow-100 text-yellow-600"
                trend="up"
                trendValue="15.7"
              />
              <StatCard
                title="Lượt Đặt Sân"
                value={statsData.totalBookings}
                icon="⚽"
                color="bg-purple-100 text-purple-600"
                trend="up"
                trendValue="22.1"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                data={statsData.monthlyUsers}
                title="Người Dùng Mới Theo Tháng"
                color="blue"
              />
              <LineChart
                data={statsData.monthlyBusinesses}
                title="Doanh Nghiệp Đăng Ký Theo Tháng"
                color="green"
              />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                data={statsData.monthlyPackages}
                title="Gói Được Bán Theo Tháng"
                color="yellow"
              />
              <LineChart
                data={statsData.monthlyBookings}
                title="Lượt Đặt Sân Theo Tháng"
                color="purple"
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
          </motion.div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStatsPage;
