import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, CreditCard, Trash2, Tag, Percent, Scissors, Package } from 'lucide-react';
import { mockServiceService, mockInventoryService, mockPaymentService } from '../../services/mockServices';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/notifications/ToastContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Input, Skeleton, Avatar, Badge, EmptyState } from '../../components/ui';
import { Service, Product } from '../../types';

type CartItem = {
  id: string;
  type: 'service' | 'product' | 'custom';
  name: string;
  price: number;
  quantity: number;
  staffId?: string;
  staffName?: string;
};

export default function POS() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [customer, setCustomer] = useState<{name: string, id?: string} | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [svcs, prods] = await Promise.all([
        mockServiceService.getServicesByBusiness('biz-1'),
        mockInventoryService.getProducts('biz-1')
      ]);
      setServices(svcs);
      setProducts(prods);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const addToCart = (item: any, type: 'service' | 'product') => {
    const existing = cart.find(c => c.id === item.id && c.type === type);
    if (existing) {
      setCart(cart.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, {
        id: item.id,
        type,
        name: item.name,
        price: type === 'service' ? (item.salePrice || item.price) : item.sellingPrice,
        quantity: 1,
        staffName: type === 'service' ? 'Any Professional' : undefined
      }]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountType === 'percentage' 
    ? subtotal * (discountValue / 100)
    : discountType === 'fixed' ? discountValue : 0;
  const total = Math.max(0, subtotal - discountAmount);
  
  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCheckout = async (method: string) => {
    try {
      await mockPaymentService.processPayment('pos-sale', total, method);
      toast('success', `Payment of ₹${total.toFixed(2)} received via ${method}`);
      setCart([]);
      setCustomer(null);
      setDiscountType('none');
      setDiscountValue(0);
    } catch (e: any) {
      toast('error', 'Payment failed', e.message);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', height: 'calc(100vh - var(--header-height))', margin: 'calc(var(--space-8) * -1)' }}>
        
        {/* LEFT: Product/Service Browser */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h1 className="page-title">Point of Sale</h1>
              <div style={{ display: 'flex', background: 'var(--color-surface-2)', padding: 4, borderRadius: 'var(--radius-lg)' }}>
                <button className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('services')}>
                  <Scissors size={14} style={{ marginRight: 6 }} /> Services
                </button>
                <button className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('products')}>
                  <Package size={14} style={{ marginRight: 6 }} /> Products
                </button>
              </div>
            </div>
            <Input 
              leftIcon={<Search size={18} />} 
              placeholder={`Search ${activeTab}...`} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height={140} />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                {activeTab === 'services' && filteredServices.map(svc => (
                  <div key={svc.id} className="card card-hover" style={{ padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                    onClick={() => addToCart(svc, 'service')}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>{svc.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'auto' }}>{svc.durationMins} mins</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginTop: 'var(--space-3)' }}>
                      ₹{svc.salePrice || svc.price}
                      {svc.salePrice && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>₹{svc.price}</span>}
                    </div>
                  </div>
                ))}
                
                {activeTab === 'products' && filteredProducts.map(prod => (
                  <div key={prod.id} className="card card-hover" style={{ padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                    onClick={() => addToCart(prod, 'product')}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>{prod.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'auto' }}>{prod.brand} · {prod.stockQuantity} in stock</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginTop: 'var(--space-3)' }}>₹{prod.sellingPrice}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
          {/* Customer Selection */}
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
            {customer ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Avatar name={customer.name} size="sm" />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{customer.name}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setCustomer(null)}>Remove</button>
              </div>
            ) : (
              <Button variant="outline-accent" fullWidth leftIcon={<User size={16} />}>Add Customer</Button>
            )}
          </div>

          {/* Cart Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
            {cart.length === 0 ? (
              <EmptyState 
                icon={<ShoppingCart size={32} />} 
                title="Cart is empty" 
                description="Select services or products to add them to the cart." 
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.name}</div>
                      {item.staffName && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>by {item.staffName}</div>}
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 4 }}>₹{item.price}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24, color: 'var(--color-error)' }} onClick={() => removeItem(i)}>
                        <Trash2 size={14} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 2 }}>
                        <button className="btn btn-ghost" style={{ width: 24, height: 24, padding: 0 }} onClick={() => updateQuantity(i, -1)}>-</button>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button className="btn btn-ghost" style={{ width: 24, height: 24, padding: 0 }} onClick={() => updateQuantity(i, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & Checkout */}
          <div style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <button 
                className={`btn btn-sm ${discountType === 'percentage' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ flex: 1 }}
                onClick={() => { setDiscountType(discountType === 'percentage' ? 'none' : 'percentage'); setDiscountValue(10); }}
              >
                <Percent size={14} style={{ marginRight: 6 }} /> Discount %
              </button>
              <button 
                className={`btn btn-sm ${discountType === 'fixed' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ flex: 1 }}
                onClick={() => { setDiscountType(discountType === 'fixed' ? 'none' : 'fixed'); setDiscountValue(5); }}
              >
                <Tag size={14} style={{ marginRight: 6 }} /> Custom ₹
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountType !== 'none' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-error)' }}>
                  <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--color-border)' }}>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <Button size="lg" variant="secondary" disabled={cart.length === 0} onClick={() => handleCheckout('Cash')}>
                Cash
              </Button>
              <Button size="lg" variant="primary" disabled={cart.length === 0} leftIcon={<CreditCard size={18} />} onClick={() => handleCheckout('Card')}>
                Charge ₹{total.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
