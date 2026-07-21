import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bus, Map, MapPin, Users, Ticket, Armchair, LogOut, Star, Bell, Home } from 'lucide-react';

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Thống kê Doanh thu' },
    { path: '/admin/stations', icon: <MapPin size={20} />, label: 'Quản lý Bến xe' },
    { path: '/admin/routes', icon: <Map size={20} />, label: 'Quản lý Tuyến đường' },
    { path: '/admin/trips', icon: <Map size={20} />, label: 'Quản lý Chuyến đi' },
    { path: '/admin/buses', icon: <Bus size={20} />, label: 'Quản lý Xe buýt' },
    { path: '/admin/seats', icon: <Armchair size={20} />, label: 'Quản lý Ghế ngồi' },
    { path: '/admin/tickets', icon: <Ticket size={20} />, label: 'Quản lý Vé xe' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Quản lý Người dùng' },
    { path: '/admin/review', icon: <Star size={20} />, label: 'Quản lý Đánh giá' },
    { path: '/admin/notification', icon: <Bell size={20} />, label: 'Gửi Thông báo' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 className="text-gradient" style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Panel</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none',
                background: location.pathname === item.path ? 'var(--primary)' : 'transparent',
                color: location.pathname === item.path ? 'white' : '#64748b',
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        {/* NÚT VỀ TRANG CHỦ ĐƯỢC CHÈN VÀO ĐÂY */}
        <Link 
          to="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#334155', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px', transition: 'all 0.3s' }}
        >
          <Home size={20} /> Về Trang Chủ
        </Link>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <LogOut size={20} /> Thoát tài khoản
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {/* Component con sẽ được render vào Outlet này dựa theo URL */}
        <Outlet /> 
      </div>
    </div>
  );
}

export default AdminLayout;