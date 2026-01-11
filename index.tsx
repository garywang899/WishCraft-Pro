
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 只要成功解析并执行到这里，立即解除遮罩
(window as any).APP_STARTED = true;

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App Core initialized and rendered.");
  } catch (error) {
    console.error("Critical Render Error:", error);
    (window as any).LAST_ERROR = "渲染失败: " + String(error);
  }
}
