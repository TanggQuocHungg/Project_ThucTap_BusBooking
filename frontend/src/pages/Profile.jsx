import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Đường dẫn tới file cấu hình axios 
import { Link } from 'react-router-dom'; 
import { ArrowLeft } from 'lucide-react';

function Profile() {
  // Lấy thông tin user hiện tại từ localStorage (tùy cách bạn lưu lúc login)
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const userId = currentUser._id;

  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Tải dữ liệu user khi vào trang
  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        const data = res.data.data;
        setFormData({ fullName: data.fullName || '', email: data.email || '' });
        
        // Nếu Backend trả về URL ảnh thì ghép với domain của Backend để hiển thị
        if (data.avatarUrl) {
          setAvatarUrl(`[https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com](https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com)${data.avatarUrl}`);
        }
      } catch (error) {
        console.error('Lỗi tải thông tin:', error);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Xử lý khi chọn file ảnh mới
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL tạm thời để preview ảnh ngay lập tức mà chưa cần upload
      setAvatarUrl(URL.createObjectURL(file)); 
    }
  };

  // 3. Gửi API cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${userId}`, formData);
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('avatar', selectedFile); 

        await api.post(`/users/${userId}/avatar`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      const updatedUserRes = await api.get(`/users/${userId}`);
      localStorage.setItem('user', JSON.stringify(updatedUserRes.data.data));
      alert('Cập nhật hồ sơ thành công!');
      window.location.reload(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* NÚT QUAY LẠI TRANG CHỦ ĐÃ ĐƯỢC CHÈN Ở ĐÂY */}
      <Link 
        to="/" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3b82f6', textDecoration: 'none', marginBottom: '20px', fontWeight: '500', fontSize: '15px' }}
      >
        <ArrowLeft size={18} /> Quay lại trang chủ
      </Link>

      <h2 style={{ marginBottom: '24px' }}>Hồ Sơ Của Tôi</h2>

      <div className="glass-panel" style={{ padding: '32px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Cột trái: Ảnh đại diện */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%', 
            backgroundColor: '#1e293b', 
            border: '2px dashed #475569',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#94a3b8' }}>Chưa có ảnh</span>
            )}
          </div>
          
          {/* Nút giả lập để click chọn file đẹp hơn */}
          <label style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Chọn ảnh mới
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} // Ẩn thẻ input thật đi
            />
          </label>
        </div>

        {/* Cột phải: Form thông tin */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Họ và Tên</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
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
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
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
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ 
                padding: '14px 24px', 
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Profile;