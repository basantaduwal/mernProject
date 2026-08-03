import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import api from '../services/api';

const Cart = () => {
  const { cart, updateCartItem, removeCartItem, clearCart } = useCart();

  // Wizard state: 0 = Cart list, 1 = Shipping address, 2 = Fake Payment, 3 = Order Success
  const [step, setStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState('');
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Fake Card inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paying, setPaying] = useState(false);

  // Form handlers
  const handleUpdateQty = async (productId, newQty) => {
    const res = await updateCartItem(productId, newQty);
    if (!res.success) setError(res.message);
  };

  const handleRemoveItem = async (productId) => {
    const res = await removeCartItem(productId);
    if (!res.success) setError(res.message);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (shippingAddress.trim().length < 10) {
      setError('Please provide a complete shipping address (min 10 characters)');
      return;
    }

    setError('');
    setPlacingOrder(true);
    try {
      // Place order - this clears the cart on the backend
      const { data } = await api.post('/orders', {
        shippingAddress: shippingAddress.trim(),
        paymentMethod: 'credit_card', // Fixed dummy payload field
      });
      
      setCreatedOrder(data.order);
      setStep(2); // Go to Fake Payment
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit credit card number');
      return;
    }
    if (!cardExpiry.includes('/')) {
      setError('Please enter expiry date in MM/YY format');
      return;
    }
    if (cardCvv.length !== 3) {
      setError('Please enter a valid 3-digit CVV code');
      return;
    }

    setError('');
    setPaying(true);
    try {
      // Execute simulated payment API call
      await api.post(`/orders/${createdOrder._id}/pay`);
      setStep(3); // Success Screen
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setPaying(false);
    }
  };

  // Step 0: Cart List View
  if (step === 0) {
    return (
      <div className="page-container py-16 animate-fade-in-up">
        <h2 className="section-title mb-8 mt-8">Shopping Cart</h2>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold mb-6 text-center">
            {error}
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="glass p-12 rounded-lg border border-white/5 text-center space-y-4">
            <span className="text-4xl block">🛒</span>
            <h3 className="font-display font-semibold text-lg text-white">Your cart is empty</h3>
            <p className="text-sm text-white/40">Browse catalog items and add them to your cart</p>
            <Link to="/products" className="btn-primary inline-flex text-xs py-2 px-4 mt-2">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.product._id} className="glass p-6 rounded-lg border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 card-hover">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-white text-sm sm:text-base truncate">{item.product.name}</h4>
                      <p className="text-xs text-white/40 mt-0.5">{item.product.category}</p>
                      <p className="text-sm text-orange-400 font-semibold mt-1">Rs. {item.product.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40">Qty:</span>
                      <select
                        value={item.quantity}
                        onChange={(e) => handleUpdateQty(item.product._id, Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white outline-none text-xs cursor-pointer focus:border-orange-500"
                      >
                        {Array.from({ length: Math.min(item.product.stock, 10) }, (_, i) => i + 1).map((qty) => (
                          <option key={qty} value={qty} className="bg-dark-800">
                            {qty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <button onClick={clearCart} className="btn-secondary text-xs py-2 px-4 border-red-500/20 hover:bg-red-500/5 text-red-400">
                  Clear Cart
                </button>
                <Link to="/products" className="text-xs text-orange-400 hover:text-orange-300 font-semibold">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="glass p-6 rounded-lg border border-white/5 h-fit space-y-6">
              <h3 className="font-display font-bold text-lg text-white">Order Summary</h3>
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span>
                  <span>Rs. {cart.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                <div className="border-t border-white/5 pt-4 flex justify-between font-display font-bold text-lg text-white">
                  <span>Total</span>
                  <span>Rs. {cart.totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full btn-primary justify-center h-12 text-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 1: Shipping Address Form
  if (step === 1) {
    return (
      <div className="page-container py-16 flex items-center justify-center animate-fade-in-up">
        <div className="w-full max-w-lg space-y-6 rounded-lg border border-white/10 p-6 shadow-2xl glass sm:p-8">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-2xl text-white">Delivery Details</h3>
            <p className="text-sm text-white/40">Enter the delivery address for your items</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">Shipping Address</label>
              <textarea
                required
                rows="4"
                className="input-field py-3"
                placeholder="Room No, Building Name, Street Address, City, Region, Zip Code"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
              <span className="text-[10px] text-white/35">Min 10 characters. Complete delivery path.</span>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex-1 btn-secondary justify-center h-11 text-sm"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                disabled={placingOrder}
                className="flex-1 btn-primary justify-center h-11 text-sm disabled:opacity-50"
              >
                {placingOrder ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Fake Credit Card Payment Gateway Simulation Screen
  if (step === 2) {
    return (
      <div className="page-container py-16 flex items-center justify-center animate-fade-in-up">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-white/10 p-6 shadow-2xl glass sm:p-8">
          <div className="text-center space-y-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px] font-bold uppercase">
              Simulated Sandbox Gateway
            </span>
            <h3 className="font-display font-bold text-2xl text-white mt-2">Card Payment</h3>
            <p className="text-sm text-white/40">Amount due: <span className="text-white font-semibold">Rs. {createdOrder?.subtotal.toLocaleString()}</span></p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">Card Number</label>
              <input
                type="text"
                required
                maxLength="16"
                placeholder="4111 2222 3333 4444"
                className="input-field"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Expiry Date</label>
                <input
                  type="text"
                  required
                  maxLength="5"
                  placeholder="MM/YY"
                  className="input-field"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">CVV</label>
                <input
                  type="password"
                  required
                  maxLength="3"
                  placeholder="•••"
                  className="input-field"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={paying}
              className="w-full btn-primary justify-center h-11 text-sm mt-6 disabled:opacity-50"
            >
              {paying ? 'Authorizing Mock Transaction...' : 'Pay with Simulated Card'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Checkout and Payment Success View
  if (step === 3) {
    return (
      <div className="page-container py-24 flex items-center justify-center animate-fade-in-up">
        <div className="w-full max-w-lg glass p-10 rounded-lg border border-white/10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl mx-auto">
            ✓
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-white">Order Confirmed!</h2>
            <p className="text-sm text-white/50">Your transaction has been simulated successfully</p>
          </div>

          <div className="mx-auto max-w-md space-y-2.5 rounded-lg border border-white/5 bg-white/5 p-5 text-left text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <span className="text-white/40">Order Code</span>
              <span className="break-anywhere font-mono font-semibold text-white">{createdOrder?._id}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <span className="text-white/40">Amount Charged</span>
              <span className="text-orange-400 font-extrabold">Rs. {createdOrder?.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <span className="text-white/40">Payment Status</span>
              <span className="text-emerald-400 font-semibold">PAID (Simulated)</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
            <button
              onClick={() => {
                // Trigger window/state refresh on cart since it was cleared
                window.location.href = '/orders';
              }}
              className="btn-primary justify-center text-sm py-2.5"
            >
              View Order History
            </button>
            <Link to="/" className="btn-secondary justify-center text-sm py-2.5">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
};

export default Cart;
