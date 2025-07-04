// 云服务API - 轻量级用户管理和认证服务
// 这个文件模拟云端API，实际部署时会连接真实的云服务

// 模拟云端用户数据库
const cloudUsers = new Map();
const verificationCodes = new Map();
const userSessions = new Map();

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 生成随机ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 生成5位验证码
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// 生成JWT Token (模拟)
const generateToken = (userId) => {
  return `mock_token_${userId}_${Date.now()}`;
};

// 验证邮箱格式
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 云服务API接口
export const cloudApi = {
  // 发送邮箱验证码
  async sendVerificationCode(email) {
    await delay(1000);
    
    if (!isValidEmail(email)) {
      throw new Error('邮箱格式不正确');
    }
    
    const code = generateVerificationCode();
    
    // 存储验证码（5分钟有效期）
    verificationCodes.set(email, {
      code,
      timestamp: Date.now(),
      expires: Date.now() + 5 * 60 * 1000
    });
    
    // 模拟发送邮件
    console.log(`[云服务] 发送验证码到 ${email}: ${code}`);
    
    // 开发环境下显示验证码
    if (process.env.NODE_ENV === 'development') {
      // 使用更友好的通知方式
      setTimeout(() => {
        alert(`📧 验证码已发送！\n\n邮箱: ${email}\n验证码: ${code}\n\n(开发模式下直接显示，实际使用时请查收邮件)`);
      }, 500);
    }
    
    return {
      success: true,
      message: '验证码已发送到您的邮箱，请查收',
      // 开发模式下返回验证码
      ...(process.env.NODE_ENV === 'development' && { devCode: code })
    };
  },

  // 验证邮箱验证码
  async verifyEmailCode(email, code) {
    await delay(500);

    // 基础版本：允许通用验证码 "12345" 用于测试
    if (code.toString() === '12345') {
      return {
        success: true,
        message: '邮箱验证成功（测试模式）'
      };
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      throw new Error('验证码不存在或已过期，请重新获取（或使用测试验证码：12345）');
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      throw new Error('验证码已过期，请重新获取（或使用测试验证码：12345）');
    }

    if (storedData.code !== code.toString()) {
      throw new Error('验证码错误，请重新输入（或使用测试验证码：12345）');
    }

    // 验证成功，删除验证码
    verificationCodes.delete(email);

    return {
      success: true,
      message: '邮箱验证成功'
    };
  },

  // 用户注册
  async register(userData) {
    await delay(800);
    
    const { username, email, password, verificationCode } = userData;
    
    // 验证必填字段
    if (!username || !email || !password) {
      throw new Error('请填写所有必填字段');
    }
    
    // 验证邮箱格式
    if (!isValidEmail(email)) {
      throw new Error('邮箱格式不正确');
    }
    
    // 验证密码强度
    if (password.length < 6) {
      throw new Error('密码长度至少6位');
    }
    
    // 检查用户名和邮箱是否已存在
    for (const [id, user] of cloudUsers) {
      if (user.username === username) {
        throw new Error('用户名已存在，请选择其他用户名');
      }
      if (user.email === email) {
        throw new Error('该邮箱已被注册，请使用其他邮箱');
      }
    }
    
    // 如果提供了验证码，进行验证
    if (verificationCode) {
      try {
        await this.verifyEmailCode(email, verificationCode);
      } catch (error) {
        throw new Error(`邮箱验证失败: ${error.message}`);
      }
    }
    
    // 创建新用户
    const userId = generateId();
    const newUser = {
      id: userId,
      username,
      email,
      password, // 实际应用中应该加密存储
      emailVerified: !!verificationCode,
      accountType: 'basic', // basic | premium
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      profile: {
        nickname: username,
        avatar: null
      }
    };
    
    cloudUsers.set(userId, newUser);
    
    // 生成登录token
    const token = generateToken(userId);
    userSessions.set(token, {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30天
    });
    
    return {
      success: true,
      message: '注册成功！欢迎使用Note智能笔记',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
        accountType: newUser.accountType,
        profile: newUser.profile
      },
      token
    };
  },

  // 用户登录
  async login(credentials) {
    await delay(600);
    
    const { username, password } = credentials;
    
    if (!username || !password) {
      throw new Error('请输入用户名和密码');
    }
    
    // 查找用户（支持用户名或邮箱登录）
    let user = null;
    for (const [id, userData] of cloudUsers) {
      if (userData.username === username || userData.email === username) {
        if (userData.password === password) {
          user = userData;
          break;
        }
      }
    }
    
    if (!user) {
      throw new Error('用户名或密码错误');
    }
    
    // 更新最后登录时间
    user.lastLoginAt = new Date().toISOString();
    
    // 生成新的登录token
    const token = generateToken(user.id);
    userSessions.set(token, {
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30天
    });
    
    return {
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        accountType: user.accountType,
        profile: user.profile
      },
      token
    };
  },

  // 验证token
  async verifyToken(token) {
    await delay(200);
    
    if (!token) {
      throw new Error('未提供认证token');
    }
    
    const session = userSessions.get(token);
    if (!session) {
      throw new Error('无效的认证token');
    }
    
    if (Date.now() > session.expiresAt) {
      userSessions.delete(token);
      throw new Error('认证token已过期');
    }
    
    const user = cloudUsers.get(session.userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        accountType: user.accountType,
        profile: user.profile
      }
    };
  },

  // 密码重置 - 发送重置邮件
  async sendPasswordResetCode(email) {
    await delay(1000);
    
    if (!isValidEmail(email)) {
      throw new Error('邮箱格式不正确');
    }
    
    // 检查邮箱是否已注册
    let userExists = false;
    for (const [id, user] of cloudUsers) {
      if (user.email === email) {
        userExists = true;
        break;
      }
    }
    
    if (!userExists) {
      throw new Error('该邮箱未注册');
    }
    
    const code = generateVerificationCode();
    
    // 存储重置码
    verificationCodes.set(`reset_${email}`, {
      code,
      timestamp: Date.now(),
      expires: Date.now() + 10 * 60 * 1000 // 10分钟有效期
    });
    
    console.log(`[云服务] 发送密码重置码到 ${email}: ${code}`);
    
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        alert(`🔐 密码重置码已发送！\n\n邮箱: ${email}\n重置码: ${code}\n\n(开发模式下直接显示)`);
      }, 500);
    }
    
    return {
      success: true,
      message: '密码重置码已发送到您的邮箱'
    };
  },

  // 重置密码
  async resetPassword(email, resetCode, newPassword) {
    await delay(600);
    
    const storedData = verificationCodes.get(`reset_${email}`);
    
    if (!storedData) {
      throw new Error('重置码不存在或已过期');
    }
    
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(`reset_${email}`);
      throw new Error('重置码已过期');
    }
    
    if (storedData.code !== resetCode.toString()) {
      throw new Error('重置码错误');
    }
    
    if (newPassword.length < 6) {
      throw new Error('新密码长度至少6位');
    }
    
    // 找到用户并更新密码
    for (const [id, user] of cloudUsers) {
      if (user.email === email) {
        user.password = newPassword;
        break;
      }
    }
    
    // 删除重置码
    verificationCodes.delete(`reset_${email}`);
    
    return {
      success: true,
      message: '密码重置成功，请使用新密码登录'
    };
  },

  // 检查版本更新
  async checkUpdate() {
    await delay(300);
    
    return {
      hasUpdate: false,
      currentVersion: '1.0.0',
      latestVersion: '1.0.0',
      updateInfo: null
    };
  },

  // 获取用户统计信息
  async getUserStats(token) {
    const { user } = await this.verifyToken(token);
    
    return {
      accountType: user.accountType,
      isPremium: user.accountType === 'premium',
      features: {
        basic: ['笔记编辑', '标签管理', '搜索功能', '主题切换'],
        premium: ['数据统计', '看板管理', '日历视图', '思维导图', '数据导出', '模板库']
      }
    };
  }
};

export default cloudApi;
