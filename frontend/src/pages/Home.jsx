import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react';

function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get('/trips');
        // Lambda của chúng ta trả về body là { success: true, data: [...] }
        setTrips(response.data.data); 
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div style={{textAlign: 'center', margin: '100px'}}>Đang tải dữ liệu chuyến xe...</div>;

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Khám phá các chuyến đi</h2>
        <p style={{ color: 'var(--text-muted)' }}>Đặt vé dễ dàng - Di chuyển nhanh chóng cùng dàn xe Premium hạng sang.</p>
      </div>

      <div className="trip-grid">
        {trips.map(trip => (
          <div key={trip.tripId} className="glass-panel trip-card">
            <h3>{trip.departure} ➔ {trip.destination}</h3>
            
            {trip.imageUrl ? (
              <img 
                src={trip.imageUrl}
                alt="Bus" 
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px', border: '1px solid #334155' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '180px', backgroundColor: '#0f172a', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                 Xe chưa cập nhật ảnh
              </div>
            )}
            
            <p><MapPin size={16} color="var(--primary)"/> Tuyến: {trip.departure} - {trip.destination}</p>
            <p><Calendar size={16} color="var(--primary)"/> Ngày đi: {trip.departureDate}</p>
            <p><Clock size={16} color="var(--primary)"/> Giờ khởi hành: {trip.departureTime}</p>
            <p><CreditCard size={16} color="var(--primary)"/> Giá vé: <strong style={{color: '#f59e0b', fontSize: '1.2rem', marginLeft: '5px'}}>{trip.price.toLocaleString()} đ</strong></p>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
               Ghế trống: {trip.availableSeats}
            </div>

            <button 
              className="btn-primary" 
              style={{ marginTop: '15px' }}
              onClick={() => navigate(`/trips/${trip.tripId}`)}
              disabled={trip.status !== 'ACTIVE'}
            >
              {trip.status === 'ACTIVE' ? 'Chọn Vị Trí Ghế' : 'Đã Khởi Hành'}
            </button>
          </div>
        ))}
        {trips.length === 0 && <p>Hiện không có chuyến xe nào đang mở bán.</p>}
      </div>
    </div>
  );
}

export default Home;
