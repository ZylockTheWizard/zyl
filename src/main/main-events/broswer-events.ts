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

export type LoginData = {
    url: string
    user: string
    password: string
}

export class BrowserEvents {
    private static appDataFile: string

    static register() {
        this.appDataFile = path.join(app.getPath('userData'), 'userData.json')

        ipcMain.on('show-alert', this.onShowAlert)
        ipcMain.on('show-confirm', this.onShowConfirm)
        ipcMain.on('show-context-menu', this.onShowContextMenu)
        ipcMain.on('save-user-data', this.onSaveUserData)
        ipcMain.on('initial-data', this.onInitialData)
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

    private static getAppData = () => {
        const fileExists = fs.existsSync(this.appDataFile)
        return fileExists ? JSON.parse(fs.readFileSync(this.appDataFile, 'utf8')) : {}
    }

    private static onSaveUserData = (_event: IpcMainEvent, data: LoginData) => {
        const newData = { ...this.getAppData(), ...data }
        fs.writeFileSync(this.appDataFile, JSON.stringify(newData))
    }

    private static onInitialData = (event: IpcMainEvent) => {
        event.returnValue = this.getAppData()
    }
}
