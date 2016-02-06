/*
 * Mistelten v1.0.0
 *  GitHubのRepositoryのReleaseのダウンロード数を簡単に確認するソフト
 *  Author: prince
 *  制作開始: 2016/02/06
 */

/*jshint esnext: true*/

const electron = require('electron');

const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

const path = require('path');

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin')
    app.quit();
});

app.on('ready', function() {
  var winOpt = {
    width: 800,
    height: 600,
    show: false
  };
  if (process.platform !== 'linux')
    winOpt.icon = '../app-icon/icon.png';

  mainWindow = new BrowserWindow(winOpt);

  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

  mainWindow.webContents.on('dom-ready', function() {
    mainWindow.show();
    mainWindow.openDevTools();
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
