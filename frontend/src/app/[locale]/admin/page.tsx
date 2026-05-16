'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, Package, Users, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { GradientText } from '@/components/ui/gradient-text';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

type MetricType = 'revenue' | 'orders' | 'customers';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<MetricType>('revenue');
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [metricsRes, chartRes,recentOrderRes] = await Promise.all([
          apiClient.getDashboardMetrics(),
          apiClient.getOrderStats(30),
          apiClient.getRecentOrders()
        ]);
        setDashboardData(metricsRes.data);
        setRecentOrders(recentOrderRes.data);
        
        const formattedChart = chartRes.data.map((item: any) => ({
          name: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          revenue: item.revenue,
          orders: item.orders,
          customers: item.customers
        }));
        setChartData(formattedChart);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const metrics = [
    { id: 'revenue', label: 'Revenue', color: '#d4af37', icon: DollarSign, prefix: '$' },
    { id: 'orders', label: 'Orders', color: '#ffffff', icon: ShoppingCart, prefix: '' },
    { id: 'customers', label: 'New Customers', color: '#60a5fa', icon: Users, prefix: '' },
  ];

  const stats = [
    { 
      label: 'Total Orders', 
      value: dashboardData?.totalOrders?.toLocaleString() || '0', 
      icon: ShoppingCart, 
      trend: `${dashboardData?.ordersTrend > 0 ? '+' : ''}${dashboardData?.ordersTrend}%`, 
      isPositive: dashboardData?.ordersTrend >= 0 
    },
    { 
      label: 'Revenue (Paid)', 
      value: `$${dashboardData?.totalRevenue?.toLocaleString() || '0'}`, 
      icon: DollarSign, 
      trend: `${dashboardData?.revenueTrend > 0 ? '+' : ''}${dashboardData?.revenueTrend}%`, 
      isPositive: dashboardData?.revenueTrend >= 0 
    },
    { 
      label: 'COD (To Collect)', 
      value: `$${dashboardData?.totalCodRevenue?.toLocaleString() || '0'}`, 
      icon: Package, 
      trend: 'Cash Flow', 
      isPositive: true 
    },
    { 
      label: 'Customers', 
      value: dashboardData?.totalUsers?.toLocaleString() || '0', 
      icon: Users, 
      trend: `${dashboardData?.usersTrend > 0 ? '+' : ''}${dashboardData?.usersTrend}%`, 
      isPositive: dashboardData?.usersTrend >= 0 
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const activeInfo = metrics.find(m => m.id === activeMetric);
      return (
        <div className="glass p-4 border border-gold/20 shadow-2xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-white font-bold">
            {activeInfo?.label}: {activeInfo?.prefix}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const currentMetricInfo = metrics.find(m => m.id === activeMetric);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Real-time performance analytics for your kitchen store.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="glass p-6 group hover:border-gold/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center group-hover:bg-gold/5 group-hover:border-gold/20 transition-all">
                <stat.icon className="w-6 h-6 text-gray-400 group-hover:text-gold transition-colors" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 uppercase tracking-tighter ${
                stat.isPositive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {stat.isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-white"><GradientText animate={false}>{stat.value}</GradientText></p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 glass p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Business Intelligence</h2>
              <p className="text-gray-500 text-xs">Visualize your store's growth metrics</p>
            </div>
            
            <div className="flex bg-dark-surface p-1 rounded-xl border border-dark-border">
              {metrics.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id as MetricType)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeMetric === m.id 
                      ? 'bg-gold text-dark-bg shadow-lg' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <m.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentMetricInfo?.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={currentMetricInfo?.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${currentMetricInfo?.prefix}${val.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 2 }} />
                <Area 
                  type="monotone" 
                  dataKey={activeMetric} 
                  stroke={currentMetricInfo?.color} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMetric)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="glass p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif font-bold text-white">Recent Activity</h2>
            <div className="p-1.5 rounded-lg bg-gold/10 border border-gold/20">
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
          </div>
          <div className="space-y-4">
            {recentOrders?.length > 0 ? (
              recentOrders.map((order: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-dark-border pb-4 last:border-0 last:pb-0 group">
                  <div>
                    <p className="text-white font-medium text-sm group-hover:text-gold transition-colors">{order.user?.firstName} {order.user?.lastName}</p>
                    <p className="text-gray-500 text-[10px] font-mono">#{order.id.slice(-4)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">${order.total.toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-tighter ${
                      order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      order.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ShoppingCart className="w-10 h-10 text-gray-700 mb-2" />
                <p className="text-gray-500 text-sm italic">Waiting for orders...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
