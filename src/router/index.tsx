import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Main from '../pages/Main';
import { getDefaultBotId } from '../data/bots';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首页重定向到默认机器人 */}
        <Route path="/" element={<Navigate to={`/chat/${getDefaultBotId()}`} replace />} />
        {/* 聊天页面 */}
        <Route path="/chat/:botId" element={<Main />} />
        {/* 无匹配路由重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 