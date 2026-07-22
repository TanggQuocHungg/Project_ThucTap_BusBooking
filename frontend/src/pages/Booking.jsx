import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripRes, ticketRes] = await Promise.all([
          fetch('https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/api/v1/trips'),
          fetch('https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/tickets') 
        ]);
        
        const tripData = await tripRes.json();
        const ticketData = await ticketRes.json();

        if (tripData.success && tripData.data) {
          const currentTrip = tripData.data.find(t => t.tripId === id);

          if (currentTrip) {
            setTrip({
              _id: currentTrip.tripId,
              name: `${currentTrip.departure} - ${currentTrip.destination}`,
              price: currentTrip.price,
              departureTime: currentTrip.departureTime,
              route: { 
                startStation: { name: currentTrip.departure }, 
                endStation: { name: currentTrip.destination } 
              },
              bus: { licensePlate: "Đang cập nhật", type: "Giường nằm" }
            });

            const bookedSeatNames = [];
            if (ticketData.success && ticketData.data) {
              ticketData.data.forEach(ticket => {
                if (ticket.tripId === id && ticket.status !== 'CANCELLED') {
                  bookedSeatNames.push(ticket.seatName);
                }
              });
            }
            const totalSeats = parseInt(currentTrip.availableSeats) || 34; 
            const rows = Math.ceil(totalSeats / 2); 
            const generatedSeats = [];
            
            for (let i = 1; i <= rows; i++) {
              generatedSeats.push({ 
                _id: `s-A${i}`, 
                seatNumber: `A${i}`, 
                status: bookedSeatNames.includes(`A${i}`) ? "BOOKED" : "AVAILABLE" 
              });          
              if (generatedSeats.length < totalSeats) {
                generatedSeats.push({ 
                  _id: `s-B${i}`, 
                  seatNumber: `B${i}`, 
                  status: bookedSeatNames.includes(`B${i}`) ? "BOOKED" : "AVAILABLE" 
                });
              }
            }
            setSeats(generatedSeats);

          } else {
            console.error("Không tìm thấy chuyến xe có mã này!");
            setTrip(null);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu chuyến xe:", error);
      }

      setLoading(false);
    };
    
    fetchData();
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeat(selectedSeat?._id === seat._id ? null : seat);
  };
  const handleBooking = async () => {
    if (!selectedSeat) return alert('Vui lòng chọn 1 ghế');
    
    alert(`Đang xử lý đặt ghế ${selectedSeat.seatNumber}... Vui lòng đợi!`);
    const bookingData = {
      tripId: trip._id, 
      userEmail: "hungtang22222@gmail.com", 
      seatName: selectedSeat.seatNumber,
      price: trip.price
    };

    try {
      const response = await fetch('https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        alert(` Đặt vé thành công! Mã vé: ${result.data.ticketId}`);
        navigate('/my-tickets'); 
      } else {
        alert('❌ Có lỗi từ server: ' + result.message);
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      alert('❌ Lỗi kết nối đến Server AWS!');
    }
  };

  if (loading) return <div style={{textAlign: 'center', margin: '100px'}}>Đang xếp ghế...</div>;
  if (!trip) return <div>Không tìm thấy chuyến đi</div>;

  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* Sơ đồ ghế */}
      <div className="glass-panel" style={{ flex: '2', padding: '30px', minWidth: '400px' }}>
        <h2 className="text-gradient" style={{ marginBottom: '20px' }}>Sơ đồ ghế ngồi</h2>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--seat-available)', borderRadius: '4px' }}></div> Còn trống
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--seat-selected)', borderRadius: '4px' }}></div> Đang chọn
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--seat-booked)', borderRadius: '4px' }}></div> Đã đặt
          </div>
        </div>

        <div className="seat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          {seats.map(seat => {
            let seatClass = 'seat-available';
            if (seat.status !== 'AVAILABLE') seatClass = 'seat-booked';
            if (selectedSeat?._id === seat._id) seatClass = 'seat-selected';

            return (
              <button 
                key={seat._id} 
                className={`seat-button ${seatClass}`}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.seatNumber}
              </button>
            )
          })}
        </div>
      </div>

      {/* Thông tin hóa đơn */}
      <div className="glass-panel" style={{ flex: '1', padding: '30px', minWidth: '300px', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h3 style={{ marginBottom: '20px' }}>Hóa đơn thanh toán</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Ghế đang chọn:</span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{selectedSeat ? selectedSeat.seatNumber : 'Chưa chọn'}</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Giá vé:</span>
          <strong>{trip.price.toLocaleString()} đ</strong>
        </div>
        
        <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <span style={{ fontSize: '1.2rem' }}>Tổng cộng:</span>
          <strong style={{ fontSize: '1.5rem', color: '#f59e0b' }}>
            {selectedSeat ? trip.price.toLocaleString() : 0} đ
          </strong>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleBooking}
          disabled={!selectedSeat}
          style={{ opacity: selectedSeat ? 1 : 0.5, width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', cursor: selectedSeat ? 'pointer' : 'not-allowed' }}
        >
          Đặt vé & Thanh toán
        </button>
      </div>

    </div>
  );
}

export default Booking;
