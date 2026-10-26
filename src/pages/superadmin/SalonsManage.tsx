import React, { useEffect, useState } from 'react';
import { SuperAdminLayout } from '../../components/layout/SuperAdminLayout';
import { mockPlatformService, Salon } from '../../services/mockPlatformService';
import { Button, Input, Badge, Modal } from '../../components/ui';
import { Plus, Search, Building2, Edit2, Link as LinkIcon, Power } from 'lucide-react';
import { useToast } from '../../features/notifications/ToastContext';

export default function SalonsManage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>('active');

  const fetchSalons = async () => {
    setLoading(true);
    const data = await mockPlatformService.getSalons();
    setSalons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const openNewModal = () => {
    setEditingSalon(null);
    setName('');
    setSlug('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (salon: Salon) => {
    setEditingSalon(salon);
    setName(salon.name);
    setSlug(salon.slug);
    setEmail(salon.contactEmail);
    setStatus(salon.status);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingSalon) {
        await mockPlatformService.updateSalon(editingSalon.id, { name, slug, contactEmail: email, status });
        toast('success', 'Salon updated successfully');
      } else {
        await mockPlatformService.createSalon({ 
          name, 
          slug, 
          contactEmail: email, 
          status,
          ownerPassword: password,
          ownerFirstName: firstName || 'Salon',
          ownerLastName: lastName || 'Owner'
        });
        toast('success', 'Salon created successfully');
      }
      setIsModalOpen(false);
      fetchSalons();
    } catch (e: any) {
      toast('error', e.message || 'Failed to save salon');
    }
  };

  const handleToggleStatus = async (salon: Salon) => {
    const newStatus = salon.status === 'active' ? 'suspended' : 'active';
    if (window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} ${salon.name}?`)) {
      await mockPlatformService.updateSalon(salon.id, { status: newStatus });
      toast('success', `Salon ${newStatus === 'suspended' ? 'suspended' : 'activated'}`);
      fetchSalons();
    }
  };

  const filteredSalons = salons.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Tenant Salons</h1>
          <p className="page-subtitle">Manage registered salons on the platform.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openNewModal}>
          Register Salon
        </Button>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-6)', maxWidth: 400 }}>
          <Input 
            leftIcon={<Search size={16} />} 
            placeholder="Search by name or slug..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Salon Details</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Slug / URL</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 'var(--space-4)', textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : filteredSalons.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 'var(--space-4)', textAlign: 'center' }}>No salons found.</td>
                </tr>
              ) : (
                filteredSalons.map(salon => (
                  <tr key={salon.id} style={{ borderBottom: '1px solid var(--color-border-light)' }} className="hover-bg">
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={16} color="var(--color-primary)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{salon.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{salon.contactEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <LinkIcon size={12} />
                        /{salon.slug}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <Badge variant={salon.status === 'active' ? 'success' : salon.status === 'suspended' ? 'error' : 'warning'}>
                        {salon.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(salon)} title="Edit">
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(salon)} 
                          title={salon.status === 'active' ? 'Suspend' : 'Activate'}
                          style={{ color: salon.status === 'active' ? 'var(--color-error)' : 'var(--color-success)' }}
                        >
                          <Power size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSalon ? 'Edit Salon' : 'Register New Salon'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Salon Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Unique Slug" value={slug} onChange={e => setSlug(e.target.value)} required />
          <Input label="Contact Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label className="input-label">Status</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {!editingSalon && (
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Owner Credentials</h3>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ flex: 1 }} />
                <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ flex: 1 }} />
              </div>
              <Input label="Initial Password" type="text" value={password} onChange={e => setPassword(e.target.value)} required />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                The salon owner will use the Contact Email and this password to log in.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={!name || !slug}>
              {editingSalon ? 'Save Changes' : 'Create Salon'}
            </Button>
          </div>
        </div>
      </Modal>

    </SuperAdminLayout>
  );
}
