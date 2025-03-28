import fs from 'node:fs'
import path from 'node:path'
import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    IpcMainEvent,
    Menu,
    MenuItemConstructorOptions,
    MessageBoxSyncOptions,
} from 'electron'
import { io, Socket } from 'socket.io-client'
import { Logger } from './logger'

type LoginData = {
    url: string
    user: string
    password: string
}

export class MainEvents {
    private static socket: Socket
    private static appDataFile: string
    private static mainWindow: BrowserWindow
    private static firstConnect: boolean = false

    static register(window: BrowserWindow) {
        this.mainWindow = window

        this.appDataFile = path.join(app.getPath('userData'), 'userData.json')

        ipcMain.on('show-alert', this.onShowAlert)
        ipcMain.on('show-confirm', this.onShowConfirm)
        ipcMain.on('show-context-menu', this.onShowContextMenu)

        ipcMain.on('reset', () => (this.firstConnect = false))
        ipcMain.on('initial-data', this.onInitialData)
        ipcMain.on('connect-to-server', this.onConnectToServer)
        ipcMain.on('login', this.onLogin)
        ipcMain.on('password-reset', this.onPasswordReset)
        ipcMain.on('logout', this.onLogout)
        ipcMain.on('save-user-data', this.onSaveUserData)
        ipcMain.on('message', this.onMessage)
        ipcMain.on('user-save', this.onUserSave)
        ipcMain.on('scene-save', this.onSceneSave)
        ipcMain.on('set-current-scene', this.onSetCurrentScene)
    }

    private static onShowContextMenu = (event: IpcMainEvent, mouseX: number, mouseY: number) => {
        const eventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const menuItems: MenuItemConstructorOptions[] = [
            {
                label: 'Reload',
                click: () => eventBrowserWindow.reload(),
            },
            {
                label: 'Exit Program',
                click: () => eventBrowserWindow.close(),
            },
            {
                label: 'Inspect Element',
                click: () => eventBrowserWindow.webContents.inspectElement(mouseX, mouseY),
            },
        ]
        Menu.buildFromTemplate(menuItems).popup({ window: eventBrowserWindow })
    }

    private static onShowAlert = (event: IpcMainEvent, message: string) => {
        const eventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const alertOptions: MessageBoxSyncOptions = {
            title: 'Alert',
            type: 'warning',
            buttons: ['Ok'],
            defaultId: 0,
            cancelId: 0,
            message,
        }
        dialog.showMessageBoxSync(eventBrowserWindow, alertOptions)
    }

    private static onShowConfirm = (event: IpcMainEvent, message: string) => {
        const eventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const confirmOptions: MessageBoxSyncOptions = {
            title: 'Confirm',
            type: 'question',
            buttons: ['Cancel', 'Ok'],
            message,
        }
        event.returnValue = dialog.showMessageBoxSync(eventBrowserWindow, confirmOptions)
    }

    private static onConnectToServer = (_event: IpcMainEvent, url: string) => {
        this.socket = io(url)
        this.socket.on('connect_error', this.onConnectError)
        this.socket.on('connect', this.onConnect)
        this.socket.on('current-users', this.onUsers)
        this.socket.on('current-messages', this.onMessages)
        this.socket.on('scene-data', this.onSceneData)
    }

    private static onConnectError = (err: Error) => {
        const message = 'Failed to connect to the server'
        Logger.error(message, err)
        if (!this.firstConnect) {
            this.socket.disconnect()
            this.mainWindow.webContents.send('initial-server-status', {
                status: 'error',
                error: message,
            })
        } else {
            this.mainWindow.webContents.send('server-status', { status: 'error', error: message })
        }
    }

    private static onConnect = () => {
        Logger.log(this.socket.id)
        if (!this.firstConnect) {
            this.firstConnect = true
            this.mainWindow.webContents.send('initial-server-status', { status: 'connected' })
        } else {
            this.mainWindow.webContents.send('server-status', { status: 'connected' })
        }
    }

    private static query = (q: string, callback: (val: any) => void) => {
        this.socket.emit('query', q, callback)
    }

    private static onLogin = (event: IpcMainEvent, data: LoginData) => {
        this.socket.emit('login', data.user, data.password, (val: any) => {
            event.reply('login-callback', val)
        })
    }

    private static onLogout = (_event: IpcMainEvent) => {
        this.firstConnect = false
        this.socket.emit('logout')
    }

    private static onPasswordReset = (event: IpcMainEvent, data: LoginData) => {
        this.socket.emit('password-reset', data.user, data.password, (val: any) => {
            event.reply('password-reset-callback', val)
        })
    }

    private static getAppData = () => {
        const fileExists = fs.existsSync(this.appDataFile)
        return fileExists ? JSON.parse(fs.readFileSync(this.appDataFile, 'utf8')) : {}
    }

    private static onInitialData = (event: IpcMainEvent) => {
        event.returnValue = this.getAppData()
    }

    private static onSaveUserData = (_event: IpcMainEvent, data: LoginData) => {
        const newData = { ...this.getAppData(), ...data }
        fs.writeFileSync(this.appDataFile, JSON.stringify(newData))
    }

    private static onMessage = (_event: IpcMainEvent, message: string) => {
        this.socket.emit('message', message)
    }

    private static onMessages = (val: any) => {
        this.mainWindow.webContents.send('current-messages', val)
    }

    private static onUsers = (val: any) => {
        this.mainWindow.webContents.send('current-users', val)
    }

    private static onUserSave = (event: IpcMainEvent, id: string) => {
        this.socket.emit('user-save', id, (val: any) => {
            event.reply('user-save-callback', val)
        })
    }

    private static onSceneSave = (event: IpcMainEvent, name: string, data: string) => {
        this.socket.emit('scene-save', name, data, (val: any) => {
            event.reply('scene-save-callback', val)
        })
    }

    private static onSceneData = (val: any) => {
        this.mainWindow.webContents.send('scene-data', val)
    }

    private static onSetCurrentScene = (_event: IpcMainEvent, sceneId: string, user: string) => {
        this.socket.emit('set-current-scene', sceneId, user)
    }
}
