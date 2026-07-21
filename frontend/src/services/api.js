import axios from 'axios';

// Kết nối thẳng tới cổng 3000 của Backend
const api = axios.create({
baseURL: 'https://xi4e4dh6vf.execute-api.us-east-1.amazonaws.com/api/v1',  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gài Token vào mọi request nếu có
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (token) {
      // Đề phòng trường hợp token bị lưu kèm dấu ngoặc kép (ví dụ: "eyJhbG...")
      token = token.replace(/^"(.*)"$/, '$1'); 
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;