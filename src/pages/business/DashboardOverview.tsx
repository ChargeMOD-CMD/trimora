import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, TrendingUp, DollarSign, Star, Download, FileText, FileSpreadsheet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { trimoraDashboardApi, trimoraBookingApi } from '../../services/trimoraApi';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/notifications/ToastContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { KpiCard, Button, StatusBadge, Skeleton, Modal } from '../../components/ui';
import { formatTime12 } from '../../utils/availability';

// Mock chart data for Trimora
const revenueData = [
  { name: 'Mon', value: 940 },
  { name: 'Tue', value: 1120 },
  { name: 'Wed', value: 1050 },
  { name: 'Thu', value: 1400 },
  { name: 'Fri', value: 1950 },
  { name: 'Sat', value: 2450 },
  { name: 'Sun', value: 1800 },
];

const serviceData = [
  { name: 'Classic Cut', count: 42 },
  { name: 'Balayage', count: 28 },
  { name: 'Styling', count: 25 },
  { name: 'Full Colour', count: 18 },
  { name: 'Beard Trim', count: 15 },
];

export default function DashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalCustomers: 0,
    activeStylists: 0,
    totalServices: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    avgRating: 4.9,
  });
  const [upcomingApts, setUpcomingApts] = useState<any[]>([]);

  // Report Modal State
  const { toast } = useToast();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsReportModalOpen(false);
      
      const fileName = `Trimora_Report_${new Date().toISOString().split('T')[0]}`;
      const data = [
        ["Metric", "Value"],
        ["Total Appointments", stats.totalAppointments],
        ["Today's Appointments", stats.todayAppointments],
        ["Total Customers", stats.totalCustomers],
        ["Total Revenue", `₹${stats.totalRevenue}`],
        ["Today's Revenue", `₹${stats.todayRevenue}`],
        ["Average Rating", `${stats.avgRating} Stars`]
      ];

      if (reportFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Trimora Performance Report", 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        autoTable(doc, {
          startY: 40,
          head: [data[0]],
          body: data.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [0, 0, 0] }
        });
        
        doc.save(`${fileName}.pdf`);
      } 
      else if (reportFormat === 'xlsx') {
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }
      else if (reportFormat === 'csv') {
        let content = `Metric,Value\nTotal Appointments,${stats.totalAppointments}\nToday's Appointments,${stats.todayAppointments}\nTotal Customers,${stats.totalCustomers}\nTotal Revenue,${stats.totalRevenue}\nToday's Revenue,${stats.todayRevenue}\nAverage Rating,${stats.avgRating}`;
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      toast('success', `Report successfully downloaded as .${reportFormat}!`);
    }, 1500);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const dashboardStats = await trimoraDashboardApi.getDashboardStats();
      const allApts = await trimoraBookingApi.getAllAppointments();
      const today = new Date().toISOString().split('T')[0];
      
      const todayApts = allApts.filter(a => a.participants[0].startTime.startsWith(today) && a.status !== 'cancelled');
      
      setStats(dashboardStats);
      
      // Sort upcoming by time
      const sortedToday = todayApts.sort((a, b) => 
        new Date(a.participants[0].startTime).getTime() - new Date(b.participants[0].startTime).getTime()
      );
      
      setUpcomingApts(sortedToday.slice(0, 5));
      setLoading(false);
    };
    
    loadData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 'var(--space-6)' }}>
          <Skeleton height={32} width={200} style={{ marginBottom: 'var(--space-6)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height={120} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
            <Skeleton height={400} />
            <Skeleton height={400} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Welcome back, {user?.firstName}</h1>
            <p className="page-subtitle">Here's what's happening at Trimora today.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" leftIcon={<Calendar size={16} />}>Date: Today</Button>
            <Button variant="primary" leftIcon={<TrendingUp size={16} />} onClick={() => setIsReportModalOpen(true)}>Generate Report</Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <KpiCard 
          label="Today's Appointments" 
          value={stats.todayAppointments} 
          icon={<Calendar size={20} />} 
          change={12} 
          changeLabel="vs yesterday" 
        />
        <KpiCard 
          label="Today's Revenue" 
          value={`₹${stats.todayRevenue.toLocaleString()}`} 
          icon={<DollarSign size={20} />} 
          change={8.5} 
          changeLabel="vs yesterday" 
        />
        <KpiCard 
          label="Total Customers" 
          value={stats.totalCustomers} 
          icon={<Users size={20} />} 
          change={4.2} 
          changeLabel="this month" 
        />
        <KpiCard 
          label="Average Rating" 
          value={stats.avgRating} 
          icon={<Star size={20} />} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Chart */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Revenue Overview</h3>
            <select className="input" style={{ width: 'auto', height: 32, padding: '0 32px 0 12px', fontSize: 'var(--text-xs)' }}>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-lg)' }}
                  itemStyle={{ color: 'var(--color-accent)', fontWeight: 600 }}
                  formatter={(val: unknown) => [`₹${val}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Up Next</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-2) 0' }}>
            {upcomingApts.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No more appointments today.
              </div>
            ) : (
              upcomingApts.map((apt, i) => {
                const timeStr = apt.participants[0].startTime.split('T')[1].substring(0, 5);
                const time = formatTime12(timeStr);
                return (
                  <div key={apt.id} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)', borderBottom: i < upcomingApts.length - 1 ? '1px solid var(--color-border-light)' : 'none', cursor: 'pointer' }} className="hover-bg">
                    <div style={{ width: 60, textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{time}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{apt.participants[0].durationMins}m</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{apt.participants[0].personName}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>With {apt.participants[0].staffId}</div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge status={apt.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Top Services</h3>
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'var(--color-surface-2)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Recent Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[
              { text: 'New booking: Emma Harrington for Balayage', time: '10 mins ago', type: 'booking' },
              { text: 'Payment received: ₹188.00 via Card', time: '25 mins ago', type: 'payment' },
              { text: 'Review: 5 stars from Layla Hassan', time: '1 hour ago', type: 'review' },
              { text: 'Customer joined waitlist: Sophia Patel', time: '2 hours ago', type: 'waitlist' },
            ].map((activity, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: activity.type === 'booking' ? 'var(--color-success)' : activity.type === 'payment' ? 'var(--color-accent)' : activity.type === 'review' ? 'var(--color-gold)' : 'var(--color-warning)', marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{activity.text}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Generate Report" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Select the format you want to download the performance report in.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <button 
              className={`btn ${reportFormat === 'pdf' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ justifyContent: 'flex-start', padding: 'var(--space-3)' }}
              onClick={() => setReportFormat('pdf')}
            >
              <FileText size={18} style={{ marginRight: 'var(--space-2)' }} />
              PDF Document (.pdf)
            </button>
            <button 
              className={`btn ${reportFormat === 'csv' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ justifyContent: 'flex-start', padding: 'var(--space-3)' }}
              onClick={() => setReportFormat('csv')}
            >
              <FileSpreadsheet size={18} style={{ marginRight: 'var(--space-2)' }} />
              CSV Data (.csv)
            </button>
            <button 
              className={`btn ${reportFormat === 'xlsx' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ justifyContent: 'flex-start', padding: 'var(--space-3)' }}
              onClick={() => setReportFormat('xlsx')}
            >
              <FileSpreadsheet size={18} style={{ marginRight: 'var(--space-2)' }} />
              Excel Spreadsheet (.xlsx)
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDownloadReport} loading={isDownloading} leftIcon={<Download size={16} />}>Download</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
