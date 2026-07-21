import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2 } from 'lucide-react';

function StationManager() {
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({ name: '', address: '', city: '' });

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
    fetchStations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stations', formData);
      alert('Thêm bến xe thành công!');
      setFormData({ name: '', address: '', city: '' });
      fetchStations();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thêm bến xe');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bến xe này?')) {
      try {
        await api.delete(`/stations/${id}`);
        fetchStations();
      } catch (err) {
        alert('Lỗi khi xóa bến xe');
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Bến Xe</h2>

      {/* Form thêm mới */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3>Thêm Bến Xe Mới</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', marginTop: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

          <div style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Tên bến xe</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="VD: Bến xe Miền Đông..."
            />
          </div>

          <div style={{ flex: '3 1 250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập địa chỉ chi tiết..."
            />
          </div>

          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Thành phố</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="VD: Hồ Chí Minh..."
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '12px 24px',
              height: '46px', // Khóa cứng chiều cao bằng với input
              borderRadius: '8px',
              fontWeight: 'bold',
              minWidth: '120px',
              cursor: 'pointer'
            }}
          >
            Thêm Mới
          </button>
        </form>
      </div>

      {/* Bảng dữ liệu */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Tên bến</th>
              <th style={{ padding: '12px' }}>Thành phố</th>
              <th style={{ padding: '12px' }}>Địa chỉ</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(station => (
              <tr key={station._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}><strong>{station.name}</strong></td>
                <td style={{ padding: '12px' }}>{station.city}</td>
                <td style={{ padding: '12px' }}>{station.address}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(station._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {stations.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Chưa có bến xe nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StationManager;