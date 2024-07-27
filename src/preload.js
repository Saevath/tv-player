const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('remote', {
    getChannels: () => ipcRenderer.invoke('get-channels'),
    getBlockList: () => ipcRenderer.invoke('get-blocklist'),
    getCategories: () => ipcRenderer.invoke('get-categories'),
    getLanguages:() => ipcRenderer.invoke('get-languages'),
    getCountries:() => ipcRenderer.invoke('get-countries'),
    getStreams: () => ipcRenderer.invoke('get-streams')
});