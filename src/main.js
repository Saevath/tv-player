const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true
    });

    win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
    ipcMain.handle('get-channels', handleGetChannels);
    ipcMain.handle('get-blocklist', handleGetBlockList);
    ipcMain.handle('get-categories', handleGetCategories);
    ipcMain.handle('get-languages', handleGetLanguages);
    ipcMain.handle('get-countries', handleGetCountries);
    ipcMain.handle('get-streams', handleGetStreams);
    createWindow();
});

app.on('window-all-closed', () => app.quit());

async function handleGetChannels() {
    return new Promise((resolve, reject) => {
        fetch('https://iptv-org.github.io/api/channels.json')
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    })
}

async function handleGetBlockList() {
    return new Promise((resolve, reject) => {
        fetch('https://iptv-org.github.io/api/blocklist.json')
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    })
}

async function handleGetCategories() {
    return new Promise((resolve, reject) => {
        fetch('https://iptv-org.github.io/api/categories.json')
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    })
}

async function handleGetLanguages() {
    return new Promise((resolve, reject) => {
        fetch('https://iptv-org.github.io/api/languages.json')
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    })
}

async function handleGetCountries() {
    return new Promise((resolve, reject) => {
        fetch('https://iptv-org.github.io/api/countries.json')
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    })
}

async function handleGetStreams() {
    return new Promise((resolve, reject) => {
        fetch('https://iptv-org.github.io/api/streams.json')
        .then(res => resolve(res.json()))
        .catch(err => reject(err));
    })
}
