const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
    }
  })

  // 在开发环境中加载开发服务器地址
  if (process.env.NODE_ENV === 'development') {
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173"]
        }
      })
    })

    const tryLoad = () => {
      win.loadURL('http://localhost:5173')
        .catch(error => {
          console.log('Failed to load URL, retrying in 1 second...', error)
          setTimeout(tryLoad, 1000)
        })
    }
    
    setTimeout(tryLoad, 1000)
    
    win.webContents.openDevTools()
  } else {
    // 在生产环境中加载打包后的文件
    win.loadFile(path.join(__dirname, '../index.html'))
  }

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Failed to load:', errorCode, errorDescription)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 