
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * 核心修复逻辑：应用一旦成功运行到这里，就说明启动环境是正常的。
 * 此时我们需要清除可能因为瞬间网络波动而弹出的错误提示。
 */
const cleanupBootUI = () => {
  // 1. 隐藏加载动画
  const loading = document.getElementById('loading-indicator');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => { loading.style.display = 'none'; }, 400);
  }
  
  // 2. 强行隐藏之前的错误提示条（如果有的话）
  const errorDisplay = document.getElementById('error-display');
  if (errorDisplay) {
    errorDisplay.style.display = 'none';
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 渲染启动后立即清理启动 UI
    cleanupBootUI();
    console.log('Greeting App initialized successfully.');
  } catch (err) {
    console.error('Boot Error:', err);
    const display = document.getElementById('error-display');
    if (display) {
      display.style.display = 'block';
      display.innerHTML = `<strong>应用运行出错:</strong><br>${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
