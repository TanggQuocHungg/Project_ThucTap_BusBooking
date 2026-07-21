import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Star } from 'lucide-react';

function ReviewManager() {
  const [reviews, setReviews] = useState([]);

  // Hàm tải dữ liệu lúc mới vào trang (đặt gọn trong useEffect để fix warning)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setReviews(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, []);

  // Hàm tải lại dữ liệu dùng cho các thao tác khác (như sau khi xóa)
  const reloadReviews = async () => {
    try {
      const res = await api.get('/reviews');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setReviews(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await api.delete(`/reviews/${id}`);
        reloadReviews();
      } catch (error) {
        console.error("Lỗi xóa đánh giá:", error); // Fix warning 'error' is defined but never used
        alert('Lỗi khi xóa đánh giá');
      }
    }
  };

  // Hàm vẽ ngôi sao
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star key={index} size={16} fill={index < rating ? "#f59e0b" : "transparent"} color={index < rating ? "#f59e0b" : "#475569"} />
    ));
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Đánh giá (Reviews)</h2>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px' }}>Khách hàng</th>
              <th style={{ padding: '12px' }}>Đánh giá</th>
              <th style={{ padding: '12px' }}>Bình luận</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  <strong>{review.user?.fullName || review.user?.username || 'User ẩn danh'}</strong>
                </td>
                <td style={{ padding: '12px', display: 'flex', gap: '2px' }}>
                  {renderStars(review.rating)}
                </td>
                <td style={{ padding: '12px', maxWidth: '300px', wordWrap: 'break-word' }}>
                  {review.comment || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Không có bình luận</span>}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(review._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Chưa có đánh giá nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReviewManager;