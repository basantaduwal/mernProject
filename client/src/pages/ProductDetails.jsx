import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartLoading } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSuccessMsg('');
    const res = await addToCart(product._id, quantity);
    if (res.success) {
      setSuccessMsg(`Successfully added ${quantity} item(s) to your cart!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(res.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-24 flex justify-center items-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 skeleton rounded-lg"></div>
          <div className="space-y-6">
            <div className="h-8 w-1/4 skeleton"></div>
            <div className="h-12 w-3/4 skeleton"></div>
            <div className="h-6 w-1/3 skeleton"></div>
            <div className="h-24 w-full skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container py-24 text-center space-y-4">
        <span className="text-4xl block">⚠️</span>
        <h2 className="font-display font-bold text-2xl text-white">Error Loading Product</h2>
        <p className="text-white/40">{error || 'Product not found'}</p>
        <button onClick={() => navigate('/products')} className="btn-secondary text-sm">
          Back to Catalog
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  // Limit selection options up to 10 or stock level, whichever is smaller
  const maxQtySelect = Math.min(product.stock, 10);
  const qtyOptions = Array.from({ length: maxQtySelect }, (_, i) => i + 1);

  return (
    <div className="page-container py-16 animate-fade-in-up">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Product Image */}
        <div className="relative flex h-[min(400px,70vw)] min-h-64 items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/5 md:h-[400px]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl">📦</span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-6 py-2.5 rounded-full bg-red-500 text-white font-extrabold tracking-wider uppercase text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="break-anywhere font-display mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              {product.name}
            </h1>
          </div>

          <p className="text-3xl font-extrabold text-white">Rs. {product.price.toLocaleString()}</p>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40 block">Description</label>
            <p className="text-white/60 leading-relaxed text-sm">{product.description}</p>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">Availability</span>
              <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-400' : 'text-emerald-400'}`}>
                {isOutOfStock ? 'Out of stock' : `${product.stock} units available`}
              </span>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && !isAdmin && (
              <div className="flex flex-wrap items-center gap-4 py-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white outline-none text-sm cursor-pointer focus:border-orange-500"
                >
                  {qtyOptions.map((qty) => (
                    <option key={qty} value={qty} className="bg-dark-800">
                      {qty}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold text-center">
                {successMsg}
              </div>
            )}

            {/* Action Button */}
            {!isAdmin && (
              <button
                disabled={isOutOfStock || cartLoading}
                onClick={handleAddToCart}
                className="btn-primary w-full sm:w-auto h-12 justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'Out of Stock' : cartLoading ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
            )}

            {isAdmin && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-semibold">
                You are logged in as Admin. Catalog modifications can be handled in the Admin Panel.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
