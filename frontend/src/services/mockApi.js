// 模拟数据
const mockUsers = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123'
  }
];

const mockNotes = [
  {
    id: 1,
    title: '欢迎使用Note',
    content: '这是一个简单的笔记应用，您可以在这里记录您的想法和灵感。',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 1,
    tags: ['欢迎', '介绍'],
    categories: ['系统'],
    is_deleted: false,
    deleted_at: null
  },
  {
    id: 2,
    title: 'Markdown语法示例',
    content: '# 标题1\n## 标题2\n- 列表项1\n- 列表项2\n\n```js\nconsole.log("代码块");\n```',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: 1,
    tags: ['markdown', '语法'],
    categories: ['教程'],
    is_deleted: false,
    deleted_at: null
  }
];

const mockTags = [
  { id: 1, name: '欢迎', count: 1 },
  { id: 2, name: '介绍', count: 1 },
  { id: 3, name: 'markdown', count: 1 },
  { id: 4, name: '语法', count: 1 }
];

const mockCategories = [
  { id: 1, name: '系统', description: '系统相关笔记', color: '#3B82F6', count: 1, parent_id: null },
  { id: 2, name: '教程', description: '学习教程', color: '#10B981', count: 1, parent_id: null }
];

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 邮箱验证码存储
const emailVerificationCodes = new Map();

// 生成5位随机验证码
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// 邮箱验证相关API
export const sendVerificationCode = async (email) => {
  await delay(1000);

  // 生成验证码
  const code = generateVerificationCode();

  // 存储验证码（实际应用中应该有过期时间）
  emailVerificationCodes.set(email, {
    code,
    timestamp: Date.now(),
    expires: Date.now() + 5 * 60 * 1000 // 5分钟过期
  });

  // 模拟发送邮件（实际应用中这里会调用邮件服务）
  console.log(`模拟发送验证码到 ${email}: ${code}`);

  // 在开发环境下，直接显示验证码
  if (process.env.NODE_ENV === 'development') {
    alert(`验证码已发送到 ${email}\n验证码: ${code}\n(开发模式下直接显示)`);
  }

  return {
    success: true,
    message: '验证码已发送到您的邮箱',
    // 开发模式下返回验证码，生产环境不应该返回
    ...(process.env.NODE_ENV === 'development' && { code })
  };
};

export const verifyEmailCode = async (email, code) => {
  await delay(500);

  // 基础版本：允许通用验证码 "12345" 用于测试
  if (code.toString() === '12345') {
    return {
      success: true,
      message: '邮箱验证成功（测试模式）'
    };
  }

  const storedData = emailVerificationCodes.get(email);

  if (!storedData) {
    throw new Error('验证码不存在或已过期（或使用测试验证码：12345）');
  }

  if (Date.now() > storedData.expires) {
    emailVerificationCodes.delete(email);
    throw new Error('验证码已过期（或使用测试验证码：12345）');
  }

  if (storedData.code !== code) {
    throw new Error('验证码错误（或使用测试验证码：12345）');
  }

  // 验证成功，删除验证码
  emailVerificationCodes.delete(email);

  return {
    success: true,
    message: '邮箱验证成功'
  };
};

// 认证相关API
export const register = async (userData) => {
  await delay(500);

  // 检查必填字段
  if (!userData.email || !userData.username || !userData.password) {
    throw new Error('请填写所有必填字段');
  }

  // 检查邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error('邮箱格式不正确');
  }

  // 检查用户名是否已存在
  const existingUser = mockUsers.find(user =>
    user.username === userData.username || user.email === userData.email
  );
  if (existingUser) {
    if (existingUser.username === userData.username) {
      throw new Error('用户名已存在');
    }
    if (existingUser.email === userData.email) {
      throw new Error('邮箱已被注册');
    }
  }

  // 检查密码强度
  if (userData.password.length < 6) {
    throw new Error('密码长度至少6位');
  }

  // 创建新用户
  const newUser = {
    id: mockUsers.length + 1,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    created_at: new Date().toISOString(),
    email_verified: true, // 在模拟环境中直接设为已验证
    profile: {
      nickname: userData.username,
      avatar: null
    }
  };
  mockUsers.push(newUser);

  return {
    success: true,
    message: '注册成功！',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      email_verified: newUser.email_verified
    }
  };
};

export const login = async (credentials) => {
  await delay(500);
  
  // 查找用户
  const user = mockUsers.find(
    user => user.username === credentials.username && user.password === credentials.password
  );
  
  if (!user) {
    throw new Error('用户名或密码错误');
  }
  
  // 返回用户信息和token
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token: 'mock-jwt-token'
  };
};

export const checkAuth = async () => {
  await delay(300);
  
  // 模拟已登录用户
  const user = mockUsers[0];
  const { password, ...userWithoutPassword } = user;
  
  return userWithoutPassword;
};

// 笔记相关API
export const getAllNotes = async () => {
  await delay(500);

  // 只返回未删除的笔记
  return mockNotes.filter(note => !note.is_deleted);
};

export const getNoteById = async (id) => {
  await delay(300);
  
  const note = mockNotes.find(note => note.id === parseInt(id));
  if (!note) {
    throw new Error('笔记不存在');
  }
  
  return note;
};

export const createNote = async (noteData) => {
  await delay(500);

  const newNote = {
    id: mockNotes.length + 1,
    ...noteData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 1,
    is_deleted: false,
    deleted_at: null
  };

  mockNotes.unshift(newNote);
  return newNote;
};

export const updateNote = async (id, noteData) => {
  await delay(500);
  
  const noteIndex = mockNotes.findIndex(note => note.id === parseInt(id));
  if (noteIndex === -1) {
    throw new Error('笔记不存在');
  }
  
  const updatedNote = {
    ...mockNotes[noteIndex],
    ...noteData,
    updated_at: new Date().toISOString()
  };
  
  mockNotes[noteIndex] = updatedNote;
  return updatedNote;
};

export const deleteNote = async (id) => {
  await delay(500);

  const noteIndex = mockNotes.findIndex(note => note.id === parseInt(id) && !note.is_deleted);
  if (noteIndex === -1) {
    throw new Error('笔记不存在');
  }

  // 软删除：标记为已删除，设置删除时间
  mockNotes[noteIndex].is_deleted = true;
  mockNotes[noteIndex].deleted_at = new Date().toISOString();

  return {
    success: true,
    message: '笔记已移到回收站'
  };
};

// 搜索相关API
export const searchNotes = async (searchParams) => {
  await delay(500);

  let filteredNotes = [...mockNotes];

  // 按关键词搜索
  if (searchParams.q) {
    const query = searchParams.q.toLowerCase();
    filteredNotes = filteredNotes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }

  // 按标签过滤
  if (searchParams.tags) {
    const tags = searchParams.tags.split(',').map(tag => tag.trim());
    filteredNotes = filteredNotes.filter(note =>
      tags.some(tag => note.tags && note.tags.includes(tag))
    );
  }

  // 按分类过滤
  if (searchParams.categories) {
    const categories = searchParams.categories.split(',').map(cat => cat.trim());
    filteredNotes = filteredNotes.filter(note =>
      categories.some(cat => note.categories && note.categories.includes(cat))
    );
  }

  return {
    notes: filteredNotes,
    total: filteredNotes.length,
    query: searchParams
  };
};

export const getTags = async () => {
  await delay(300);
  return mockTags;
};

export const getCategories = async () => {
  await delay(300);
  return mockCategories;
};

// 分类管理API
export const createCategory = async (categoryData) => {
  await delay(500);

  const newCategory = {
    id: mockCategories.length + 1,
    ...categoryData,
    count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockCategories.push(newCategory);
  return newCategory;
};

export const updateCategory = async (id, categoryData) => {
  await delay(500);

  const categoryIndex = mockCategories.findIndex(cat => cat.id === parseInt(id));
  if (categoryIndex === -1) {
    throw new Error('分类不存在');
  }

  const updatedCategory = {
    ...mockCategories[categoryIndex],
    ...categoryData,
    updated_at: new Date().toISOString()
  };

  mockCategories[categoryIndex] = updatedCategory;
  return updatedCategory;
};

export const deleteCategory = async (id) => {
  await delay(500);

  const categoryIndex = mockCategories.findIndex(cat => cat.id === parseInt(id));
  if (categoryIndex === -1) {
    throw new Error('分类不存在');
  }

  mockCategories.splice(categoryIndex, 1);
  return { success: true };
};

// 回收站相关API
export const getTrashNotes = async (page = 1, per_page = 10) => {
  await delay(500);

  // 获取已删除的笔记
  const deletedNotes = mockNotes.filter(note => note.is_deleted);

  // 按删除时间倒序排列
  deletedNotes.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));

  // 简单分页
  const start = (page - 1) * per_page;
  const end = start + per_page;
  const paginatedNotes = deletedNotes.slice(start, end);

  return {
    notes: paginatedNotes,
    total: deletedNotes.length,
    pages: Math.ceil(deletedNotes.length / per_page),
    current_page: page,
    has_next: end < deletedNotes.length,
    has_prev: page > 1
  };
};

export const restoreNote = async (id) => {
  await delay(500);

  const noteIndex = mockNotes.findIndex(note => note.id === parseInt(id) && note.is_deleted);
  if (noteIndex === -1) {
    throw new Error('笔记不存在或未删除');
  }

  // 恢复笔记
  mockNotes[noteIndex].is_deleted = false;
  mockNotes[noteIndex].deleted_at = null;
  mockNotes[noteIndex].updated_at = new Date().toISOString();

  return {
    success: true,
    message: '笔记已恢复',
    note: {
      id: mockNotes[noteIndex].id,
      title: mockNotes[noteIndex].title,
      updated_at: mockNotes[noteIndex].updated_at
    }
  };
};

export const permanentlyDeleteNote = async (id) => {
  await delay(500);

  const noteIndex = mockNotes.findIndex(note => note.id === parseInt(id) && note.is_deleted);
  if (noteIndex === -1) {
    throw new Error('笔记不存在或未删除');
  }

  // 永久删除
  mockNotes.splice(noteIndex, 1);

  return {
    success: true,
    message: '笔记已永久删除'
  };
};

export const emptyTrash = async () => {
  await delay(500);

  // 获取所有已删除的笔记
  const deletedNotes = mockNotes.filter(note => note.is_deleted);
  const count = deletedNotes.length;

  // 永久删除所有已删除的笔记
  for (let i = mockNotes.length - 1; i >= 0; i--) {
    if (mockNotes[i].is_deleted) {
      mockNotes.splice(i, 1);
    }
  }

  return {
    success: true,
    message: `已清空回收站，永久删除了 ${count} 篇笔记`
  };
};