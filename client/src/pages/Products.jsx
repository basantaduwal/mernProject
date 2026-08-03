import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local state for filters
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  // Synchronize state with URL search params when search params change
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (category.trim()) params.category = category.trim();
      if (minPrice.trim()) params.minPrice = minPrice.trim();
      if (maxPrice.trim()) params.maxPrice = maxPrice.trim();

      const { data } = await api.get('/products', { params });
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [keyword, category, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters by updating URL params
  const handleApplyFilters = (e) => {
    e?.preventDefault();
    const params = {};
    if (keyword.trim()) params.keyword = keyword.trim();
    if (category.trim()) params.category = category.trim();
    if (minPrice.trim()) params.minPrice = minPrice.trim();
    if (maxPrice.trim()) params.maxPrice = maxPrice.trim();
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="page-container py-16 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 glass p-6 rounded-lg border border-white/5 h-fit space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display font-bold text-lg text-white">Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              Clear All
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-6">
            {/* Search Keyword */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">Search</label>
              <input
                type="text"
                placeholder="Product name..."
                className="input-field py-2 text-xs"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">Category</label>
              <select
                className="input-field py-2 text-xs appearance-none bg-dark-800"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Footwear">Footwear</option>
                <option value="Books">Books</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 block">Price Range (Rs.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="input-field py-2 text-xs"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-white/30 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="input-field py-2 text-xs"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary justify-center text-xs py-2.5">
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Catalog Grid */}
        <div className="min-w-0 flex-grow space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">Products</h2>
            <span className="text-sm text-white/40">{products.length} item(s) found</span>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs text-center font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className="h-80 skeleton rounded-lg"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass p-12 rounded-lg border border-white/5 text-center space-y-3">
              <span className="text-4xl block">🔍</span>
              <h3 className="font-display font-semibold text-lg text-white">No products found</h3>
              <p className="text-sm text-white/40">Try adjusting your filters or search keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div key={prod._id} className="glass rounded-lg border border-white/5 overflow-hidden card-hover flex flex-col">
                  {/* Product Image */}
                  <div className="h-48 bg-white/5 relative overflow-hidden shrink-0 flex items-center justify-center">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                    {prod.stock === 0 && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500/80 text-white font-bold text-[10px] uppercase">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="font-display font-bold text-white text-base line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-2">
                      <span className="font-display font-extrabold text-base text-white">
                        Rs. {prod.price.toLocaleString()}
                      </span>
                      <Link to={`/products/${prod._id}`} className="btn-primary px-3 py-1.5 text-[10px]">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
