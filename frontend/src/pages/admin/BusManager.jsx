import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit, Image as ImageIcon, X } from 'lucide-react';

function BusManager() {
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({ licensePlate: '', type: '', capacity: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Thêm state để biết đang sửa xe nào (null nghĩa là đang Thêm mới)
  const [editingId, setEditingId] = useState(null); 

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await api.get('/buses');
        const busData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setBuses(busData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBuses();
  }, []);

  const reloadBuses = async () => {
    try {
      const res = await api.get('/buses');
      const busData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setBuses(busData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  // --- HÀM MỚI: Bấm nút Sửa ---
  const handleEdit = (bus) => {
    setEditingId(bus._id); // Đánh dấu đang sửa xe này
    setFormData({
      licensePlate: bus.licensePlate,
      type: bus.type,
      capacity: bus.capacity
    });
    setSelectedFile(null); // Reset file
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt lên form
  };

  // --- HÀM MỚI: Bấm nút Hủy sửa ---
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ licensePlate: '', type: '', capacity: '' });
    setSelectedFile(null);
  };

  // Xử lý Submit (Gộp cả Thêm mới và Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('licensePlate', formData.licensePlate);
    submitData.append('type', formData.type);
    submitData.append('capacity', formData.capacity);
    if (selectedFile) submitData.append('image', selectedFile);

    try {
      if (editingId) {
        // NẾU ĐANG SỬA -> Gọi API PUT
        await api.put(`/buses/${editingId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Cập nhật xe thành công!');
      } else {
        // NẾU KHÔNG SỬA -> Gọi API POST (Thêm mới)
        await api.post('/buses', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Thêm xe thành công!');
      }
      
      cancelEdit(); // Reset form về trạng thái ban đầu
      reloadBuses(); // Tải lại bảng
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      try {
        await api.delete(`/buses/${id}`);
        reloadBuses();
      } catch (error) {
        console.error("Lỗi xóa xe:", error);
        alert('Lỗi khi xóa');
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Xe Buýt</h2>

      {/* Form dùng chung cho Thêm Mới & Cập Nhật */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', border: editingId ? '1px solid #3b82f6' : 'none' }}>
        <h3 style={{ color: editingId ? '#3b82f6' : 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editingId ? <Edit size={20}/> : null}
          {editingId ? 'Cập Nhật Xe' : 'Thêm Xe Mới'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '20px', marginTop: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Biển số xe</label>
            <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required disabled={editingId !== null} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: editingId ? '#1e293b' : '#0f172a', color: editingId ? '#94a3b8' : 'white', cursor: editingId ? 'not-allowed' : 'text' }}/>
          </div>

          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Loại xe</label>
            <input type="text" name="type" value={formData.type} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}/>
          </div>

          <div style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Sức chứa</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}/>
          </div>

          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>{editingId ? 'Đổi ảnh xe (Bỏ qua nếu giữ nguyên)' : 'Hình ảnh xe'}</label>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '11px', border: '1px dashed #3b82f6', borderRadius: '8px', color: '#3b82f6', justifyContent: 'center' }}>
               <ImageIcon size={20} /> {selectedFile ? 'Đã chọn ảnh' : 'Tải ảnh lên'}
               <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Nhóm nút bấm */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', height: '46px', borderRadius: '8px', minWidth: '120px' }}>
              {editingId ? 'Lưu Cập Nhật' : 'Thêm Mới'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{ padding: '12px 24px', height: '46px', borderRadius: '8px', backgroundColor: '#334155', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <X size={18} /> Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bảng dữ liệu */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Hình ảnh</th>
              <th style={{ padding: '12px' }}>Biển Số</th>
              <th style={{ padding: '12px' }}>Loại Xe</th>
              <th style={{ padding: '12px' }}>Sức Chứa</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {buses.map(bus => (
              <tr key={bus._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  {bus.imageUrl ? (
                    <img src={`http://localhost:3000${bus.imageUrl}`} alt="bus" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : <span style={{ color: '#64748b' }}>Không có</span>}
                </td>
                <td style={{ padding: '12px' }}><strong>{bus.licensePlate}</strong></td>
                <td style={{ padding: '12px' }}>{bus.type}</td>
                <td style={{ padding: '12px' }}>{bus.capacity} ghế</td>
                <td style={{ padding: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  {/* NÚT SỬA */}
                  <button onClick={() => handleEdit(bus)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                    <Edit size={20} />
                  </button>
                  {/* NÚT XÓA */}
                  <button onClick={() => handleDelete(bus._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={20} />
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

export default BusManager;