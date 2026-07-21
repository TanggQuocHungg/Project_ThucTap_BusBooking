let userModel = require('../schemas/users');
let roleModel = require('../schemas/roles');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

module.exports = {
    Register: async function (username, email, password, role, fullName) {
        let existUser = await userModel.findOne({
            $or: [{ username: username }, { email: email }],
            isDeleted: false
        });
        
        if (existUser) {
            throw new Error("Tên đăng nhập hoặc email đã tồn tại");
        }

        // Nếu role là string (tên role), tìm ObjectId của nó
        let roleId = role;
        if (typeof role === 'string') {
            let roleData = await roleModel.findOne({ name: role, isDeleted: false });
            if (!roleData) {
                throw new Error("Role '" + role + "' khong ton tai");
            }
            roleId = roleData._id;
        }

        let newItem = new userModel({
            username: username,
            email: email,
            password: password,
            role: roleId,
            fullName: fullName
        });
        
        await newItem.save();
        return newItem;
    },

    Login: async function (username, password) {
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        }).populate('role');

        if (!user) {
            throw new Error("thong tin dang nhap khong dung");
        }
        if (user.lockTime > Date.now()) {
            throw new Error("ban dang bi ban");
        }

        if (bcrypt.compareSync(password, user.password)) {
            user.loginCount = 0;
            await user.save();
            
            // --- ĐÃ SỬA LỖI Ở ĐÂY ---
            // Lấy chìa khóa từ file .env cho đồng bộ với file authHandler
            const secretKey = (process.env.JWT_SECRET || 'secret').trim();
            
            let token = jwt.sign({
                id: user._id,
                role: user.role.name
            }, secretKey, { // Dùng secretKey thay vì chữ 'secret'
                expiresIn: '1d'
            });
            // -------------------------

            return { token: token, user: user };
        } else {
            user.loginCount++;
            if (user.loginCount == 3) {
                user.loginCount = 0;
                user.lockTime = Date.now() + 3600 * 1000;
            }
            await user.save();
            throw new Error("thong tin dang nhap khong dung");
        }
    }
};