/**
 * KHỞI TẠO CÁC ROLES MẶC ĐỊNH
 * Chạy file này một lần để tạo roles: customer, driver, admin
 */

let mongoose = require('mongoose');
let roleModel = require('./schemas/roles');
require('dotenv').config();

let mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/BEdatxe';

async function initializeRoles() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(mongoURI);
        console.log('✅ Kết nối MongoDB thành công!');

        // Xóa roles cũ (nếu có)
        await roleModel.deleteMany({});
        console.log('🗑️  Xóa roles cũ...');

        // Tạo 3 roles mặc định
        const roles = [
            { name: 'customer', description: 'Khách hàng đặt vé' },
            { name: 'driver', description: 'Tài xế xe buýt' },
            { name: 'admin', description: 'Quản trị viên' }
        ];

        await roleModel.insertMany(roles);
        console.log('✅ Tạo roles thành công!');
        console.log(roles);

        // Lấy roles vừa tạo để xem ObjectId
        const allRoles = await roleModel.find();
        console.log('\n📋 Danh sách Roles trong Database:');
        allRoles.forEach(role => {
            console.log(`  - ${role.name}: ${role._id}`);
        });

        mongoose.disconnect();
        console.log('\n✅ Hoàn tất!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

initializeRoles();
