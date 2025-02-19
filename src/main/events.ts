import { BrowserWindow, dialog, ipcMain, IpcMainEvent, Menu, MenuItemConstructorOptions, MessageBoxSyncOptions } from 'electron'
import { io, Socket } from 'socket.io-client'
import { Logger } from './logger'
import { userQuery } from './querys'

type LoginData = {
    url: string
    user: string
    password: string
}

export class MainEvents {
    private static socket: Socket
    private static mainWindow: BrowserWindow

    static register(window: BrowserWindow) {
        this.mainWindow = window

        this.socket = io('http://174.50.225.10:3001')
        this.socket.on('connect_error', this.onConnectError)
        this.socket.on('connect', this.onConnect)

        ipcMain.on('show-alert', this.onShowAlert)
        ipcMain.on('show-confirm', this.onShowConfirm)
        ipcMain.on('show-context-menu', this.onShowContextMenu)

        ipcMain.on('request-server-status', (event: IpcMainEvent) => (event.returnValue = this.socket.connected))
        ipcMain.on('login', this.onLogin)
    }

    private static onConnectError = (err: Error) => {
        const message = 'Failed to connect to the server'
        Logger.error(message, err)
        this.mainWindow.webContents.send('server-status', { status: 'error', error: message })
    }

    private static onConnect = () => {
        Logger.log(this.socket.id)
        this.mainWindow.webContents.send('server-status', { status: 'connected' })
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

    private static query = (q: string, callback: (val: any) => void) => {
        this.socket.emit('query', q, callback)
    }

    private static onLogin = (event: IpcMainEvent, data: LoginData) => {
        Logger.log({ data })
        this.query(userQuery(data.user), (val: any) => {
            Logger.log({ val })
            event.reply('login-callback', val)
        })
    }
}
