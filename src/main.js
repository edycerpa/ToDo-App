const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

const todosFilePath = path.join(app.getPath('userData'), 'todos.json');

// Deshabilitar la aceleración de hardware
app.disableHardwareAcceleration();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minwidth: 800,
    minheight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'src/img/logo.ico'),
    frame: false,
    transparent: true
  });

  mainWindow.loadFile('src/index.html');
  mainWindow.setMenu(null);

  globalShortcut.register('CmdOrCtrl+Shift+I', () => {
    mainWindow.webContents.openDevTools();
  });

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-todos', async () => {
  if (!fs.existsSync(todosFilePath)) {
    fs.writeFileSync(todosFilePath, JSON.stringify([]));
  }
  const todos = JSON.parse(fs.readFileSync(todosFilePath, 'utf8') || '[]');
  return todos;
});

ipcMain.handle('save-todos', async (event, todos) => {
  fs.writeFileSync(todosFilePath, JSON.stringify(todos, null, 2));
});
