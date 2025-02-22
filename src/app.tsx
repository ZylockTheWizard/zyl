import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router'
import { Login } from './client/login'
import { Chat } from './client/chat'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { Overlay } from './client/overlay'
import { PasswordReset } from './client/password-reset'
import { Server } from './client/server'

type UserData = {
    user?: string
    password?: string
    connected?: boolean
    url?: string
}

type LoginData = {
    users?: string[]
    messages?: any[]
}

class ZylSession {
    private _userData: UserData
    public set userData(data: UserData) {
        this._userData = { ...this._userData, ...data }
        sessionStorage.setItem('userData', JSON.stringify(this._userData))
    }
    public get userData() {
        return this._userData
    }

    private _loginData: LoginData
    public set loginData(data: LoginData) {
        this._loginData = { ...this._loginData, ...data }
        sessionStorage.setItem('loginData', JSON.stringify(this._loginData))
    }
    public get loginData() {
        return this._loginData
    }

    constructor() {
        this._userData = JSON.parse(sessionStorage.getItem('userData'))
        this._loginData = JSON.parse(sessionStorage.getItem('loginData'))
    }
}

declare global {
    interface Window {
        zylSession: ZylSession
        ipcRenderer: Electron.IpcRenderer
        register: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
    }
    interface Document {
        getElementById<T extends HTMLElement>(id: string): T | null
    }
    let zylSession: ZylSession
}

window.zylSession = new ZylSession()

window.ipcRenderer = window.require('electron').ipcRenderer
window.register = (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
    window.ipcRenderer.removeAllListeners(channel)
    window.ipcRenderer.on(channel, callback)
}

window.alert = (message: string) => window.ipcRenderer.send('show-alert', message)
window.confirm = (message: string) => window.ipcRenderer.sendSync('show-confirm', message)
window.addEventListener('contextmenu', (event: MouseEvent) => {
    window.ipcRenderer.send('show-context-menu', event.x, event.y)
})

window.zylSession.userData = window.ipcRenderer.sendSync('initial-data')

const darkTheme = createTheme({ palette: { mode: 'dark' } })

ReactDOM.createRoot(document.body).render(
    <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Overlay />
        <HashRouter>
            <Routes>
                <Route path="/" element={<Server />} />
                <Route path="/login" element={<Login />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>
        </HashRouter>
    </ThemeProvider>,
)
