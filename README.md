# 🏰 Note记忆宫殿 - 基础版

一个现代化的笔记应用，采用记忆宫殿主题设计，提供优雅的笔记管理体验。

## ✨ 特色功能

### 🎨 记忆宫殿主题
- 🌌 宇宙蓝背景配色
- ✨ 金色神经网络元素
- 🏰 宫殿式界面设计
- 🎭 多主题切换支持

### 📝 核心功能
- **智能笔记编辑**：富文本编辑器，支持Markdown语法
- **分类管理**：多级分类，拖拽排序
- **全文搜索**：快速搜索笔记内容
- **实时保存**：自动保存，防止数据丢失
- **响应式设计**：完美适配桌面和移动设备

### 🔐 用户系统
- 用户注册/登录
- 密码重置
- 个人资料管理
- 数据隔离

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Python 3.8+
- SQLite 3

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/Note-Basic-OpenSource.git
cd Note-Basic-OpenSource
```

2. **安装前端依赖**
```bash
cd frontend
npm install
```

3. **安装后端依赖**
```bash
cd ../backend
pip install -r requirements.txt
```

4. **初始化数据库**
```bash
python init_db.py
```

5. **启动后端服务**
```bash
python run.py
```

6. **启动前端服务**
```bash
cd ../frontend
npm start
```

7. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 📦 构建发布版本

### 开发版本
```bash
cd frontend
npm run build
```

### 桌面应用
```bash
# 构建所有平台
npm run dist-all

# 仅构建Windows版本
npm run dist-win
```

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **React Router** - 路由管理
- **Context API** - 状态管理
- **CSS3** - 样式设计
- **Electron** - 桌面应用打包

### 后端
- **Flask** - Web框架
- **SQLAlchemy** - ORM数据库操作
- **JWT** - 用户认证
- **SQLite** - 数据库

## 📁 项目结构

```
Note-Basic-OpenSource/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── context/        # Context状态管理
│   │   ├── services/       # API服务
│   │   └── styles/         # 样式文件
│   ├── public/             # 静态资源
│   └── package.json        # 前端依赖
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # API路由
│   │   └── __init__.py     # 应用初始化
│   ├── requirements.txt    # 后端依赖
│   └── run.py             # 启动文件
└── README.md              # 项目说明
```

## 🎯 开发计划

- [ ] 移动端适配优化
- [ ] 离线模式支持
- [ ] 数据导入/导出
- [ ] 插件系统
- [ ] 多语言支持

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [项目主页](https://github.com/yourusername/Note-Basic-OpenSource)
- [问题反馈](https://github.com/yourusername/Note-Basic-OpenSource/issues)
- [更新日志](CHANGELOG.md)

## 💎 商业版本

如果您需要更多高级功能，我们还提供商业版本：

- 🧩 **扩展中心** - 丰富的插件生态
- 📋 **看板管理** - Kanban风格任务管理
- 📅 **日历视图** - 日程管理和提醒
- 📊 **数据统计** - 生产力分析和图表
- 📤 **数据导出** - 多格式导出和云同步
- 🎯 **高级模板** - 专业模板库
- 👥 **团队协作** - 多人协作功能
- ☁️ **云端同步** - 跨设备数据同步

[了解商业版本详情](https://your-website.com)

---

⭐ 如果这个项目对您有帮助，请给我们一个Star！

Made with ❤️ by [Your Name]
