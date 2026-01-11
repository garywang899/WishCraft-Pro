import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    // 渲染成功后再设置标志位
    (window as any).APP_STARTED = true;
    console.log("App mounted successfully");
  } catch (e) {
    console.error("Mount failed", e);
  }
}