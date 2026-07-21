let jwt = require('jsonwebtoken');
let userModel = require('../schemas/users');

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            // 1. Lấy token từ header Authorization
            let token = req.headers.authorization;
            if (!token || !token.startsWith("Bearer ")) { // Chú ý có dấu cách sau chữ Bearer
                return res.status(401).send({ message: "Bạn chưa đăng nhập hoặc không gửi kèm Token" });
            }
            
            // 2. Cắt bỏ chữ "Bearer " để lấy chuỗi token
            token = token.split(" ")[1];
            
            // 3. Giải mã token (Trim để chống khoảng trắng thừa trong file .env)
            const secretKey = (process.env.JWT_SECRET || 'secret').trim();
            let result = jwt.verify(token, secretKey);

            // 4. Tìm user (Hỗ trợ cả 2 trường hợp payload lưu id hoặc _id)
            const userId = result.id || result._id;
            let user = await userModel.findOne({ _id: userId, isDeleted: false }).populate('role');
            
            if (!user) {
                return res.status(401).send({ message: "Tài khoản không tồn tại hoặc đã bị xóa" });
            }

            // 5. Gắn thông tin user vào req
            req.user = user;
            next();
        } catch (error) {
            console.error("Lỗi JWT Verify:", error.message); // In lỗi ra Terminal để dễ debug
            return res.status(401).send({ message: "Token không hợp lệ hoặc đã hết hạn" });
        }
    },

    CheckRole: function (...requiredRole) {
        return function (req, res, next) {
            if (!req.user || !req.user.role) {
                return res.status(403).send({ message: "Không tìm thấy thông tin quyền của User" });
            }

            let currentRole = req.user.role.name;
            if (requiredRole.includes(currentRole)) {
                next();
                return;
            }
            return res.status(403).send({ message: "Bạn không có quyền thực hiện hành động này" });
        }
    }
}