import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, couponAPI, orderAPI } from '../../utils/api';
import Topbar from '../../components/Topbar';
import toast from 'react-hot-toast';

export default function Checkout() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});       // { productId: qty }
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponOk, setCouponOk] = useState(false);
  const [validating, setValidating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    productAPI.getAll()
      .then(r => setProducts(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  // ── Cart helpers ──
  const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart(c => {
    const updated = { ...c };
    if (updated[id] > 1) updated[id]--;
    else delete updated[id];
    return updated;
  });
  const clearItem = (id) => setCart(c => { const u = { ...c }; delete u[id]; return u; });

  const cartItems = products.filter(p => cart[p._id]);
  const subtotal = cartItems.reduce((s, p) => s + p.price * cart[p._id], 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  // ── Coupon ──
  const resetCoupon = () => { setCouponInfo(null); setCouponOk(false); setCouponMsg(''); };

  const handleValidate = async () => {
    resetCoupon();
    if (!couponCode.trim()) { setCouponMsg('Please enter a coupon code.'); return; }
    if (subtotal === 0) { setCouponMsg('Add items to cart first.'); return; }
    setValidating(true);
    try {
      const res = await couponAPI.validate({ code: couponCode.toUpperCase(), orderAmount: subtotal });
      setCouponInfo(res.data.data);
      setCouponOk(true);
      setCouponMsg(`✅ Coupon applied! You save ₹${res.data.data.discount}`);
    } catch (err) {
      setCouponMsg(`❌ ${err.response?.data?.message || 'Invalid coupon'}`);
    } finally {
      setValidating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartCount === 0) { toast.error('Your cart is empty!'); return; }
    setPlacing(true);
    try {
      const items = cartItems.map(p => ({ name: p.name, price: p.price, qty: cart[p._id] }));
      const res = await orderAPI.create({
        items,
        couponCode: couponOk ? couponCode.toUpperCase() : null,
      });
      toast.success(`Order #${res.data.data._id.slice(-6)} placed! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  const discount = couponInfo?.discount || 0;
  const total = subtotal - discount;
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  if (loading) return <><Topbar title="Shop & Checkout" /><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="Shop & Checkout">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text2)' }}>Cart:</span>
          <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 20, padding: '3px 10px', fontWeight: 700 }}>{cartCount} items</span>
          <span style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>₹{subtotal}</span>
        </div>
      </Topbar>

      <div className="content-area">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

          {/* ── Product Grid ── */}
          <div>
            {/* Category Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm${activeCategory === cat ? ' btn-accent' : ''}`}
                  onClick={() => setCategory(cat)}
                >{cat}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
              {filtered.map(p => {
                const qty = cart[p._id] || 0;
                return (
                  <div key={p._id} className="card" style={{ overflow: 'visible' }}>
                    {/* Product image placeholder */}
                    <div style={{
                      height: 120, background: `linear-gradient(135deg, rgba(255,107,53,.08), rgba(124,58,237,.08))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
                      borderBottom: '1px solid var(--border)'
                    }}>
                      {{ Electronics: '🔌', Accessories: '🎒', Stationery: '📝' }[p.category] || '📦'}
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{p.category}</div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.4 }}>{p.description}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>₹{p.price}</div>
                        {qty === 0
                          ? <button className="btn btn-accent btn-sm" onClick={() => addToCart(p._id)}>Add +</button>
                          : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="btn btn-sm" style={{ padding: '4px 10px' }} onClick={() => removeFromCart(p._id)}>−</button>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                            <button className="btn btn-sm" style={{ padding: '4px 10px' }} onClick={() => addToCart(p._id)}>+</button>
                          </div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Cart & Order Summary ── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card card-pad">
              <div className="section-title" style={{ marginBottom: 16 }}>🛒 Your Cart</div>

              {cartItems.length === 0
                ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)', fontSize: 13 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                  Add products from the left
                </div>
                : <>
                  {/* Cart Items */}
                  <div style={{ marginBottom: 16 }}>
                    {cartItems.map(p => (
                      <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>₹{p.price} × {cart[p._id]}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>₹{p.price * cart[p._id]}</span>
                          <button onClick={() => clearItem(p._id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div style={{ marginBottom: 16 }}>
                    <div className="form-label">Coupon Code</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="form-input"
                        style={{ flex: 1, padding: '10px 12px' }}
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); resetCoupon(); }}
                      />
                      <button className="btn btn-accent btn-sm" onClick={handleValidate} disabled={validating}>
                        {validating ? '…' : 'Apply'}
                      </button>
                    </div>
                    {couponMsg && (
                      <div style={{ fontSize: 11, marginTop: 6, color: couponOk ? 'var(--success)' : 'var(--danger)' }}>
                        {couponMsg}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div className="checkout-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                    {discount > 0 && (
                      <div className="checkout-row discount-row">
                        <span>Discount ({couponCode})</span><span>−₹{discount}</span>
                      </div>
                    )}
                    <div className="checkout-row total"><span>Total</span><span>₹{total}</span></div>
                  </div>

                  <button
                    className="btn btn-accent btn-full"
                    style={{ marginTop: 16 }}
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? 'Placing Order…' : `Place Order →`}
                  </button>
                </>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

