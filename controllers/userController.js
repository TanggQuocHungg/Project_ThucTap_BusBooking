let userModel = require('../schemas/users')
let roleModel = require('../schemas/roles')

module.exports = {
    CreateAnUser: async function (username, email, password, role, fullName) {
        try {
            // 1. VALIDATE: Kiểm tra username hoặc email đã tồn tại
            let existItem = await userModel.findOne({
                $or: [{ username: username }, { email: email }],
                isDeleted: false
            })
            if (existItem) {
                throw new Error("Username hoặc email đã tồn tại");
            }

            // 2. VALIDATE: Nếu role là string (tên role), tìm ObjectId của nó
            let roleId = role;
            if (typeof role === 'string') {
                let roleData = await roleModel.findOne({ name: role, isDeleted: false });
                if (!roleData) {
                    throw new Error("Role '" + role + "' không tồn tại");
                }
                roleId = roleData._id;
            }

            let newItem = new userModel({
                username: username,
                email: email,
                password: password, // Mongoose hook sẽ tự hash
                role: roleId,
                fullName: fullName
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllUsers: async function () {
        return await userModel.find({
            isDeleted: false
        }).populate('role', 'name')
    },

    GetAnUserById: async function (id) {
        let result = await userModel.findOne({
            isDeleted: false,
            _id: id
        }).populate('role', 'name')
        
        if (result) {
            return result;
        }
        return false;
    },

    UpdateAnUser: async function (id, updateData) {
        // VALIDATE: Chỉ cho update email, fullName, avatarUrl
        let allowedFields = ['email', 'fullName', 'avatarUrl'];
        let cleanData = {};
        
        for (let field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }

        // Nếu update email, kiểm tra không trùng với user khác
        if (cleanData.email) {
            let existingEmail = await userModel.findOne({
                email: cleanData.email,
                _id: { $ne: id },
                isDeleted: false
            });
            if (existingEmail) {
                throw new Error("Email này đã được sử dụng bởi người dùng khác");
            }
        }

        let updatedItem = await userModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, cleanData, { new: true }).populate('role', 'name')

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteAnUser: async function (id) {
        let updatedItem = await userModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, {
            isDeleted: true
        }, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    }
}