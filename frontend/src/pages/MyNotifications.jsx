import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, Info, CheckCircle, XCircle } from 'lucide-react';

function MyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Backend tự động lấy userId từ token nên chỉ cần gọi /notifications
        const res = await api.get('/notifications');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setNotifications(data);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Hàm chọn icon và màu sắc dựa vào loại thông báo
  const getNotificationStyle = (type) => {
    switch(type) {
      case 'BOOKING_SUCCESS': return { icon: <CheckCircle size={24} color="#10b981" />, color: '#10b981' };
      case 'TRIP_CANCELLED': return { icon: <XCircle size={24} color="#ef4444" />, color: '#ef4444' };
      default: return { icon: <Info size={24} color="#3b82f6" />, color: '#3b82f6' };
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải thông báo...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Bell size={28} /> Thông báo của tôi
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {notifications.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
            Bạn chưa có thông báo nào.
          </div>
        ) : (
          notifications.map(noti => {
            const style = getNotificationStyle(noti.type);
            return (
              <div key={noti._id} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px', borderLeft: `4px solid ${style.color}` }}>
                <div style={{ marginTop: '2px' }}>{style.icon}</div>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>
                    {new Date(noti.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div style={{ fontSize: '16px', color: '#f8fafc', lineHeight: '1.5' }}>
                    {noti.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyNotifications;