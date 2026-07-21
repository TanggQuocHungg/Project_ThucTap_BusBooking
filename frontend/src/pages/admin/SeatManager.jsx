import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function SeatManager() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [seats, setSeats] = useState([]);

  // 1. Tải danh sách chuyến đi lúc mới vào trang
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/trips');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setTrips(data);
      } catch (err) {
        console.error("Lỗi tải chuyến đi:", err);
      }
    };
    fetchTrips();
  }, []);

  // 2. Hàm load ghế ban đầu (Nằm gọn trong useEffect để fix sạch mọi cảnh báo)
  useEffect(() => {
    const loadSeats = async () => {
      if (!selectedTrip) {
        setSeats([]);
        return;
      }
      try {
        // Đã sửa thành tripId để khớp tuyệt đối với Backend
        const res = await api.get(`/seats?tripId=${selectedTrip}`);
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSeats(data);
      } catch (err) {
        console.error("Lỗi tải ghế:", err);
      }
    };
    loadSeats();
  }, [selectedTrip]);

  // 3. Hàm tải lại ghế dùng cho nút Click Khóa/Mở ghế
  const reloadSeats = async () => {
    if (!selectedTrip) return;
    try {
      const res = await api.get(`/seats?tripId=${selectedTrip}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSeats(data);
    } catch (err) {
      console.error("Lỗi tải lại ghế:", err);
    }
  };

  // 4. Tính năng Admin Click để đổi trạng thái ghế
  const handleSeatClick = async (seat) => {
    if (seat.status === 'BOOKED') {
      alert('Ghế này đã được khách mua, không thể thay đổi!');
      return;
    }

    const newStatus = seat.status === 'AVAILABLE' ? 'HOLD' : 'AVAILABLE';
    const confirmMsg = newStatus === 'HOLD' 
      ? `Bạn có muốn KHÓA (bảo trì) ghế ${seat.seatNumber} không?`
      : `Bạn có muốn MỞ KHÓA ghế ${seat.seatNumber} cho khách đặt không?`;

    if (window.confirm(confirmMsg)) {
      try {
        await api.put(`/seats/${seat._id}`, { status: newStatus });
        reloadSeats(); // Cập nhật lại sơ đồ sau khi đổi thành công
      } catch (error) {
        alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái ghế');
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Quản lý Ghế Ngồi</h2>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '16px' }}>Chọn Chuyến Đi</h3>
        <select 
          value={selectedTrip} 
          onChange={(e) => setSelectedTrip(e.target.value)} 
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
        >
          <option value="">-- Chọn 1 chuyến đi để xem sơ đồ --</option>
          {trips.map(trip => (
            <option key={trip._id} value={trip._id}>
              {new Date(trip.departureTime).toLocaleDateString('vi-VN')} - {new Date(trip.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
              {' | '} {trip.route?.startStation?.name} → {trip.route?.endStation?.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTrip && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Sơ đồ ghế (Click vào ghế trống để Khóa/Bảo trì)</h3>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: 'var(--seat-available)', borderRadius: '4px' }}></div> Còn trống
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ width: '20px', height: '20px', background: 'var(--seat-selected)', borderRadius: '4px' }}></div> Giữ chỗ / Bảo trì
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: 'var(--seat-booked)', borderRadius: '4px' }}></div> Đã bán
            </div>
          </div>

          <div className="seat-grid">
            {seats.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có ghế nào hoặc hệ thống chưa tạo</p>
            ) : (
              seats.map(seat => {
                let seatClass = 'seat-available';
                if (seat.status === 'BOOKED') seatClass = 'seat-booked';
                if (seat.status === 'HOLD') seatClass = 'seat-selected'; 
                
                return (
                  <button 
                    key={seat._id} 
                    className={`seat-button ${seatClass}`} 
                    title={`Trạng thái: ${seat.status}`}
                    onClick={() => handleSeatClick(seat)}
                    style={{ cursor: seat.status === 'BOOKED' ? 'not-allowed' : 'pointer' }}
                  >
                    {seat.seatNumber}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatManager;