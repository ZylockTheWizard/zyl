import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { MainEvents } from './events'

export class Main {
    static mainWindow: BrowserWindow
    static mainWindowOptions: BrowserWindowConstructorOptions = {
        width: 800,
        height: 600,
        title: 'Zyl',
        icon: 'zyl-icon.ico',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    }

    static onAppSecondInstance = () => {
        if (!this.mainWindow) return
        this.mainWindow.restore()
        this.mainWindow.focus()
    }

    static onWindowAllClosed = () => {
        if (process.platform !== 'darwin') app.quit()
    }

    static createWindow = (html: string, preload: string) => {
        this.mainWindowOptions.webPreferences.preload = preload
        this.mainWindow = new BrowserWindow(this.mainWindowOptions)
        this.mainWindow.loadURL(html)
        MainEvents.register(this.mainWindow)
        if (process.argv.length > 2 && process.argv[2] === 'dev')
            this.mainWindow.webContents.openDevTools()
    }

    static start(html: string, preload: string) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        if (require('electron-squirrel-startup')) app.quit()

        //if (!app.requestSingleInstanceLock()) app.quit()
        //app.on('second-instance', this.onAppSecondInstance)
        app.on('window-all-closed', this.onWindowAllClosed)

        app.whenReady().then(() => this.createWindow(html, preload))
    }
}
