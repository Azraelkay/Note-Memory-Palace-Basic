import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ExtensionsTest = () => {
  const { isAuthenticated } = useAuth();
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testExtensionsAPI = async () => {
    setLoading(true);
    setError('');
    setLogs([]);
    
    addLog('开始测试扩展API...');
    
    try {
      addLog('检查认证状态...');
      if (!isAuthenticated) {
        throw new Error('用户未登录');
      }
      addLog('✅ 用户已登录');

      addLog('检查token...');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未找到token');
      }
      addLog('✅ Token存在');

      addLog('发送API请求到 /api/extensions/...');
      const response = await api.get('/extensions/');
      
      addLog(`✅ API响应状态: ${response.status}`);
      addLog(`✅ 响应数据: ${JSON.stringify(response.data, null, 2)}`);
      
      setExtensions(response.data.extensions || []);
      addLog(`✅ 成功获取 ${response.data.extensions?.length || 0} 个扩展`);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || '未知错误';
      addLog(`❌ 错误: ${errorMessage}`);
      if (err.response) {
        addLog(`❌ 响应状态: ${err.response.status}`);
        addLog(`❌ 响应数据: ${JSON.stringify(err.response.data, null, 2)}`);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      testExtensionsAPI();
    }
  }, [isAuthenticated]);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>扩展API测试页面</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={testExtensionsAPI}
          disabled={loading || !isAuthenticated}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '测试中...' : '重新测试API'}
        </button>
      </div>

      {!isAuthenticated && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          请先登录后再测试API
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          错误: {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>API调用日志:</h3>
        <div style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '1rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>

      <div>
        <h3>扩展列表 ({extensions.length}):</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {extensions.map(extension => (
            <div key={extension.id} style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>{extension.icon} {extension.name}</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{extension.description}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{
                  background: extension.is_installed ? '#10b981' : '#3b82f6',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {extension.is_installed ? '已安装' : '可安装'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExtensionsTest;
