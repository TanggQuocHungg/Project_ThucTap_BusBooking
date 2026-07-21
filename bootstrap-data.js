/**
 * KHỞI TẠO DỮ LIỆU MẪU ĐỂ TEST
 * Chạy file này một lần để có dummy data
 */

let mongoose = require('mongoose');
let stationModel = require('./schemas/stations');
let busModel = require('./schemas/buses');
let routeModel = require('./schemas/routes');
let tripModel = require('./schemas/trips');
let seatModel = require('./schemas/seats');
require('dotenv').config();

let mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/BEdatxe';

async function generateData() {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Ket noi MongoDB thanh cong!');

        // Xóa data cũ
        await stationModel.deleteMany({});
        await busModel.deleteMany({});
        await routeModel.deleteMany({});
        await tripModel.deleteMany({});
        await seatModel.deleteMany({});
        console.log('🗑️ Xoa data cu...');

        // 1. Tạo 2 Bến Xe
        let stationHN = await stationModel.create({
            name: "Bến xe Mỹ Đình",
            address: "Số 20 Phạm Hùng",
            city: "Hà Nội"
        });
        let stationHCM = await stationModel.create({
            name: "Bến xe Miền Đông",
            address: "Số 292 Đinh Bộ Lĩnh",
            city: "Hồ Chí Minh"
        });
        console.log('✅ Tao Ben Xe...');

        // 2. Tạo 1 Tuyến đường
        let routeHN_HCM = await routeModel.create({
            startStation: stationHN._id,
            endStation: stationHCM._id,
            distance: 1700,
            basePrice: 500000
        });
        console.log('✅ Tao Tuyen Duong...');

        // 3. Tạo 1 Xe Bus
        let busVIP = await busModel.create({
            licensePlate: "29B-999.99",
            type: "SLEEPER_34",
            capacity: 34
        });
        console.log('✅ Tao Xe...');

        // 4. Tạo 1 Chuyến đi
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        let returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 3);

        let tripVIP = await tripModel.create({
            route: routeHN_HCM._id,
            bus: busVIP._id,
            departureTime: tomorrow,
            arrivalTime: returnDate,
            price: 550000,
            status: "PENDING"
        });
        console.log('✅ Tao Chuyen Di...');

        // 5. Tạo Sơ đồ ghế (Giả lập 4 ghế đầu)
        let seats = [
            { trip: tripVIP._id, seatNumber: 'A1', status: 'AVAILABLE' },
            { trip: tripVIP._id, seatNumber: 'A2', status: 'AVAILABLE' },
            { trip: tripVIP._id, seatNumber: 'B1', status: 'AVAILABLE' },
            { trip: tripVIP._id, seatNumber: 'B2', status: 'AVAILABLE' },
        ];
        await seatModel.insertMany(seats);
        console.log('✅ Tao 4 Ghe cho Chuyen Di...');

        console.log('\n--- THÔNG TIN CHUẨN BỊ CHO TEST ĐẶT VÉ ---');
        console.log(`> Trip ID: ${tripVIP._id}`);
        let allSeats = await seatModel.find({ trip: tripVIP._id });
        console.log(`> ID Ghế A1: ${allSeats[0].id}`);
        console.log(`> Giá vé: ${tripVIP.price}`);
        console.log('-------------------------------------------\n');

        mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Loi:', err.message);
        process.exit(1);
    }
}

generateData();
