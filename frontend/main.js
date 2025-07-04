const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

// 创建主窗口
async function createWindow() {
  // 创建启动画面
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));

  // 等待启动画面显示
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true, // 自动隐藏菜单栏
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  // 加载应用
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Loading file:', indexPath);
  mainWindow.loadFile(indexPath);

  // 当页面加载完成后显示窗口并关闭启动画面
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    splash.close();
  });

  // 当窗口被关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// 应用准备就绪
app.whenReady().then(async () => {
  try {
    console.log('Starting Note App (Cloud Version)...');

    // 创建窗口
    await createWindow();

    // 完全移除菜单栏
    Menu.setApplicationMenu(null);

    console.log('Note App started successfully');
  } catch (error) {
    console.error('Failed to start app:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(error => {
  console.error('App failed to start:', error);
  app.quit();
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在macOS上，当点击dock图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  console.log('App is quitting...');
});

// 安全设置
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
