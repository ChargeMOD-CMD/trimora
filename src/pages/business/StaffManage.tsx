import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { trimmoraStylistApi } from '../../services/trimoraApi';
import { StaffMember } from '../../types';
import { useToast } from '../../features/notifications/ToastContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Avatar, Input, Skeleton, Modal } from '../../components/ui';

export default function StaffManage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState('stylist');

  const fetchStaff = async () => {
    const data = await trimmoraStylistApi.getAllStylists();
    setStaff(data);
  };

  useEffect(() => {
    fetchStaff().then(() => setLoading(false));
  }, []);

  const handleAddStaff = async () => {
    if (!newFirstName || !newLastName) return;
    setSaving(true);
    try {
      if (editingId) {
        await trimmoraStylistApi.updateStylist(editingId, {
          firstName: newFirstName,
          lastName: newLastName,
          displayName: `${newFirstName} ${newLastName}`,
          role: newRole as any
        });
        toast('success', 'Professional updated');
      } else {
        await trimmoraStylistApi.createStylist({
          businessId: 'trimora-salon',
          locationId: 'trimora-loc-1',
          userId: `u-new-${Date.now()}`,
          firstName: newFirstName,
          lastName: newLastName,
          displayName: `${newFirstName} ${newLastName}`,
          bio: 'New professional at Trimora.',
          avatar: '',
          specialties: ['Styling'],
          serviceIds: [],
          rating: 5.0,
          reviewCount: 0,
          role: newRole as any,
          commissionPercent: 40,
          workingHours: [],
          isActive: true,
          isAcceptingBookings: true,
          orderIndex: 99,
          createdAt: new Date().toISOString()
        });
        toast('success', 'Professional added');
      }
      await fetchStaff();
      setIsModalOpen(false);
      setEditingId(null);
      setNewFirstName('');
      setNewLastName('');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this professional?')) return;
    await trimmoraStylistApi.deleteStylist(id);
    toast('success', 'Professional removed');
    fetchStaff();
  };

  const filteredStaff = staff.filter(s => 
    s.firstName.toLowerCase().includes(search.toLowerCase()) || 
    s.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Stylists & Staff</h1>
            <p className="page-subtitle">Manage your salon professionals and their schedules.</p>
          </div>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => {
            setEditingId(null);
            setNewFirstName('');
            setNewLastName('');
            setNewRole('stylist');
            setIsModalOpen(true);
          }}>Add Professional</Button>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          <div style={{ width: 300 }}>
            <Input 
              placeholder="Search staff..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <select className="input" style={{ width: 'auto' }}>
              <option>All Roles</option>
              <option>Stylist</option>
              <option>Colour Technician</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3,4].map(i => <Skeleton key={i} height={60} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Professional</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Specialties</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Rating</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Avatar src={s.avatar} name={s.displayName} size="md" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.displayName}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{`${s.firstName.toLowerCase()}@trimora.co.uk`}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textTransform: 'capitalize', fontSize: 'var(--text-sm)' }}>
                      {s.role}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {s.specialties.slice(0, 2).map((spec, i) => (
                          <span key={i} style={{ padding: '2px 8px', background: 'var(--color-surface-2)', borderRadius: 12, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                            {spec}
                          </span>
                        ))}
                        {s.specialties.length > 2 && (
                          <span style={{ padding: '2px 8px', background: 'var(--color-surface-2)', borderRadius: 12, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            +{s.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>★</span> {s.rating}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" aria-label="Edit" onClick={() => {
                          setEditingId(s.id);
                          setNewFirstName(s.firstName);
                          setNewLastName(s.lastName);
                          setNewRole(s.role);
                          setIsModalOpen(true);
                        }}><Edit2 size={16} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-error)' }} aria-label="Delete" onClick={() => handleDeleteStaff(s.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Professional" : "Add Professional"} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input label="First Name" placeholder="e.g. John" required value={newFirstName} onChange={e => setNewFirstName(e.target.value)} />
            <Input label="Last Name" placeholder="e.g. Doe" required value={newLastName} onChange={e => setNewLastName(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Role</label>
            <select className="input" value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="stylist">Stylist</option>
              <option value="barber">Barber</option>
              <option value="colorist">Colorist</option>
              <option value="esthetician">Esthetician</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddStaff} loading={saving} disabled={!newFirstName || !newLastName}>{editingId ? "Save Changes" : "Save Professional"}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
