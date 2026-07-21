import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../services/api';

function TripManager() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    route: '',
    bus: '',
    departureTime: '',
    arrivalTime: '',
    price: ''
  });

  const fetchData = async () => {
    try {
      const [tripsRes, routesRes, busesRes] = await Promise.all([
        api.get('/trips'),
        api.get('/routes'),
        api.get('/buses')
      ]);
      setTrips(tripsRes.data?.data || []);
      setRoutes(routesRes.data?.data || []);
      setBuses(busesRes.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.route || !formData.bus || !formData.departureTime || !formData.arrivalTime || !formData.price) {
      return alert('Vui lòng nhập đầy đủ thông tin');
    }
    
    // Kiểm tra logic thời gian
    if (new Date(formData.departureTime) >= new Date(formData.arrivalTime)) {
      return alert('Thời gian khởi hành phải nhỏ hơn thời gian đến');
    }

    try {
      await api.post('/trips', {
        route: formData.route,
        bus: formData.bus,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        price: Number(formData.price)
      });
      alert('Thêm chuyến đi thành công');
      setFormData({ route: '', bus: '', departureTime: '', arrivalTime: '', price: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')) return;
    try {
      await api.delete(`/trips/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi xóa');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Chuyến Đi</h2>

      {/* Form Tạo Chuyến Đi */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Thêm Chuyến Đi Mới</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div className="input-group">
            <label>Tuyến đường</label>
            <select value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})}>
              <option value="">-- Chọn tuyến đường --</option>
              {routes.map(r => (
                <option key={r._id} value={r._id}>
                  {r.startStation?.name} → {r.endStation?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Xe Buýt</label>
            <select value={formData.bus} onChange={e => setFormData({...formData, bus: e.target.value})}>
              <option value="">-- Chọn xe buýt --</option>
              {buses.map(b => (
                <option key={b._id} value={b._id}>
                  {b.licensePlate} ({b.capacity} ghế)
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Thời gian khởi hành</label>
            <input type="datetime-local" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Thời gian đến</label>
            <input type="datetime-local" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Giá vé (VNĐ)</label>
            <input type="number" placeholder="Nhập giá vé..." value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '20px' }}>
            <button type="submit" className="btn-primary">Thêm Mới</button>
          </div>

        </form>
      </div>

      {/* Danh sách chuyến đi */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Tuyến đường</th>
              <th style={{ padding: '12px' }}>Xe buýt</th>
              <th style={{ padding: '12px' }}>Khởi hành</th>
              <th style={{ padding: '12px' }}>Trạng thái</th>
              <th style={{ padding: '12px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '12px', textAlign: 'center' }}>Chưa có dữ liệu</td></tr>
            ) : trips.map(t => (
              <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px' }}>{t.route?.startStation?.name} → {t.route?.endStation?.name}</td>
                <td style={{ padding: '12px' }}>{t.bus?.licensePlate} ({t.bus?.capacity} ghế)</td>
                <td style={{ padding: '12px' }}>
                  {new Date(t.departureTime).toLocaleDateString('vi-VN')} {new Date(t.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                    background: t.status === 'PENDING' ? '#f59e0b' : t.status === 'COMPLETED' ? '#10b981' : '#f43f5e'
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleDelete(t._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TripManager;
