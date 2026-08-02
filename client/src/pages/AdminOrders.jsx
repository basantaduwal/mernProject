import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data.orders);
    } catch {
      setError('Failed to fetch administrative order logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setSuccess(`Order status updated to '${newStatus}'`);
      fetchOrders();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display font-bold text-2xl">Sales Orders</h1>
        <p className="text-xs text-white/40 mt-1">Audit customer transactions and update delivery status</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold text-center">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 skeleton rounded-lg"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass p-12 rounded-lg border border-white/5 text-center space-y-3">
          <span className="text-4xl block">🛒</span>
          <h3 className="font-display font-semibold text-lg text-white">No orders found</h3>
          <p className="text-sm text-white/40">Transactions will appear once customers place checkouts</p>
        </div>
      ) : (
        <div className="glass rounded-lg border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/40">
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {orders.map((order) => {
                  const isClosed = order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled';
                  return (
                    <tr key={order._id} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-4 space-y-1">
                        <span className="break-anywhere block font-mono text-xs font-bold text-white">{order._id}</span>
                        <span className="text-[10px] text-white/35 block">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="block font-semibold text-white">{order.user?.name || 'Deleted User'}</span>
                        <span className="break-anywhere block text-xs text-white/40">{order.user?.email || 'N/A'}</span>
                      </td>
                      <td className="p-4 font-bold text-white">Rs. {order.subtotal.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-orange-500/10 text-orange-400'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isClosed ? (
                          <span className="text-xs text-white/30 italic">Order Closed</span>
                        ) : (
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white outline-none text-xs cursor-pointer focus:border-orange-500"
                          >
                            <option value="Pending" className="bg-dark-800">Pending</option>
                            <option value="Processing" className="bg-dark-800">Processing</option>
                            <option value="Shipped" className="bg-dark-800">Shipped</option>
                            <option value="Delivered" className="bg-dark-800">Delivered</option>
                            <option value="Cancelled" className="bg-dark-800">Cancelled</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
