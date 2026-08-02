import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="page-container py-16 animate-fade-in-up space-y-6">
        <h2 className="section-title mb-8">Order History</h2>
        {[1, 2].map((num) => (
          <div key={num} className="h-44 skeleton rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="page-container py-16 animate-fade-in-up">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="section-title">Order History</h2>
        <span className="text-sm text-white/40">{orders.length} order(s) placed</span>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold text-center mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass p-12 rounded-lg border border-white/5 text-center space-y-4">
          <span className="text-4xl block">📦</span>
          <h3 className="font-display font-semibold text-lg text-white">No orders found</h3>
          <p className="text-sm text-white/40">You haven't placed any orders yet</p>
          <Link to="/products" className="btn-primary inline-flex text-xs py-2 px-4 mt-2">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="glass p-6 rounded-lg border border-white/5 space-y-6">
              {/* Order Metadata */}
              <div className="flex flex-wrap justify-between items-center pb-4 border-b border-white/5 gap-4">
                <div>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-0.5">Order ID</span>
                  <span className="break-anywhere font-mono text-sm font-semibold text-white">{order._id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-0.5">Date Placed</span>
                  <span className="text-sm text-white/80">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-0.5">Total Charged</span>
                  <span className="text-sm text-white font-extrabold">Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  {/* Payment Status */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  
                  {/* Order Delivery Status */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items List inside Order */}
              <div className="space-y-4">
                {order.products.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-semibold text-white text-sm">
                          {item.product?.name || 'Deleted Product'}
                        </h4>
                        <p className="break-anywhere text-xs text-white/40 mt-0.5">
                          Quantity: {item.quantity} • Unit Price: Rs. {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-white/70">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Address block */}
              <div className="pt-4 border-t border-white/5 text-xs text-white/40 flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider">Shipping Destination</span>
                <span className="text-white/60 text-sm leading-relaxed">{order.shippingAddress}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
