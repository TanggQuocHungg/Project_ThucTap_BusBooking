import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LogIn, UserPlus } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', fullName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', {
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        navigate('/');
      } else {
        await api.post('/auth/register', formData); // Backend tu dong set role='customer'
        setIsLogin(true); // Switch to login after register
        alert('Đăng ký thành công! Hãy đăng nhập.');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto' }}>
      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }} className="text-gradient">
          {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
        </h2>
        
        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input type="text" name="username" required value={formData.username} onChange={handleChange} />
          </div>
          
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Họ và tên</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Mật khẩu</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {isLogin ? <><LogIn size={20}/> Đăng nhập</> : <><UserPlus size={20}/> Đăng ký</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
