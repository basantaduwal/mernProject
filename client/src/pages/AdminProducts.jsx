import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // If set, we are editing this product

  // Form inputs state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch products list
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch {
      setError('Failed to fetch product listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Electronics'); // Default
    setStock('');
    setImageFile(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setCategory(prod.category);
    setStock(prod.stock);
    setImageFile(null); // Optional
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This will also remove the image file from disk.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/products/${id}`);
      setSuccess('Product deleted successfully');
      fetchProducts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field checks
    if (!editProduct && !imageFile) {
      setError('Product image is required for new items');
      return;
    }

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stock', stock || 0);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editProduct) {
        // Edit flow
        await api.put(`/products/${editProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Product updated successfully');
      } else {
        // Create flow
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Product created successfully');
      }

      setShowModal(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Products Inventory</h1>
          <p className="text-xs text-white/40 mt-1">Manage catalog entries and stock levels</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary text-sm py-2 px-4">
          + Create Product
        </button>
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
      ) : products.length === 0 ? (
        <div className="glass p-12 rounded-lg border border-white/5 text-center space-y-3">
          <span className="text-4xl block">📦</span>
          <h3 className="font-display font-semibold text-lg text-white">No products found</h3>
          <p className="text-sm text-white/40">Get started by creating your first product listing</p>
        </div>
      ) : (
        <div className="glass rounded-lg border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/40">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-white font-semibold block truncate max-w-[180px]">{prod.name}</span>
                        <span className="text-[10px] text-white/35 block truncate max-w-[180px]">{prod.description}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white/70">{prod.category}</td>
                    <td className="p-4 font-bold text-orange-400">Rs. {prod.price.toLocaleString()}</td>
                    <td className={`p-4 font-semibold ${prod.stock === 0 ? 'text-red-400' : 'text-white/70'}`}>
                      {prod.stock} Units
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="text-orange-400 hover:text-orange-300 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold ml-3"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Popup Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-lg border border-white/10 p-5 glass sm:p-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-display font-bold text-xl text-white">
                {editProduct ? 'Edit Catalog Entry' : 'Create Product Entry'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/40 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Keyboard"
                  className="input-field py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe your product specs..."
                  className="input-field py-2.5 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="2500"
                    className="input-field py-2 text-sm"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="50"
                    className="input-field py-2 text-sm"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Category</label>
                <select
                  className="input-field py-2 text-sm bg-dark-800"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Books">Books</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-orange-400 file:cursor-pointer file:hover:bg-orange-500/20"
                />
                {editProduct && (
                  <span className="text-[10px] text-white/35 block mt-1">Leave blank to keep the current image file</span>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary justify-center text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 btn-primary justify-center text-sm disabled:opacity-50"
                >
                  {submitLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
