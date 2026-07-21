import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2 } from 'lucide-react';

function RouteManager() {
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({ startStation: '', endStation: '', distance: '', basePrice: '' });

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRoutes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchStations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startStation === formData.endStation) {
      return alert('Điểm đi và điểm đến không được trùng nhau');
    }
    
    try {
      await api.post('/routes', formData);
      alert('Thêm tuyến đường thành công!');
      setFormData({ startStation: '', endStation: '', distance: '', basePrice: '' });
      fetchRoutes();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thêm tuyến đường');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tuyến đường này?')) {
      try {
        await api.delete(`/routes/${id}`);
        fetchRoutes();
      } catch (err) {
        alert('Lỗi khi xóa tuyến đường');
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Tuyến Đường</h2>

      {/* Form thêm mới */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3>Thêm Tuyến Đường Mới</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div>
            <label>Điểm đi</label>
            <select name="startStation" value={formData.startStation} onChange={handleChange} required style={{width: '100%', padding: '12px'}}>
              <option value="">-- Chọn bến đi --</option>
              {stations.map(station => (
                <option key={station._id} value={station._id}>{station.name} ({station.city})</option>
              ))}
            </select>
          </div>
          <div>
            <label>Điểm đến</label>
            <select name="endStation" value={formData.endStation} onChange={handleChange} required style={{width: '100%', padding: '12px'}}>
              <option value="">-- Chọn bến đến --</option>
              {stations.map(station => (
                <option key={station._id} value={station._id}>{station.name} ({station.city})</option>
              ))}
            </select>
          </div>
          <div>
            <label>Khoảng cách (km)</label>
            <input type="number" name="distance" value={formData.distance} onChange={handleChange} required min="1" style={{width: '100%'}}/>
          </div>
          <div>
            <label>Giá cơ bản (VNĐ)</label>
            <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required min="0" style={{width: '100%'}}/>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Thêm Tuyến Đường</button>
          </div>
        </form>
      </div>

      {/* Bảng dữ liệu */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Tuyến đường</th>
              <th style={{ padding: '12px' }}>Khoảng cách</th>
              <th style={{ padding: '12px' }}>Giá cơ bản</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  <strong>{route.startStation?.name}</strong> → <strong>{route.endStation?.name}</strong>
                </td>
                <td style={{ padding: '12px' }}>{route.distance} km</td>
                <td style={{ padding: '12px' }}>{route.basePrice?.toLocaleString()} đ</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(route._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Chưa có tuyến đường nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RouteManager;