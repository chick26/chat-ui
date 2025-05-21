import React, { useEffect } from 'react';
import './App.css';
import AppRouter from './router';

// 定义安全区CSS变量
const setSafeArea = () => {
  document.documentElement.style.setProperty('--safe-top', 'env(safe-area-inset-top, 0px)');
  document.documentElement.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 0px)');
};

function App() {
  // 安全区适配
  useEffect(() => {
    setSafeArea();
    window.addEventListener('resize', setSafeArea);
    return () => {
      window.removeEventListener('resize', setSafeArea);
    };
  }, []);

  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;
