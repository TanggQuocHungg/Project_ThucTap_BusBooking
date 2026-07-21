import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, User, LogOut, Shield, Ticket, Bell } from 'lucide-react'; 
// 1. Gọi thư viện Cognito
import { useAuth } from "react-oidc-context"; 

function Navbar() {
  const location = useLocation();
  
  // 2. Kích hoạt bộ theo dõi trạng thái Đăng nhập từ AWS
  const auth = useAuth(); 

  // Kiểm tra trạng thái xem user đã đăng nhập qua Cognito chưa
  const isAuthenticated = auth.isAuthenticated;
  
  // Lấy thông tin user (Email hoặc Tên) từ token của Cognito trả về
  const userEmail = auth.user?.profile?.email;
  const userName = auth.user?.profile?.name || userEmail; 

  // Tạm ẩn quyền Admin vì Cognito User Pool mới tạo chưa cấu hình phân nhóm (Groups). 
  // Bạn có thể tùy chỉnh tính năng này trên AWS sau.
  const isAdmin = false; 

  // Nếu đang trong quá trình chuyển hướng hoặc tải token thì hiện chữ chờ
  if (auth.isLoading) {
    return <div style={{ padding: '15px 30px', textAlign: 'right' }}>Đang kết nối hệ thống bảo mật...</div>;
  }

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', borderBottom: '1px solid var(--border)' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Bus size={32} color="var(--primary)" />
        <h1 className="text-gradient" style={{ margin: 0 }}>BEdatxe Premium</h1>
      </Link>
      
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            {/* NÚT QUẢN TRỊ (CHỈ ADMIN) */}
            {isAdmin && (
              <Link 
                to="/admin" 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '5px', 
                  padding: '6px 12px', background: 'var(--primary)', 
                  color: 'white', textDecoration: 'none', 
                  borderRadius: '6px', fontWeight: 'bold', marginRight: '15px'
                }}
              >
                <Shield size={18} /> Quản trị
              </Link>
            )}

            {/* NÚT THÔNG BÁO CỦA TÔI */}
            <Link to="/my-notifications" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--text-muted)', marginRight: '20px', fontWeight: '500' }}>
              <Bell size={18} /> Thông báo
            </Link>

            {/* NÚT VÉ CỦA TÔI */}
            <Link to="/my-tickets" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--text-muted)', marginRight: '20px', fontWeight: '500' }}>
              <Ticket size={18} /> Vé của tôi
            </Link>

            {/* NÚT HỒ SƠ */}
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text)', marginRight: '20px', fontWeight: '500' }}>
              <User size={18} />
              Xin chào, {userName}
            </Link>
            
            {/* NÚT ĐĂNG XUẤT BẰNG COGNITO */}
            <button 
              onClick={() => auth.removeUser()} 
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            // NÚT ĐĂNG NHẬP CHUYỂN HƯỚNG TỚI GIAO DIỆN CỦA AWS COGNITO
            <button 
              onClick={() => auth.signinRedirect()} 
              className="btn-primary" 
              style={{ padding: '8px 16px', display: 'inline-block', width: 'auto', textDecoration: 'none', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
            >
              Đăng nhập
            </button>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;