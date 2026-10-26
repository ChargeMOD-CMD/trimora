import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Clock, DollarSign, CheckSquare, Trash2 } from 'lucide-react';
import { trimoraServiceApi } from '../../services/trimoraApi';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/notifications/ToastContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Input, StatusBadge, Skeleton, EmptyState, Badge, Modal, Switch } from '../../components/ui';
import { Service } from '../../types';

export default function ServicesManage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Service State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('haircuts');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const fetchServices = async () => {
    const data = await trimoraServiceApi.getAllServices();
    setServices(data);
  };

  useEffect(() => {
    fetchServices().then(() => setLoading(false));
  }, []);

  const handleAddService = async () => {
    if (!newName || !newPrice || !newDuration) return;
    setSaving(true);
    try {
      if (editingId) {
        await trimoraServiceApi.updateService(editingId, {
          name: newName,
          category: newCategory as any,
          durationMins: parseInt(newDuration),
          price: parseFloat(newPrice)
        });
        toast('success', 'Service updated');
      } else {
        await trimoraServiceApi.createService({
          businessId: 'trimora-salon',
          name: newName,
          description: 'New service added by admin',
          category: newCategory as any,
          durationMins: parseInt(newDuration),
          price: parseFloat(newPrice),
          addons: [],
          staffIds: ['ts-staff-1', 'user-owner-1'],
          isActive: true,
          isFeatured: false,
          isMemberOnly: false,
          requiresDeposit: false,
          depositAmount: 0,
          maxGroupSize: 1,
          orderIndex: 99,
          tags: []
        });
        toast('success', 'Service created');
      }
      await fetchServices();
      setIsModalOpen(false);
      setEditingId(null);
      setNewName('');
      setNewPrice('');
      setNewDuration('');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    await trimoraServiceApi.deleteService(id);
    toast('success', 'Service deleted');
    fetchServices();
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  // Group by category
  const grouped = filteredServices.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Services & Add-ons</h1>
            <p className="page-subtitle">Manage your service menu, pricing, and durations.</p>
          </div>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => {
            setEditingId(null);
            setNewName('');
            setNewCategory('haircuts');
            setNewPrice('');
            setNewDuration('');
            setIsModalOpen(true);
          }}>Add Service</Button>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-6)', width: 320 }}>
          <Input 
            leftIcon={<Search size={16} />} 
            placeholder="Search services..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height={60} />)}
          </div>
        ) : filteredServices.length === 0 ? (
          <EmptyState title="No services found" description="Try a different search or add a new service." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {Object.entries(grouped).map(([category, svcs]) => (
              <div key={category}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, textTransform: 'capitalize', paddingBottom: 'var(--space-2)', borderBottom: '2px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
                  {category} <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontWeight: 400 }}>({svcs.length})</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {svcs.map(svc => (
                    <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)' }} className="hover-bg">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                          <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{svc.name}</span>
                          {!svc.isActive && <StatusBadge status="inactive" />}
                          {svc.isFeatured && <Badge variant="gold">Popular</Badge>}
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {svc.description}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {svc.durationMins} mins</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckSquare size={12} /> {svc.addons.length} Add-ons</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          {svc.salePrice ? (
                            <>
                              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-error)' }}>₹{svc.salePrice}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>₹{svc.price}</div>
                            </>
                          ) : (
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>₹{svc.price}</div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => {
                            setEditingId(svc.id);
                            setNewName(svc.name);
                            setNewCategory(svc.category);
                            setNewPrice(svc.price.toString());
                            setNewDuration(svc.durationMins.toString());
                            setIsModalOpen(true);
                          }}><Edit2 size={16} /></button>
                          <button className="btn btn-ghost btn-icon" title="Delete" style={{ color: 'var(--color-error)' }} onClick={() => handleDeleteService(svc.id)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Service" : "Add New Service"} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Service Name" placeholder="e.g. Classic Fade" required value={newName} onChange={e => setNewName(e.target.value)} />
          <div>
            <label className="input-label">Category</label>
            <select className="input" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              <option value="haircuts">Haircuts</option>
              <option value="styling">Styling</option>
              <option value="color">Color</option>
              <option value="treatments">Treatments</option>
              <option value="beard">Beard</option>
            </select>
          </div>
          <Input label="Description" placeholder="Briefly describe the service..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="Price (₹)" type="number" placeholder="0.00" required leftIcon={<DollarSign size={16} />} value={newPrice} onChange={e => setNewPrice(e.target.value)} />
            <Input label="Duration (mins)" type="number" placeholder="30" required leftIcon={<Clock size={16} />} value={newDuration} onChange={e => setNewDuration(e.target.value)} />
          </div>
          
          <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-4)', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)' }}>
            <Switch checked={true} onChange={() => {}} label="Service is active and bookable online" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddService} loading={saving} disabled={!newName || !newPrice || !newDuration}>{editingId ? "Save Changes" : "Save Service"}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
