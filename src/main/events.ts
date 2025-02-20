import fs from 'node:fs'
import path from 'node:path'
import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent, Menu, MenuItemConstructorOptions, MessageBoxSyncOptions } from 'electron'

import { io, Socket } from 'socket.io-client'
import { Logger } from './logger'
import { passwordResetQuery, userQuery } from './querys'

type LoginData = {
    user: string
    password: string
}

type PasswordResetData = {
    user: string
    newPassword: string
}

export class MainEvents {
    private static socket: Socket
    private static appDataFile: string
    private static mainWindow: BrowserWindow
    private static url = 'http://174.50.225.10:3001'

    static register(window: BrowserWindow) {
        this.mainWindow = window

        this.appDataFile = path.join(app.getPath('userData'), 'userData.json')

        this.socket = io(this.url)
        this.socket.on('connect_error', this.onConnectError)
        this.socket.on('connect', this.onConnect)

        ipcMain.on('show-alert', this.onShowAlert)
        ipcMain.on('show-confirm', this.onShowConfirm)
        ipcMain.on('show-context-menu', this.onShowContextMenu)

        ipcMain.on('initial-data', this.onInitialData)
        ipcMain.on('login', this.onLogin)
        ipcMain.on('password-reset', this.onPasswordReset)
        ipcMain.on('save-user-data', this.onSaveUserData)
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

    private static onInitialData = (event: IpcMainEvent) => {
        const fileExists = fs.existsSync(this.appDataFile)
        const data = fileExists ? JSON.parse(fs.readFileSync(this.appDataFile, 'utf8')) : {}
        event.returnValue = { ...data, connected: this.socket.connected, url: this.url }
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

    private static onPasswordReset = (event: IpcMainEvent, data: PasswordResetData) => {
        Logger.log({ data })
        this.query(passwordResetQuery(data.user, data.newPassword), (val: any) => {
            Logger.log({ val })
            event.reply('password-reset-callback', val)
        })
    }

    private static onSaveUserData = (_event: IpcMainEvent, data: LoginData) => {
        Logger.log({ data })
        fs.writeFileSync(this.appDataFile, JSON.stringify(data))
    }
}
