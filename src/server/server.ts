import { 
    app, 
    BrowserWindow, 
    BrowserWindowConstructorOptions, 
    dialog, 
    ipcMain, 
    IpcMainEvent, 
    Menu, 
    MenuItemConstructorOptions,
    MessageBoxSyncOptions 
} from 'electron'
import { io } from "socket.io-client"

class ServerEvents
{
    static Register()
    {
        ipcMain.on('show-alert', this.OnShowAlert)
        ipcMain.on('show-confirm', this.OnShowConfirm)
        ipcMain.on('show-context-menu', this.OnShowContextMenu)
    }

    private static OnShowContextMenu(event: IpcMainEvent, MouseX: number, MouseY: number)
    {
        const EventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const MenuItems: MenuItemConstructorOptions[] = 
        [
            {
                label: 'Reload',
                click: () => EventBrowserWindow.reload()
            },
            {
                label: 'Exit Program',
                click: () => EventBrowserWindow.close()
            },
            {
                label: 'Inspect Element',
                click: () => EventBrowserWindow.webContents.inspectElement(MouseX, MouseY) 
            }
        ]
        Menu.buildFromTemplate(MenuItems).popup({ window: EventBrowserWindow })
    }
    
    private static OnShowAlert(event: IpcMainEvent, message: string)
    {
        const EventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const AlertOptions: MessageBoxSyncOptions =
        {
            title: 'Alert',
            type: 'warning',
            buttons: ["Ok"],
            defaultId: 0,
            cancelId: 0,
            message
        }
        dialog.showMessageBoxSync(EventBrowserWindow, AlertOptions)
    }
    
    private static OnShowConfirm(event: IpcMainEvent, message: string)
    {
        const EventBrowserWindow = BrowserWindow.fromWebContents(event.sender)
        const ConfirmOptions: MessageBoxSyncOptions = 
        {
            title: 'Confirm',
            type: 'question',
            buttons: ["Cancel", "Ok"],
            message
        }
        event.returnValue = dialog.showMessageBoxSync(EventBrowserWindow, ConfirmOptions)
    }
}


export class Server 
{
    static start(html: string, preload: string)
    {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        if (require('electron-squirrel-startup')) app.quit()

        if(!app.requestSingleInstanceLock()) app.quit()

        let mainWindow: BrowserWindow
        const mainWindowOptions: BrowserWindowConstructorOptions = {
            width: 800,
            height: 600,
            title: 'Zyl',
            icon: 'zyl-icon.ico',
            autoHideMenuBar: true,
            webPreferences: {
                preload,
                nodeIntegration: true,
                contextIsolation: false
            }
        }

        const onAppSecondInstance = () => {
            if (!mainWindow) return
            mainWindow.restore()
            mainWindow.focus()
        }

        const createWindow = (): void => {
            mainWindow = new BrowserWindow(mainWindowOptions)
            mainWindow.loadURL(html)
            if(process.argv.length > 2 && process.argv[2] === 'dev')
                mainWindow.webContents.openDevTools()
        }

        app.on('second-instance', onAppSecondInstance)
        app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())

        ServerEvents.Register()

        app.whenReady().then(createWindow)

        const socket = io("http://174.50.225.10:3001/")
        console.log('hellow world')
        socket.on("connect", () => {
            console.log(socket.id)
            socket.emit("login", {id: "Cory", password: ""}, (val: string) => {console.log(val)})
        })
    
    }
}