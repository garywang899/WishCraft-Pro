
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 只要成功解析并执行到这里，立即解除遮罩
(window as any).APP_STARTED = true;
if ((window as any).BOOT_LOG) (window as any).BOOT_LOG.push("index.tsx 脚本开始执行。");

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    if ((window as any).BOOT_LOG) (window as any).BOOT_LOG.push("React 渲染指令已发出。");
  } catch (error) {
    console.error("Critical Render Error:", error);
    if ((window as any).BOOT_LOG) (window as any).BOOT_LOG.push("渲染阶段报错: " + error);
  }
}
