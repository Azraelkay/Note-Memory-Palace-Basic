import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 页面组件
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Trash from './pages/Trash';

// VIP功能页面
import CalendarPage from './pages/CalendarPage';
import KanbanPage from './pages/KanbanPage';
import StatsPage from './pages/StatsPage';
import DataExportPage from './pages/DataExportPage';
import TemplatesPage from './pages/TemplatesPage';
import MindMapPage from './pages/MindMapPage';
import ExtensionsTest from './pages/ExtensionsTest';

// 布局组件
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// 上下文提供者
import { ThemeProvider } from './context/ThemeContext';

// 全局样式
import './styles/global.css';

const App = () => {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <main className="container">
          <Routes>
            {/* 公开路由 */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* 受保护路由 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/notes" element={<Notes />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/extensions" element={<ExtensionsTest />} />

              {/* VIP功能页面 */}
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/export" element={<DataExportPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/mindmap" element={<MindMapPage />} />
            </Route>

            {/* 404页面 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App; 