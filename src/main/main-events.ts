import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { io, Socket } from 'socket.io-client'
import { Logger } from './logger'
import { BrowserEvents } from './main-events/broswer-events'

export class MainEvents {
    private static socket: Socket
    private static mainWindow: BrowserWindow
    private static firstConnect: boolean = false

    private static register_emit = (channel: string) => {
        ipcMain.on(channel, (_event: IpcMainEvent, ...args: any[]) => {
            this.socket.emit(channel, ...args)
        })
    }

    private static register_emit_reply = (channel: string) => {
        ipcMain.on(channel, (event: IpcMainEvent, ...args: any[]) => {
            this.socket.emit(channel, ...args, (...args: any[]) => {
                event.reply(`${channel}-callback`, ...args)
            })
        })
    }

    private static register_window_send = (channel: string) => {
        this.socket.on(channel, (...args: any[]) => {
            this.mainWindow.webContents.send(channel, ...args)
        })
    }

    static register(window: BrowserWindow) {
        this.mainWindow = window

        BrowserEvents.register()

        ipcMain.on('reset', () => (this.firstConnect = false))
        ipcMain.on('connect-to-server', this.onConnectToServer)
        this.register_emit_reply('login')
        this.register_emit_reply('password-reset')
        ipcMain.on('logout', this.onLogout)
        this.register_emit_reply('user-save')
        this.register_emit_reply('scene-save')
        this.register_emit('set-current-scene')
        this.register_emit('scene-update')
        this.register_emit('get-scene')
    }

    private static onConnectToServer = (_event: IpcMainEvent, url: string) => {
        this.socket = io(url)
        this.socket.on('connect_error', this.onConnectError)
        this.socket.on('connect', this.onConnect)
        this.register_window_send('current-users')
        this.register_window_send('scene-data')
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

    private static onLogout = (_event: IpcMainEvent) => {
        this.firstConnect = false
        this.socket.emit('logout')
    }
}
