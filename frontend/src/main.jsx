import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // (Hoặc import css của bạn nếu có)
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
// 1. Import AuthProvider từ thư viện vừa cài
import { AuthProvider } from "react-oidc-context";

// 2. Cấu hình Cognito lấy từ biến môi trường
const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: "code",
  scope: "phone openid email",
};

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

// 3. Bọc AuthProvider ra ngoài cùng ứng dụng
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)