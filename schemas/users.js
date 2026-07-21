let mongoose = require('mongoose');
let bcrypt = require('bcrypt');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        default: ""
    },
    avatarUrl: {
        type: String,
        default: "https://placehold.co/600x400.png?text=Avatar"
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role",
        required: true
    },
    loginCount: {
        type: Number,
        default: 0
    },
    lockTime: Date,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// ĐÃ SỬA: Dùng async/await, loại bỏ hoàn toàn next()
userSchema.pre('save', async function () {
    // Chỉ băm mật khẩu nếu mật khẩu bị thay đổi hoặc mới tạo
    if (this.isModified('password')) {
        let salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

module.exports = mongoose.model('user', userSchema);