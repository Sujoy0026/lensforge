import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Plus, Trash2, ShoppingBag, TrendingUp, Layers, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Product, AdminStats, ProductCategory } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface AdminPanelProps {
  token: string;
}

export default function AdminPanel({ token }: AdminPanelProps) {
  const { isDark } = useTheme();
  // Stats State
  const [stats, setStats] = useState<AdminStats>({ totalProducts: 0, totalSales: 0, revenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Templates');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  // Form Feedback
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch products
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
    } catch (e) {
      console.error('Error fetching admin details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setZipFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!imageFile || !zipFile) {
      setFormError('Both a Preview Image and a Product ZIP file are required.');
      return;
    }

    setFormLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('preview_image', imageFile);
    formData.append('product_zip', zipFile);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      setFormSuccess('Product published and secure files linked successfully!');
      // Reset form fields
      setName('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      setZipFile(null);
      
      // Reset inputs
      const imgInput = document.getElementById('preview_image') as HTMLInputElement;
      const zipInput = document.getElementById('product_zip') as HTMLInputElement;
      if (imgInput) imgInput.value = '';
      if (zipInput) zipInput.value = '';

      // Sync metrics & catalog
      fetchAdminData();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this product and secure binary files?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        fetchAdminData();
      } else {
        const errData = await response.json();
        alert(errData.error || 'Failed to delete product');
      }
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Title */}
      <div>
        <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
          <LayoutDashboard className="text-indigo-600 w-5 h-5" />
          LensForge Admin Dashboard
        </h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Monitor platform transactions, link new assets, and manage secure licenses.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`border rounded-xl p-5 flex items-center gap-4 shadow-sm transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'}`}>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gross Platform Revenue</span>
            <span className={`text-xl font-extrabold block mt-0.5 font-mono ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>${stats.revenue.toLocaleString('en-US')}</span>
          </div>
        </div>

        <div className={`border rounded-xl p-5 flex items-center gap-4 shadow-sm transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'}`}>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-950/40 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders Filled</span>
            <span className={`text-xl font-extrabold block mt-0.5 font-mono ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{stats.totalSales} Purchases</span>
          </div>
        </div>

        <div className={`border rounded-xl p-5 flex items-center gap-4 shadow-sm transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'}`}>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <Layers size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Products</span>
            <span className={`text-xl font-extrabold block mt-0.5 font-mono ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{stats.totalProducts} Catalog Items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className={`lg:col-span-1 border rounded-xl p-5 h-fit shadow-sm transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'}`}>
          <h3 className={`text-xs font-extrabold mb-4 uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
            <Plus className="text-indigo-600 w-4 h-4" />
            Add Premium Asset
          </h3>

          {formSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-lg font-medium flex items-start gap-2">
              <CheckCircle size={14} className="shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Quantum Dashboard UI Kit"
                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-[#e2e8f0] text-[#0f172a] placeholder-slate-400'}`}
              />
            </div>

            <div>
              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'}`}
              >
                <option value="Templates">Templates</option>
                <option value="3D SaaS">3D SaaS</option>
                <option value="Dashboards">Dashboards</option>
              </select>
            </div>

            <div>
              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Price (USD $)</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99"
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'}`}
              />
            </div>

            <div>
              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Asset Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sleek premium dashboard system with customized layouts..."
                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500 resize-none transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-[#e2e8f0] text-[#0f172a] placeholder-slate-400'}`}
              />
            </div>

            <div>
              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Preview Image File</label>
              <div className={`relative border border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800 hover:bg-slate-800/40' : 'bg-slate-50 border-[#e2e8f0] hover:bg-slate-100'}`}>
                <input
                  type="file"
                  id="preview_image"
                  required
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 w-full cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <Upload size={16} />
                  <span className="text-[11px] truncate max-w-full font-medium text-slate-500">
                    {imageFile ? imageFile.name : 'Select preview image'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Secure Product ZIP Package</label>
              <div className={`relative border border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${isDark ? 'bg-slate-950 border-slate-800 hover:bg-slate-800/40' : 'bg-slate-50 border-[#e2e8f0] hover:bg-slate-100'}`}>
                <input
                  type="file"
                  id="product_zip"
                  required
                  accept=".zip"
                  onChange={handleZipChange}
                  className="absolute inset-0 opacity-0 w-full cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <FileText size={16} />
                  <span className="text-[11px] truncate max-w-full font-medium text-slate-500">
                    {zipFile ? zipFile.name : 'Select product ZIP package'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
            >
              {formLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing Asset...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Publish Product
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className={`lg:col-span-2 border rounded-xl p-5 shadow-sm transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'}`}>
          <h3 className={`text-xs font-extrabold mb-4 uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Manage Digital Catalog</h3>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No products found. Start publishing assets above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-slate-400 font-semibold ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
                    <th className="pb-3 pl-1">Product Details</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 text-right pr-1">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {products.map((p) => (
                    <tr key={p.id} className={`transition-colors ${isDark ? 'hover:bg-slate-950/50' : 'hover:bg-slate-50'}`}>
                      <td className="py-4 pl-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold uppercase border ${isDark ? 'bg-indigo-950/40 border-indigo-900/30 text-indigo-400' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
                            {p.name.substring(0, 2)}
                          </div>
                          <div>
                            <span className={`font-bold block line-clamp-1 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className={`py-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.category}</td>
                      <td className={`py-4 font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>${p.price.toLocaleString('en-US')}</td>
                      <td className="py-4 text-right pr-1">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isDark ? 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-950/50 hover:border-red-800' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'}`}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
