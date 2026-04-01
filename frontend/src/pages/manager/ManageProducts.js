import React, { useEffect, useState } from 'react';
import { productAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', category: 'Electronics', stock: '100' };
const CATEGORIES = ['Electronics', 'Accessories', 'Stationery', 'Clothing', 'Food', 'Other'];
const CAT_ICON = { Electronics: '🔌', Accessories: '🎒', Stationery: '📝', Clothing: '👕', Food: '🍕', Other: '📦' };

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    const load = (searchQuery = '', pageNum = 1, categoryFilter = '') => {
        setLoading(true);
        productAPI.getAll({ search: searchQuery, category: categoryFilter || undefined, page: pageNum, limit: 10 })
            .then(r => {
                setProducts(r.data.data);
                setPage(r.data.page);
                setPages(r.data.pages);
                setTotal(r.data.total);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(search, page, filter === 'All' ? '' : filter); }, []);

    const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
    const openEdit = (p) => { setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock }); setError(''); setModal(p); };

    const handleSave = async () => {
        setError('');
        const { name, price, category, stock } = form;
        if (!name || !price) return setError('Name and price are required.');
        setSaving(true);
        try {
            const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
            if (modal === 'create') {
                await productAPI.create(payload);
                toast.success(`Product "${form.name}" added!`);
            } else {
                await productAPI.update(modal._id, payload);
                toast.success('Product updated!');
            }
            setModal(null);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id, name, active) => {
        await productAPI.toggle(id);
        toast.success(`"${name}" ${active ? 'deactivated' : 'activated'}`);
        load();
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        await productAPI.remove(id);
        toast.success(`"${name}" deleted`);
        load(search, page, filter === 'All' ? '' : filter);
    };

    const handleCategoryFilter = (cat) => {
        setFilter(cat);
        setPage(1);
        load(search, 1, cat === 'All' ? '' : cat);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load(search, 1, filter === 'All' ? '' : filter);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pages) {
            setPage(newPage);
            load(search, newPage, filter === 'All' ? '' : filter);
        }
    };

    const categories = ['All', ...CATEGORIES];

    if (loading) return (
        <>
            <Topbar title="Manage Products"><button className="btn btn-accent" onClick={openCreate}>+ Add Product</button></Topbar>
            <div className="loader-wrap"><div className="loader" /></div>
        </>
    );

    return (
        <>
            <Topbar title="Manage Products">
                <button className="btn btn-accent" onClick={openCreate}>+ Add Product</button>
            </Topbar>
            <div className="content-area">

                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 20 }}>
                    <div className="stat-card" style={{ '--stat-color': '#ff6b35' }}>
                        <div className="stat-icon">📦</div>
                        <div className="stat-value">{products.length}</div>
                        <div className="stat-label">Total Products</div>
                    </div>
                    <div className="stat-card" style={{ '--stat-color': '#10b981' }}>
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{products.filter(p => p.isActive).length}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-card" style={{ '--stat-color': '#f59e0b' }}>
                        <div className="stat-icon">🏷</div>
                        <div className="stat-value">{[...new Set(products.map(p => p.category))].length}</div>
                        <div className="stat-label">Categories</div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        className="form-input"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ maxWidth: 300 }}
                    />
                    <button className="btn btn-accent" onClick={handleSearch}>Search</button>
                    {search && <button className="btn" onClick={() => { setSearch(''); load('', 1, filter === 'All' ? '' : filter); }}>Clear</button>}
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} className={`btn btn-sm${filter === cat ? ' btn-accent' : ''}`} onClick={() => handleCategoryFilter(cat)}>
                            {cat !== 'All' && CAT_ICON[cat]} {cat}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="table-card">
                    <table>
                        <thead>
                            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.description}</div>
                                    </td>
                                    <td><span className="badge badge-info">{CAT_ICON[p.category]} {p.category}</span></td>
                                    <td><span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>₹{p.price}</span></td>
                                    <td>{p.stock}</td>
                                    <td>
                                        {p.isActive
                                            ? <span className="badge badge-success">Active</span>
                                            : <span className="badge badge-neutral">Inactive</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-sm" onClick={() => openEdit(p)}>Edit</button>
                                            <button className="btn btn-sm" onClick={() => handleToggle(p._id, p.name, p.isActive)}>
                                                {p.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📦</div><div className="empty-text">No products found</div></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {pages > 1 && (
                    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 }}>
                        <button className="btn btn-sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
                        <span style={{ color: 'var(--text2)', fontSize: 13 }}>Page {page} of {pages} ({total} total)</span>
                        <button className="btn btn-sm" onClick={() => handlePageChange(page + 1)} disabled={page === pages}>Next</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && setModal(null)}>
                    <div className="modal">
                        <button className="modal-close" onClick={() => setModal(null)}>✕</button>
                        <div className="modal-title">{modal === 'create' ? 'Add New Product' : `Edit: ${modal.name}`}</div>
                        {error && <div className="error-msg">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input className="form-input" placeholder="e.g. Wireless Headphones" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input className="form-input" placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price (₹)</label>
                                <input className="form-input" type="number" placeholder="999" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock</label>
                                <input className="form-input" type="number" placeholder="100" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : modal === 'create' ? 'Add Product' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
    