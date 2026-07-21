import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Ticket, Users } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalTickets: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Kéo dữ liệu từ 2 API về để thống kê
        const [ticketsRes, usersRes] = await Promise.all([
          api.get('/tickets'),
          api.get('/users')
        ]);

        // FIX LỖI REDUCE: Đảm bảo dữ liệu luôn là Mảng (Array)
        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : (ticketsRes.data?.data || []);
        const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);

        // Tính tổng doanh thu (Chỉ cộng tiền những vé không bị Hủy)
        const revenue = tickets.reduce((sum, t) => {
          return t.status !== 'CANCELLED' ? sum + t.totalAmount : sum;
        }, 0);

        setStats({
          totalRevenue: revenue,
          totalTickets: tickets.length,
          totalUsers: users.length
        });
      } catch (error) {
        console.error("Lỗi lấy thống kê", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Đang tính toán dữ liệu...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Tổng quan hệ thống</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {/* Card Doanh Thu */}
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Tổng Doanh Thu</p>
              <h3 style={{ fontSize: '2rem', color: '#10b981' }}>{stats.totalRevenue.toLocaleString()} đ</h3>
            </div>
            <div style={{ background: '#d1fae5', padding: '16px', borderRadius: '50%' }}>
              <DollarSign color="#10b981" size={32} />
            </div>
          </div>
        </div>

        {/* Card Số Vé */}
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Vé Đã Bán</p>
              <h3 style={{ fontSize: '2rem', color: '#3b82f6' }}>{stats.totalTickets} vé</h3>
            </div>
            <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '50%' }}>
              <Ticket color="#3b82f6" size={32} />
            </div>
          </div>
        </div>

        {/* Card Người Dùng */}
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Khách Hàng</p>
              <h3 style={{ fontSize: '2rem', color: '#f59e0b' }}>{stats.totalUsers} người</h3>
            </div>
            <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '50%' }}>
              <Users color="#f59e0b" size={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;