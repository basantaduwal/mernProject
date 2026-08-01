import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [prodRes, orderRes, userRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders'),
          api.get('/users'),
        ]);

        // Calculate revenue from paid orders
        const paidOrders = orderRes.data.orders.filter(o => o.paymentStatus === 'Paid');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);

        setStats({
          totalProducts: prodRes.data.count,
          totalOrders: orderRes.data.count,
          totalUsers: userRes.data.count,
          revenue: totalRevenue,
        });
      } catch (err) {
        setError('Failed to fetch dashboard metrics. Verify admin credentials.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="h-8 w-1/4 skeleton"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 skeleton rounded-2xl"></div>
          ))}
        </div>
        <div className="h-48 skeleton rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="font-display font-bold text-2xl">Overview</h1>
        <span className="text-sm text-white/40">Real-time metrics</span>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Dashboard metrics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: '💰' },
          { label: 'Total Orders', value: `${stats.totalOrders} Placed`, icon: '🛒' },
          { label: 'Total Users', value: `${stats.totalUsers} Accounts`, icon: '👥' },
        ].map((metric) => (
          <div key={metric.label} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">{metric.label}</span>
              <span className="text-xl">{metric.icon}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-display font-extrabold text-2xl text-white">{metric.value}</span>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin system status details */}
      <div className="glass p-8 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <h3 className="font-display font-bold text-lg">System Audit Log Status</h3>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">
          Welcome to the Mini Daraz administrative dashboard. Role-Based Access Control is successfully loaded. Use the sidebar options to audit products, modify orders, and view database users.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
