import { 
    BrowserWindow, 
    dialog, 
    ipcMain, 
    IpcMainEvent, 
    Menu, 
    MenuItemConstructorOptions,
    MessageBoxSyncOptions 
} from 'electron'
import { io, Socket } from 'socket.io-client'
import { Logger } from './logger'
import { userQuery } from './querys'

type LoginData = {
    url: string
    user: string
    password: string
}

export class MainEvents
{
    private static socket: Socket

    static register()
    {
        ipcMain.on('show-alert', this.onShowAlert)
        ipcMain.on('show-confirm', this.onShowConfirm)
        ipcMain.on('show-context-menu', this.onShowContextMenu)

        ipcMain.on('login', this.onLogin)
    }

    private static onShowContextMenu(event: IpcMainEvent, mouseX: number, mouseY: number)
    { 
        const eventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const menuItems: MenuItemConstructorOptions[] = 
        [
            {
                label: 'Reload',
                click: () => eventBrowserWindow.reload()
            },
            {
                label: 'Exit Program',
                click: () => eventBrowserWindow.close()
            },
            {
                label: 'Inspect Element',
                click: () => eventBrowserWindow.webContents.inspectElement(mouseX, mouseY) 
            }
        ]
        Menu.buildFromTemplate(menuItems).popup({ window: eventBrowserWindow })
    }
    
    private static onShowAlert(event: IpcMainEvent, message: string)
    {
        const eventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const alertOptions: MessageBoxSyncOptions =
        {
            title: 'Alert',
            type: 'warning',
            buttons: ['Ok'],
            defaultId: 0,
            cancelId: 0,
            message
        }
        dialog.showMessageBoxSync(eventBrowserWindow, alertOptions)
    }
    
    private static onShowConfirm(event: IpcMainEvent, message: string)
    {
        const eventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const confirmOptions: MessageBoxSyncOptions = 
        {
            title: 'Confirm',
            type: 'question',
            buttons: ['Cancel', 'Ok'],
            message
        }
        event.returnValue = dialog.showMessageBoxSync(eventBrowserWindow, confirmOptions)
    }

    private static async onLogin(event: IpcMainEvent, data: LoginData) 
    {
        Logger.log({data})
        this.socket = io('http://localhost:3001')
        this.socket.on('connect', () => {
            Logger.log(this.socket.id)
            this.socket.emit('query', userQuery(data.user), (val: any) => {
                Logger.log({val})
                event.reply('login-callback', val)
            })
        })
    }
}
