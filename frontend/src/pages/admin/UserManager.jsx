import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserX } from 'lucide-react';

function UserManager() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn khóa/xóa tài khoản người dùng này?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa người dùng');
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Người Dùng</h2>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Tên người dùng</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Vai trò</th>
              <th style={{ padding: '12px' }}>Số lần đăng nhập</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={user.avatarUrl || 'https://placehold.co/100x100.png?text=Avatar'} 
                      alt="Avatar" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <strong>{user.fullName || user.username}</strong>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    background: user.role?.name === 'admin' ? '#fef3c7' : '#dbeafe', 
                    color: user.role?.name === 'admin' ? '#d97706' : '#2563eb', 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.875rem' 
                  }}>
                    {user.role?.name === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{user.loginCount || 0} lần</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(user._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Xóa / Khóa tài khoản">
                    <UserX size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Không có người dùng nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManager;