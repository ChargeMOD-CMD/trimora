import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, UserPlus, Eye, EyeOff, Key, Save, Shield, Edit2, Trash2, Database, CheckCircle2, AlertCircle, RefreshCw, Terminal, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Input, Modal, Badge } from '../../components/ui';
import { useToast } from '../../features/notifications/ToastContext';
import { checkBackendHealth } from '../../services/apiClient';

import { mockAuthService } from '../../services/mockAuthService';
import { useAuth } from '../../features/auth/AuthContext';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Basic Info State
  const [businessName, setBusinessName] = useState('Trimora Salon');
  const [businessEmail, setBusinessEmail] = useState('contact@trimora.com');
  const [businessPhone, setBusinessPhone] = useState('+44 7700 111111');
  const [address, setAddress] = useState('123 High Street, London');
  const [savingInfo, setSavingInfo] = useState(false);

  // User Management State
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    try {
      const authUsers = await mockAuthService.getAllUsers();
      setUsers(authUsers.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        role: u.role === 'owner' ? 'Owner' : u.role === 'stylist' ? 'Staff' : u.role,
        createdAt: u.createdAt.split('T')[0]
      })));
    } catch (error) {
      toast('error', 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Database Connection State
  const [dbStatus, setDbStatus] = useState<{
    serverOnline: boolean;
    neonConnected: boolean;
    message: string;
    loading: boolean;
  }>({
    serverOnline: false,
    neonConnected: false,
    message: 'Checking...',
    loading: true,
  });

  const checkDb = async () => {
    setDbStatus(prev => ({ ...prev, loading: true }));
    const status = await checkBackendHealth(true);
    setDbStatus({
      serverOnline: status.serverOnline,
      neonConnected: status.neonConnected,
      message: status.message,
      loading: false,
    });
  };

  useEffect(() => {
    fetchUsers();
    checkDb();
  }, []);
  
  // Add/Edit User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Staff');
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveBasicInfo = () => {
    setSavingInfo(true);
    setTimeout(() => {
      setSavingInfo(false);
      toast('success', 'Business information updated successfully');
    }, 800);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserPassword(password);
    setShowPassword(true); // Show it to them since it was generated
  };

  const openAddUserModal = () => {
    setEditingUserId(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('Staff');
    setShowPassword(false);
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUserId(user.id);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserPassword(''); // password hidden/blank initially when editing
    setNewUserRole(user.role);
    setShowPassword(false);
    setIsAddUserOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to completely delete this user?")) {
      try {
        await mockAuthService.adminDeleteUser(id);
        toast('success', 'User deleted successfully');
        fetchUsers();
      } catch (error: any) {
        toast('error', error.message || 'Failed to delete user');
      }
    }
  };

  const handleSaveUser = async () => {
    if (!newUserName || !newUserEmail || (!editingUserId && !newUserPassword)) {
      toast('error', 'Please fill in all required fields');
      return;
    }

    try {
      const parts = newUserName.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');

      if (editingUserId) {
        await mockAuthService.adminUpdateUser(editingUserId, {
          email: newUserEmail,
          firstName,
          lastName,
          role: newUserRole,
          ...(newUserPassword ? { password: newUserPassword } : {})
        });
        toast('success', 'User updated successfully');
      } else {
        await mockAuthService.adminCreateUser({
          email: newUserEmail,
          password: newUserPassword,
          firstName,
          lastName,
          role: newUserRole
        });
        toast('success', 'User generated and added successfully');
      }

      setIsAddUserOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast('error', error.message || 'Failed to save user');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Manage your business profile and system users.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        
        {/* Neon PostgreSQL Database Section */}
        <div className="card" style={{ padding: 'var(--space-6)', border: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <Database size={22} style={{ color: 'var(--color-accent)' }} />
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Neon PostgreSQL Backend</h2>
                {dbStatus.neonConnected ? (
                  <Badge variant="accent">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Connected to Neon
                    </span>
                  </Badge>
                ) : dbStatus.serverOnline ? (
                  <Badge variant="warning">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={13} /> Server Online (DB Pending)
                    </span>
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={13} /> Mock Fallback Active
                    </span>
                  </Badge>
                )}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Serverless PostgreSQL powered by <strong style={{ color: 'var(--color-text-primary)' }}>Neon DB</strong>. All services, bookings, customers, and staff sync to your cloud database.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={14} className={dbStatus.loading ? 'animate-spin' : ''} />}
              onClick={checkDb}
              disabled={dbStatus.loading}
            >
              Test Connection
            </Button>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Database Connection Status:</span>
              <span style={{ color: dbStatus.neonConnected ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {dbStatus.message}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              1. Add your Neon DB connection string into the project root <code style={{ color: 'var(--color-accent)', padding: '2px 6px', background: 'var(--color-bg-tertiary)', borderRadius: 4 }}>.env</code> file:
              <pre style={{ marginTop: 6, marginBottom: 8, padding: 8, background: 'var(--color-bg-primary)', borderRadius: 4, overflowX: 'auto', color: 'var(--color-text-primary)' }}>
                DATABASE_URL=postgresql://user:password@ep-your-neon-project.region.aws.neon.tech/neondb?sslmode=require
              </pre>
              2. Run migrations and seed data in your terminal:
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 6, flexWrap: 'wrap' }}>
                <code style={{ padding: '4px 8px', background: 'var(--color-bg-primary)', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Terminal size={12} /> npm run db:setup
                </code>
                <code style={{ padding: '4px 8px', background: 'var(--color-bg-primary)', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Terminal size={12} /> npm run server
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <SettingsIcon size={20} /> Basic Information
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <Input 
              label="Business Name" 
              value={businessName} 
              onChange={e => setBusinessName(e.target.value)} 
            />
            <Input 
              label="Email Address" 
              type="email" 
              value={businessEmail} 
              onChange={e => setBusinessEmail(e.target.value)} 
            />
            <Input 
              label="Phone Number" 
              value={businessPhone} 
              onChange={e => setBusinessPhone(e.target.value)} 
            />
            <Input 
              label="Address" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" leftIcon={<Save size={16} />} onClick={handleSaveBasicInfo} loading={savingInfo}>
              Save Changes
            </Button>
          </div>
        </div>

        {/* User Management Section */}
        {user?.role === 'owner' && (
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={20} /> User Management
              </h2>
              <Button variant="primary" leftIcon={<UserPlus size={16} />} onClick={openAddUserModal}>
                Generate User
              </Button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Username / Email</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>Created At</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-light)' }} className="hover-bg">
                        <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 500 }}>{u.name}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                          <Badge variant={u.role === 'Owner' || u.role === 'Admin' || u.role === 'owner' ? 'accent' : 'default'}>{u.role}</Badge>
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>{u.createdAt}</td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                            {u.id !== 'user-owner-1' ? (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)} title="Edit">
                                  <Edit2 size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} title="Delete" style={{ color: 'var(--color-error)' }}>
                                  <Trash2 size={16} />
                                </Button>
                              </>
                            ) : (
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Root Admin</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Generate / Edit User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title={editingUserId ? "Edit User" : "Generate New User"} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input 
            label="Full Name" 
            placeholder="e.g. Jane Doe" 
            value={newUserName} 
            onChange={e => setNewUserName(e.target.value)} 
            required 
          />
          <Input 
            label="Username / Email" 
            type="email" 
            placeholder="e.g. jane@trimora.com" 
            value={newUserEmail} 
            onChange={e => setNewUserEmail(e.target.value)} 
            required 
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Password
              <button 
                type="button"
                onClick={generatePassword}
                style={{ color: 'var(--color-accent)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Key size={12} /> Generate
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter or generate password"
                value={newUserPassword}
                onChange={e => setNewUserPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label className="input-label">System Permission / Role</label>
            <select 
              className="input" 
              value={newUserRole} 
              onChange={e => setNewUserRole(e.target.value)}
            >
              <option value="owner">Admin (Full Access)</option>
              <option value="manager">Manager</option>
              <option value="stylist">Staff (Limited Access)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveUser} disabled={!newUserName || !newUserEmail || (!editingUserId && !newUserPassword)}>
              {editingUserId ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}
