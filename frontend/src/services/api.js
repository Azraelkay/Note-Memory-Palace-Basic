import axios from 'axios';
import * as mockApi from './mockApi';
import { cloudApi } from './cloudApi';

// 是否使用模拟API（在后端不可用时使用）
const USE_MOCK_API = true;
// 是否使用云服务（用户认证使用云端，数据使用本地）
const USE_CLOUD_AUTH = true;

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器，添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 邮箱验证相关API
export const sendVerificationCode = async (email) => {
  if (USE_CLOUD_AUTH) {
    return cloudApi.sendVerificationCode(email);
  }

  if (USE_MOCK_API) {
    return mockApi.sendVerificationCode(email);
  }

  try {
    const response = await api.post('/auth/send-verification', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('发送验证码失败');
  }
};

export const verifyEmailCode = async (email, code) => {
  if (USE_CLOUD_AUTH) {
    return cloudApi.verifyEmailCode(email, code);
  }

  if (USE_MOCK_API) {
    return mockApi.verifyEmailCode(email, code);
  }

  try {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('验证失败');
  }
};

// 认证相关API
export const register = async (userData) => {
  if (USE_CLOUD_AUTH) {
    return cloudApi.register(userData);
  }

  if (USE_MOCK_API) {
    return mockApi.register(userData);
  }

  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('注册失败');
  }
};

export const login = async (credentials) => {
  if (USE_CLOUD_AUTH) {
    return cloudApi.login(credentials);
  }

  if (USE_MOCK_API) {
    return mockApi.login(credentials);
  }

  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('登录失败');
  }
};

export const checkAuth = async () => {
  if (USE_CLOUD_AUTH) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    return cloudApi.verifyToken(token);
  }

  if (USE_MOCK_API) {
    return mockApi.checkAuth();
  }

  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 密码重置相关API
export const sendPasswordResetCode = async (email) => {
  if (USE_CLOUD_AUTH) {
    return cloudApi.sendPasswordResetCode(email);
  }

  try {
    const response = await api.post('/auth/reset-password-request', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('发送重置码失败');
  }
};

export const resetPassword = async (email, resetCode, newPassword) => {
  if (USE_CLOUD_AUTH) {
    return cloudApi.resetPassword(email, resetCode, newPassword);
  }

  try {
    const response = await api.post('/auth/reset-password', { email, resetCode, newPassword });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('重置密码失败');
  }
};

// 笔记相关API
export const getAllNotes = async (params = {}) => {
  if (USE_MOCK_API) {
    return mockApi.getAllNotes();
  }

  try {
    const response = await api.get('/notes', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取笔记失败');
  }
};

export const getNoteById = async (id) => {
  if (USE_MOCK_API) {
    return mockApi.getNoteById(id);
  }
  
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取笔记失败');
  }
};

export const createNote = async (noteData) => {
  if (USE_MOCK_API) {
    return mockApi.createNote(noteData);
  }

  try {
    const token = localStorage.getItem('token');
    console.log('当前token:', token ? '存在' : '不存在');
    console.log('发送创建笔记请求:', noteData);
    console.log('请求URL:', 'http://localhost:5000/api/notes');

    const response = await api.post('/notes', noteData);
    console.log('创建笔记响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('创建笔记失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误详情:', error.response?.data);
    console.error('完整错误:', error);

    if (error.response?.status === 401) {
      throw new Error('用户未登录或token已过期');
    }

    throw error.response?.data || new Error('创建笔记失败');
  }
};

export const updateNote = async (id, noteData) => {
  if (USE_MOCK_API) {
    return mockApi.updateNote(id, noteData);
  }
  
  try {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('更新笔记失败');
  }
};

export const deleteNote = async (id) => {
  if (USE_MOCK_API) {
    return mockApi.deleteNote(id);
  }

  try {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('删除笔记失败');
  }
};

// 搜索相关API
export const searchNotes = async (searchParams) => {
  if (USE_MOCK_API) {
    return mockApi.searchNotes(searchParams);
  }

  try {
    const response = await api.get('/notes/search', { params: searchParams });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('搜索失败');
  }
};

export const getTags = async () => {
  if (USE_MOCK_API) {
    return mockApi.getTags();
  }

  try {
    const response = await api.get('/notes/tags');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取标签失败');
  }
};

export const getCategories = async (params = {}) => {
  if (USE_MOCK_API) {
    return mockApi.getCategories();
  }

  try {
    const response = await api.get('/notes/categories', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取分类失败');
  }
};

// 分类管理API
export const createCategory = async (categoryData) => {
  if (USE_MOCK_API) {
    return mockApi.createCategory(categoryData);
  }

  try {
    const response = await api.post('/notes/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('创建分类失败');
  }
};

export const updateCategory = async (id, categoryData) => {
  if (USE_MOCK_API) {
    return mockApi.updateCategory(id, categoryData);
  }

  try {
    const response = await api.put(`/notes/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('更新分类失败');
  }
};

export const deleteCategory = async (id) => {
  if (USE_MOCK_API) {
    return mockApi.deleteCategory(id);
  }

  try {
    const response = await api.delete(`/notes/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('删除分类失败');
  }
};

// 文件上传API
export const uploadFile = async (file, onProgress = null) => {
  if (USE_MOCK_API) {
    // 模拟文件上传
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          original_name: file.name,
          filename: `${Date.now()}_${file.name}`,
          file_type: file.type.startsWith('image/') ? 'images' : 'documents',
          file_size: file.size,
          upload_time: new Date().toISOString(),
          url: URL.createObjectURL(file)
        });
      }, 1000);
    });
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    // 如果提供了进度回调
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await api.post('/notes/upload', formData, config);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('文件上传失败');
  }
};

// 获取文件URL
export const getFileUrl = (userId, filename) => {
  if (USE_MOCK_API) {
    return '#'; // 模拟URL
  }
  return `${api.defaults.baseURL}/notes/files/${userId}/${filename}`;
};

// 扩展相关API
export const getExtensions = async (params = {}) => {
  if (USE_MOCK_API) {
    // 模拟扩展数据
    return {
      extensions: [
        {
          id: 1,
          name: '思维导图',
          description: '创建和编辑思维导图，可视化思维过程',
          icon: '🧠',
          category: 'visualization',
          status: 'available',
          version: '1.0.0',
          is_installed: true,
          features: ['创建思维导图', '节点编辑', '导出图片']
        },
        {
          id: 2,
          name: '日历视图',
          description: '以日历形式查看和管理笔记',
          icon: '📅',
          category: 'organization',
          status: 'available',
          version: '1.0.0',
          is_installed: true,
          features: ['日历显示', '事件管理', '提醒功能']
        },
        {
          id: 3,
          name: '看板管理',
          description: '使用看板方式管理任务和项目',
          icon: '📋',
          category: 'productivity',
          status: 'available',
          version: '1.0.0',
          is_installed: true,
          features: ['任务看板', '拖拽操作', '状态管理']
        },
        {
          id: 4,
          name: '数据导出',
          description: '将笔记导出为多种格式',
          icon: '📤',
          category: 'utility',
          status: 'available',
          version: '1.0.0',
          is_installed: false,
          features: ['PDF导出', 'Word导出', 'Markdown导出']
        },
        {
          id: 5,
          name: '模板库',
          description: '使用预定义模板快速创建笔记',
          icon: '📝',
          category: 'productivity',
          status: 'available',
          version: '1.0.0',
          is_installed: false,
          features: ['模板管理', '快速创建', '自定义模板']
        },
        {
          id: 6,
          name: '数据统计',
          description: '分析笔记使用情况和统计数据',
          icon: '📊',
          category: 'analytics',
          status: 'available',
          version: '1.0.0',
          is_installed: false,
          features: ['使用统计', '数据分析', '图表展示']
        }
      ]
    };
  }

  try {
    const response = await api.get('/extensions/', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取扩展列表失败');
  }
};

export const installExtension = async (extensionId) => {
  if (USE_MOCK_API) {
    return { message: '扩展安装成功' };
  }

  try {
    const response = await api.post(`/extensions/${extensionId}/install`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('安装扩展失败');
  }
};

export const uninstallExtension = async (extensionId) => {
  if (USE_MOCK_API) {
    return { message: '扩展卸载成功' };
  }

  try {
    const response = await api.delete(`/extensions/${extensionId}/uninstall`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('卸载扩展失败');
  }
};

export const toggleExtension = async (extensionId, enabled) => {
  if (USE_MOCK_API) {
    return { message: enabled ? '扩展已启用' : '扩展已禁用' };
  }

  try {
    const response = await api.post(`/extensions/${extensionId}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('切换扩展状态失败');
  }
};

// 看板相关API
export const getKanbanBoards = async (params = {}) => {
  try {
    const response = await api.get('/kanban/boards', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取看板列表失败');
  }
};

export const getKanbanBoard = async (boardId) => {
  try {
    const response = await api.get(`/kanban/boards/${boardId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取看板详情失败');
  }
};

export const createKanbanBoard = async (boardData) => {
  try {
    const response = await api.post('/kanban/boards', boardData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('创建看板失败');
  }
};

export const deleteKanbanBoard = async (boardId) => {
  try {
    const response = await api.delete(`/kanban/boards/${boardId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('删除看板失败');
  }
};

export const createKanbanCard = async (boardId, cardData) => {
  try {
    const response = await api.post(`/kanban/boards/${boardId}/cards`, cardData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('创建卡片失败');
  }
};

export const updateKanbanCard = async (cardId, cardData) => {
  try {
    const response = await api.put(`/kanban/cards/${cardId}`, cardData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('更新卡片失败');
  }
};

export const deleteKanbanCard = async (cardId) => {
  try {
    const response = await api.delete(`/kanban/cards/${cardId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('删除卡片失败');
  }
};

// 数据导出相关API
export const getExportFormats = async () => {
  try {
    const response = await api.get('/export/formats');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取导出格式失败');
  }
};

export const previewExport = async (exportData) => {
  try {
    const response = await api.post('/export/preview', exportData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('预览导出数据失败');
  }
};

export const exportNotes = async (exportData) => {
  try {
    const response = await api.post('/export/notes', exportData, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('导出笔记失败');
  }
};

export const exportKanban = async (exportData) => {
  try {
    const response = await api.post('/export/kanban', exportData, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('导出看板失败');
  }
};

export const exportCalendar = async (exportData) => {
  try {
    const response = await api.post('/export/calendar', exportData, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('导出日历失败');
  }
};

// 模板相关API
export const getTemplates = async (params = {}) => {
  try {
    const response = await api.get('/templates', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取模板失败');
  }
};

export const createTemplate = async (templateData) => {
  try {
    const response = await api.post('/templates', templateData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('创建模板失败');
  }
};

export const updateTemplate = async (id, templateData) => {
  try {
    const response = await api.put(`/templates/${id}`, templateData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('更新模板失败');
  }
};

export const deleteTemplate = async (id) => {
  try {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('删除模板失败');
  }
};

export const shareTemplate = async (id) => {
  try {
    const response = await api.post(`/templates/${id}/share`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('分享模板失败');
  }
};

export const importTemplate = async (shareCode) => {
  try {
    const response = await api.post(`/templates/import/${shareCode}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('导入模板失败');
  }
};

export const applyTemplate = async (id, data) => {
  try {
    const response = await api.post(`/templates/${id}/apply`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('应用模板失败');
  }
};

export const getTemplateCategories = async () => {
  try {
    const response = await api.get('/templates/categories');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取模板分类失败');
  }
};

// 统计相关API
export const getStatsOverview = async (params = {}) => {
  try {
    const response = await api.get('/stats/overview', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取总览统计失败');
  }
};

export const getStatsProductivity = async (params = {}) => {
  try {
    const response = await api.get('/stats/productivity', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取生产力统计失败');
  }
};

export const getStatsTrends = async (params = {}) => {
  try {
    const response = await api.get('/stats/trends', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取趋势统计失败');
  }
};

export const getNotesStats = async (params = {}) => {
  try {
    const response = await api.get('/notes/stats', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取笔记统计失败');
  }
};

// 回收站相关API
export const getTrashNotes = async (page = 1, per_page = 10) => {
  if (USE_MOCK_API) {
    return mockApi.getTrashNotes(page, per_page);
  }

  try {
    const response = await api.get(`/notes/trash?page=${page}&per_page=${per_page}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('获取回收站笔记失败');
  }
};

export const restoreNote = async (id) => {
  if (USE_MOCK_API) {
    return mockApi.restoreNote(id);
  }

  try {
    const response = await api.post(`/notes/trash/${id}/restore`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('恢复笔记失败');
  }
};

export const permanentlyDeleteNote = async (id) => {
  if (USE_MOCK_API) {
    return mockApi.permanentlyDeleteNote(id);
  }

  try {
    const response = await api.delete(`/notes/trash/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('永久删除笔记失败');
  }
};

export const emptyTrash = async () => {
  if (USE_MOCK_API) {
    return mockApi.emptyTrash();
  }

  try {
    const response = await api.delete('/notes/trash/empty');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('清空回收站失败');
  }
};

export default api;