import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import {
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  Product
} from '../../api/catalogueApi';
import { useGetMyVendorQuery } from '../../api/vendorApi';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatPrice } from '../../lib/formatters';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/toastSlice';

export const VendorProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: vendorData } = useGetMyVendorQuery();
  const vendor = vendorData?.data;
  const isVerified = vendor?.status === 'verified';

  const { data, isLoading, refetch } = useGetMyProductsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 10
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceRupees, setPriceRupees] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setPriceRupees('');
    setCategory('Electronics');
    setStock('10');
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600');
    setStatus(isVerified ? 'active' : 'draft');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setDescription(p.description);
    setPriceRupees((p.price / 100).toString());
    setCategory(p.category);
    setStock(p.stock.toString());
    setImageUrl(p.imageUrl);
    setStatus(p.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const pricePaise = Math.round(parseFloat(priceRupees) * 100);
    const stockInt = parseInt(stock, 10);

    if (isNaN(pricePaise) || pricePaise < 0) {
      setFormError('Please enter a valid price');
      return;
    }
    if (isNaN(stockInt) || stockInt < 0) {
      setFormError('Please enter a valid stock number');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct.id,
          body: {
            title,
            description,
            price: pricePaise,
            category,
            stock: stockInt,
            imageUrl,
            status
          }
        }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Product updated successfully' }));
      } else {
        await createProduct({
          title,
          description,
          price: pricePaise,
          category,
          stock: stockInt,
          imageUrl,
          status
        }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Product created successfully' }));
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err.data?.error?.message || 'Operation failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteProduct(deleteTargetId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Product deleted successfully' }));
      setDeleteTargetId(null);
      refetch();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.data?.error?.message || 'Failed to delete' }));
    }
  };

  const products = data?.data || [];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar type="vendor" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Product Inventory
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Add, update, and manage your products. Verified vendors can publish products live to the marketplace.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Verification Alert if not verified */}
        {!isVerified && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Vendor Verification Required for Publishing</strong>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Your store status is currently <strong>{vendor?.status || 'unverified'}</strong>. Any products you create will be saved in <strong>Draft</strong> mode until an administrator approves your store.
              </p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your products by title..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:border-brand-500 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 font-medium focus:border-brand-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Draft Only</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">Loading products...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      No products found. Click "Add New Product" to start selling.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-100 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block truncate max-w-xs">{p.title}</span>
                            <span className="text-[10px] text-stone-400 truncate block max-w-xs">{p.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-stone-900">{formatPrice(p.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${p.stock <= 5 ? 'text-amber-600' : 'text-stone-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-brand-600 hover:bg-brand-50 transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(p.id)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-xl relative animate-scale-up">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-600 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed specifications, features, materials..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Price (₹ INR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      placeholder="e.g. 1499.00"
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-500 font-medium"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Handicrafts">Handicrafts</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                      <option value="Beauty & Wellness">Beauty & Wellness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      disabled={!isVerified}
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="active" disabled={!isVerified}>
                        Active {!isVerified ? '(Requires Verified Store)' : '(Public)'}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                  >
                    {isCreating || isUpdating ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteTargetId}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmLabel="Delete"
          isDestructive={true}
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
      </main>
    </div>
  );
};
