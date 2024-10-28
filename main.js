// main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
if (require("electron-squirrel-startup")) return;

// Configure logging
log.transports.file.level = "debug";
autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");

  // Check for updates after 3 seconds
  setTimeout(() => {
    checkForUpdates();
  }, 3000);
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

// Auto Updater events
autoUpdater.on("checking-for-update", () => {
  log.info("Checking for updates...");
});

autoUpdater.on("update-available", (info) => {
  log.info("Update available:", info);
  dialog.showMessageBox({
    type: "info",
    title: "Update Available",
    message: "A new version is available. The update is being downloaded now.",
    buttons: ["Okay"],
  });
});

autoUpdater.on("update-not-available", (info) => {
  log.info("Update not available:", info);
});

autoUpdater.on("download-progress", (progressObj) => {
  let message = `Download speed: ${progressObj.bytesPerSecond}`;
  message += ` - Downloaded ${progressObj.percent}%`;
  message += ` (${progressObj.transferred}/${progressObj.total})`;
  log.info(message);
  mainWindow.webContents.send("download-progress", progressObj.percent);
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("Update downloaded:", info);
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Ready",
      message: "Install update now?",
      buttons: ["Yes", "Later"],
    })
    .then((buttonIndex) => {
      if (buttonIndex.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
});

autoUpdater.on("error", (err) => {
  log.error("AutoUpdater error:", err);
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
