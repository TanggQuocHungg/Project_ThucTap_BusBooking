import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Send } from 'lucide-react';

function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]); // Chứa danh sách user để chọn gửi
  const [formData, setFormData] = useState({ user: '', message: '', type: 'SYSTEM' });

  // 1. Tải dữ liệu lần đầu (đặt gọn trong useEffect để fix warning)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [notiRes, userRes] = await Promise.all([
          api.get('/notifications'),
          api.get('/users') // Gọi API lấy list user để thả vào select
        ]);
        
        setNotifications(Array.isArray(notiRes.data) ? notiRes.data : (notiRes.data?.data || []));
        setUsers(Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []));
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Hàm tải lại dữ liệu (dùng khi mới Thêm hoặc Xóa xong)
  const reloadData = async () => {
    try {
      const [notiRes, userRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/users')
      ]);
      
      setNotifications(Array.isArray(notiRes.data) ? notiRes.data : (notiRes.data?.data || []));
      setUsers(Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []));
    } catch (error) {
      console.error("Lỗi tải lại dữ liệu:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications', formData);
      alert('Gửi thông báo thành công!');
      setFormData({ ...formData, message: '' }); // Giữ lại user/type, chỉ xóa nội dung
      reloadData(); // Gọi hàm reload
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Lỗi gửi thông báo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa thông báo này?')) {
      try {
        await api.delete(`/notifications/${id}`);
        reloadData(); // Gọi hàm reload
      } catch (error) {
        console.error("Lỗi khi xóa thông báo:", error); // Fix warning 'error' unused
        alert('Lỗi khi xóa');
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Gửi Thông Báo Hệ Thống</h2>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#e2e8f0' }}>Chọn người nhận</label>
            <select name="user" value={formData.user} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}>
              <option value="" disabled>-- Chọn khách hàng --</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.fullName || u.username} ({u.email})</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#e2e8f0' }}>Loại thông báo</label>
            <select name="type" value={formData.type} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}>
              <option value="SYSTEM">Hệ thống (SYSTEM)</option>
              <option value="BOOKING_SUCCESS">Báo đặt vé (BOOKING_SUCCESS)</option>
              <option value="TRIP_CANCELLED">Hủy chuyến (TRIP_CANCELLED)</option>
            </select>
          </div>

          <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#e2e8f0' }}>Nội dung tin nhắn</label>
            <input type="text" name="message" value={formData.message} onChange={handleChange} required placeholder="Nhập nội dung thông báo..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}/>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '12px 24px', height: '43px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} /> Gửi
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Người nhận</th>
              <th style={{ padding: '12px' }}>Loại</th>
              <th style={{ padding: '12px' }}>Nội dung</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(noti => (
              <tr key={noti._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}><strong>{noti.user?.fullName || noti.user?.username || 'Không rõ'}</strong></td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: noti.type === 'SYSTEM' ? '#3b82f6' : noti.type === 'TRIP_CANCELLED' ? '#ef4444' : '#10b981', color: 'white' }}>
                    {noti.type}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{noti.message}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(noti._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Chưa có thông báo nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NotificationManager;