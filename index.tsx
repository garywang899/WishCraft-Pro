
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 只要这行代码执行，错误遮罩就会消失
(window as any).APP_STARTED = true;

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
