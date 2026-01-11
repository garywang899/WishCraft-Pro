
// 必须作为第一行执行，通知 index.html 隐藏加载错误层
// Cast to any to fix property not found error on line 2
if ((window as any).markAppStarted) (window as any).markAppStarted();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Application Bootstrap Success.");

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
