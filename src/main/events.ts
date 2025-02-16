import { 
    BrowserWindow, 
    dialog, 
    ipcMain, 
    IpcMainEvent, 
    Menu, 
    MenuItemConstructorOptions,
    MessageBoxSyncOptions 
} from 'electron'
import { io } from 'socket.io-client'
import { Logger } from './logger'

export class MainEvents
{
    static register()
    {
        ipcMain.on('show-alert', this.onShowAlert)
        ipcMain.on('show-confirm', this.onShowConfirm)
        ipcMain.on('show-context-menu', this.onShowContextMenu)

        const socket = io('http://174.50.225.10:3001/')
        socket.on('connect', () => {
            Logger.log(socket.id)
            socket.emit('login', {id: 'Cory', password: ''}, (val: string) => {Logger.log(val)})
        })
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
}
