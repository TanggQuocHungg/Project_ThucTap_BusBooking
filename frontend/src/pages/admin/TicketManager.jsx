import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

function TicketManager() {
  const [tickets, setTickets] = useState([]);

  // Dùng useCallback để tránh lỗi cảnh báo ESLint của React
  const fetchTickets = useCallback(async () => {
    try {
      const res = await api.get('/tickets');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      // Chỉ gửi đúng status lên Backend (CONFIRMED hoặc CANCELLED)
      await api.put(`/tickets/${ticketId}`, { status: newStatus });
      fetchTickets(); // Cập nhật lại danh sách vé sau khi đổi trạng thái
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 'bold' }}>Đã xác nhận</span>;
      case 'CANCELLED':
        return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 'bold' }}>Đã hủy</span>;
      default:
        return <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 'bold' }}>Đang chờ</span>;
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Vé</h2>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Khách hàng</th>
              <th style={{ padding: '12px' }}>Chuyến đi</th>
              <th style={{ padding: '12px' }}>Ghế</th>
              <th style={{ padding: '12px' }}>Tổng tiền</th>
              <th style={{ padding: '12px' }}>Trạng thái</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  {ticket.user?.fullName || ticket.user?.username || 'Khách'}
                  <br/>
                  <small style={{ color: 'var(--text-muted)' }}>{ticket.user?.email}</small>
                </td>
                <td style={{ padding: '12px' }}>
                  {ticket.trip?.route?.startStation?.name || 'N/A'} → {ticket.trip?.route?.endStation?.name || 'N/A'}
                </td>
                <td style={{ padding: '12px' }}>
                  {ticket.seats?.map(s => s.seatNumber).join(', ')}
                </td>
                <td style={{ padding: '12px' }}>
                  <strong style={{ color: '#f59e0b' }}>{ticket.totalAmount?.toLocaleString()} đ</strong>
                </td>
                <td style={{ padding: '12px' }}>
                  {getStatusBadge(ticket.status)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {ticket.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleUpdateStatus(ticket._id, 'CONFIRMED')}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                      >Xác nhận</button>
                      <button 
                        onClick={() => handleUpdateStatus(ticket._id, 'CANCELLED')}
                        style={{ padding: '6px 12px', fontSize: '0.875rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >Hủy</button>
                    </div>
                  )}
                  {ticket.status !== 'PENDING' && (
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Không có</span>
                  )}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Chưa có vé nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketManager;