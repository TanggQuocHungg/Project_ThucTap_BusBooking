import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Star, MessageSquare, X, CreditCard } from 'lucide-react';

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnp_ResponseCode = params.get('vnp_ResponseCode');
    const vnp_TxnRef = params.get('vnp_TxnRef')

    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === '00') {
        fetch(`https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/tickets/${vnp_TxnRef}/confirm`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
           if(data.success) {
             alert('🎉 Thanh toán VNPAY thành công! Vé của bạn đã được chuyển sang ĐÃ XÁC NHẬN.');
             fetchTickets(); // Tải lại danh sách vé mới nhất từ AWS
           }
        });
      } else {
        alert('❌ Giao dịch chưa hoàn tất hoặc thất bại (Mã lỗi VNPAY: ' + vnp_ResponseCode + ')');
      }
      navigate('/my-tickets', { replace: true });
    }
  }, [location, navigate]);
  const fetchTickets = async () => {
    try {
      const [ticketsRes, tripsRes] = await Promise.all([
        fetch('https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/tickets'),
        fetch('https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/api/v1/trips')
      ]);
      
      const ticketsData = await ticketsRes.json();
      const tripsData = await tripsRes.json();
      
      if (ticketsData.success && ticketsData.data) {
        const tripMap = {};
        if (tripsData.success && tripsData.data) {
          tripsData.data.forEach(t => tripMap[t.tripId] = t);
        }
        const formattedTickets = ticketsData.data.map(item => {
          const matchedTrip = tripMap[item.tripId] || {}; 
          return {
            _id: item.ticketId,
            status: item.status,
            totalAmount: item.price,
            trip: {
              _id: item.tripId,
              departureTime: item.bookingDate, 
              route: {
                startStation: { city: matchedTrip.departure || "Hà Nội" }, 
                endStation: { city: matchedTrip.destination || "Sài Gòn" }
              }
            },
            seats: [{ seatNumber: item.seatName }]
          };
        });
        setTickets(formattedTickets.reverse());
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error("Lỗi tải vé:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handlePayment = async (ticket) => {
    try {
      const res = await fetch('https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/payments/create_payment_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: ticket.totalAmount,
          ticketId: ticket._id,
          bankCode: '' 
        })
      });

      const result = await res.json();
      
      const vnpayUrl = result.data?.url; 
      if (result.success && vnpayUrl) {
        window.location.href = vnpayUrl;
      } else {
        alert('Không lấy được link thanh toán từ hệ thống.');
      }
   } catch {
      alert('Lỗi kết nối Server khi khởi tạo thanh toán VNPay');
    }
  };

  // --- HÀM HỦY VÉ GỌI LÊN AWS ---
  const handleCancelTicket = async (ticketId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy vé này không?')) {
      try {
        const res = await fetch(`https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/tickets/${ticketId}/cancel`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.success) {
          alert('Đã hủy vé thành công!');
          fetchTickets(); 
        } else {
          alert('Lỗi: ' + data.message);
        }
     } catch {
      alert('Lỗi kết nối khi hủy vé');
    }
    }
  };
  const openReviewModal = (tripId) => {
    setSelectedTripId(tripId);
    setRating(5);
    setComment('');
    setShowModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        trip: selectedTripId,
        rating: rating,
        comment: comment
      });
      alert('Cảm ơn bạn đã đánh giá chuyến đi!');
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi gửi đánh giá (Có thể bạn đã đánh giá chuyến này rồi)');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải danh sách vé...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Ticket size={28} /> Vé của tôi
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {tickets.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Bạn chưa đặt vé nào. Hãy ra trang chủ khám phá các chuyến đi nhé!
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket._id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              
              <div style={{ flex: '1', minWidth: '300px' }}>
                <h3 style={{ color: '#f8fafc', marginBottom: '10px' }}>
                  {ticket.trip?.route?.startStation?.city} ➔ {ticket.trip?.route?.endStation?.city}
                </h3>
                <p style={{ color: '#cbd5e1', marginBottom: '5px' }}>
                  <strong>Mã vé:</strong> {ticket._id?.substring(0, 8).toUpperCase()}
                </p>
                <p style={{ color: '#cbd5e1', marginBottom: '5px' }}>
                  <strong>Thời gian:</strong> {new Date(ticket.trip?.departureTime).toLocaleString('vi-VN')}
                </p>
                <p style={{ color: '#cbd5e1', marginBottom: '5px' }}>
                  <strong>Ghế:</strong> {ticket.seats.map(s => s.seatNumber).join(', ')}
                </p>
                <p style={{ color: '#cbd5e1' }}>
                  <strong>Tổng tiền:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{ticket.totalAmount?.toLocaleString()} đ</span>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <span style={{ 
                  padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold',
                  backgroundColor: ticket.status === 'CONFIRMED' ? '#10b981' : ticket.status === 'CANCELLED' ? '#ef4444' : '#f59e0b',
                  color: 'white'
                }}>
                  {ticket.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : ticket.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'CHỜ THANH TOÁN'}
                </span>

                {/* --- CHO PHÉP HỦY CẢ VÉ CONFIRMED ĐỂ TEST --- */}
                {ticket.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => handleCancelTicket(ticket._id)} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#334155', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer', fontWeight: 'bold' }}>
                      Hủy Vé
                    </button>

                    <button onClick={() => handlePayment(ticket)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                      <CreditCard size={18} /> Thanh toán ngay
                    </button>
                  </div>
                )}

                {/* --- NÚT ĐÁNH GIÁ KHI ĐÃ CONFIRMED --- */}
                {ticket.status === 'CONFIRMED' && (
                  <button onClick={() => openReviewModal(ticket.trip?._id)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
                    <Star size={16} /> Đánh giá chuyến đi
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popup Đánh giá */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={24}/> Chấm điểm chuyến đi</h3>
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#e2e8f0', fontWeight: '500' }}>Bạn cảm thấy chuyến đi thế nào?</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} size={32} onClick={() => setRating(star)}
                      fill={star <= rating ? "#f59e0b" : "transparent"} color={star <= rating ? "#f59e0b" : "#64748b"}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: '#e2e8f0' }}>Chia sẻ trải nghiệm của bạn (Không bắt buộc)</label>
                <textarea 
                  value={comment} onChange={(e) => setComment(e.target.value)} rows="4" placeholder="Xe đi êm, tài xế thân thiện..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>
                Gửi Đánh Giá
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTickets;
