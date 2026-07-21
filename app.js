let express = require('express');
let path = require('path');
let logger = require('morgan');
let mongoose = require('mongoose');
let cors = require('cors');
require('dotenv').config(); // Nap bien moi truong tu file .env

let apiRouter = require('./routes/api');
let app = express();

// 1. KET NOI DATABASE (MongoDB)
// Lay URI tu file .env, neu khong co thi dung mac dinh
let mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/BEdatxe';
mongoose.connect(mongoURI)
  .then(() => console.log('Da ket noi MongoDB thanh cong!'))
  .catch((err) => console.log('Loi ket noi Database: ', err));

// 2. CAU HINH MIDDLEWARE
app.use(cors()); // Cho phep Frontend (React/Vue/Postman) goi API ma khong bi chan
app.use(logger('dev')); // Ghi log cac request ra Terminal de de debug
app.use(express.json()); // Cho phep Express doc du lieu JSON tu body
app.use(express.urlencoded({ extended: false }));

// 3. CAU HINH THU MUC TINH (Static Folder)
// Giup chung ta co the xem anh da upload qua URL (vd: http://localhost:3000/uploads/ten-file.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. DINH TUYEN API (RESTful)
// Moi API se bat dau bang /api/v1 (Vi du: /api/v1/auth/login)
app.use('/api/v1', apiRouter);

// 5. BAT LOI 404 (Khi goi sai duong dan API)
app.use(function(req, res, next) {
  res.status(404).send({
    message: "Duong dan API khong ton tai"
  });
});

// 6. BAT LOI HE THONG (Global Error Handler)
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({
    message: err.message || "Loi he thong"
  });
});

module.exports = app;