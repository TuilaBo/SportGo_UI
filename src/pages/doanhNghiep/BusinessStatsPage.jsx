import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BusinessLayout from '../../components/layouts/BusinessLayout';

const BusinessStatsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const LineChart = ({ data, title, color = 'blue', suffix = '' }) => {
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
          {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((month, index) => (
            <span key={index}>{month}</span>
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
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Tổng Lượt Đặt Sân"
                  value={statsData.totalBookings}
                  icon="⚽"
                  color="bg-blue-100 text-blue-600"
                  trend="up"
                  trendValue="15.2"
                />
                <StatCard
                  title="Tổng Doanh Thu"
                  value={statsData.totalRevenue}
                  icon="💰"
                  color="bg-green-100 text-green-600"
                  trend="up"
                  trendValue="22.8"
                  suffix=" VNĐ"
                />
                <StatCard
                  title="Số Sân Hoạt Động"
                  value={statsData.totalCourts}
                  icon="🏟️"
                  color="bg-yellow-100 text-yellow-600"
                  trend="up"
                  trendValue="8.3"
                />
                <StatCard
                  title="Số Chi Nhánh"
                  value={statsData.totalFacilities}
                  icon="🏢"
                  color="bg-purple-100 text-purple-600"
                  trend="up"
                  trendValue="12.5"
                />
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart
                  data={statsData.monthlyBookings}
                  title="Lượt Đặt Sân Theo Tháng"
                  color="blue"
                />
                <LineChart
                  data={statsData.monthlyRevenue}
                  title="Doanh Thu Theo Tháng"
                  color="green"
                  suffix=" VNĐ"
                />
              </div>

              {/* Top Courts */}
              <BarChart
                data={statsData.topCourts}
                title="Top Sân Có Nhiều Lượt Đặt Nhất"
                valueKey="bookings"
                labelKey="name"
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Revenue by Courts */}
              <BarChart
                data={statsData.topCourts}
                title="Doanh Thu Theo Sân"
                valueKey="revenue"
                labelKey="name"
              />

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart
                  data={statsData.bookingTimes}
                  title="Phân Bố Theo Giờ Đặt Sân"
                  valueKey="bookings"
                  labelKey="time"
                />
                
                <PieChart
                  data={statsData.customerTypes}
                  title="Phân Loại Khách Hàng"
                  valueKey="bookings"
                  labelKey="type"
                />
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Sân Có Doanh Thu Cao Nhất</h3>
                <div className="space-y-4">
                  {statsData.topCourts.map((court, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{court.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">{court.bookings.toLocaleString('vi-VN')} lượt</div>
                        <div className="text-sm text-green-600 font-bold">{court.revenue.toLocaleString('vi-VN')} VNĐ</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessStatsPage;

