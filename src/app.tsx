import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { Engine } from '@babylonjs/core'
import { Login } from './client/login'
import { Overlay } from './client/overlay'
import { PasswordReset } from './client/password-reset'
import { Server } from './client/server'
import { Game } from './client/game'

type UserData = {
    id?: string
    url?: string
    password?: string
    connected?: boolean
}

class ZylSessionEntry {
    private _key: string
    constructor(key: string) {
        this._key = key
    }
    set(value?: string | object) {
        const str = value ? JSON.stringify(value) : ''
        sessionStorage.setItem(this._key, str)
    }
    get() {
        const entryString = sessionStorage.getItem(this._key)
        return entryString ? JSON.parse(entryString) : undefined
    }
}

class ZylSession {
    private _userData: ZylSessionEntry
    public set userData(data: UserData) {
        const newData = { ...this._userData.get(), ...data }
        this._userData.set(newData)
    }
    public get userData() {
        return this._userData.get()
    }

    private _currentUsers: ZylSessionEntry
    public set currentUsers(data: any[]) {
        this._currentUsers.set(data)
    }
    public get currentUsers() {
        return this._currentUsers.get()
    }

    private _currentScenes: ZylSessionEntry
    public set currentScenes(data: any[]) {
        this._currentScenes.set(data)
    }
    public get currentScenes() {
        return this._currentScenes.get()
    }

    private _currentSceneId: ZylSessionEntry
    public set currentSceneId(id: string) {
        this._currentSceneId.set(id)
    }
    public get currentSceneId() {
        return this._currentSceneId.get()
    }

    constructor() {
        this._userData = new ZylSessionEntry('userData')
        this._currentUsers = new ZylSessionEntry('currentUsers')
        this._currentScenes = new ZylSessionEntry('currentScenes')
        this._currentSceneId = new ZylSessionEntry('currentSceneId')
    }
}

type ElectronCallback = (event: Electron.IpcRendererEvent, ...args: any[]) => void

declare global {
    interface Window {
        zylSession: ZylSession
        ipcRenderer: Electron.IpcRenderer
        babylonEngine: Engine
    }
    interface Document {
        getElementById<T extends HTMLElement>(id: string): T | null
    }
}

window.zylSession = new ZylSession()

window.ipcRenderer = window.require('electron').ipcRenderer

window.alert = (message: string) => window.ipcRenderer.send('show-alert', message)
window.confirm = (message: string) => window.ipcRenderer.sendSync('show-confirm', message)
window.addEventListener('contextmenu', (event: MouseEvent) => {
    window.ipcRenderer.send('show-context-menu', event.x, event.y)
})

window.zylSession.userData = window.ipcRenderer.sendSync('initial-data')

export const register = (channel: string, callback: ElectronCallback) => {
    window.ipcRenderer.removeAllListeners(channel)
    window.ipcRenderer.on(channel, callback)
}

export const send_register = (channel: string, callback: ElectronCallback, ...args: any[]) => {
    register(`${channel}-callback`, callback)
    window.ipcRenderer.send(channel, ...args)
}

ReactDOM.createRoot(document.body).render(
    <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <CssBaseline />
        <Overlay />
        <HashRouter>
            <Routes>
                <Route path="/" element={<Server />} />
                <Route path="/login" element={<Login />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </HashRouter>
    </ThemeProvider>,
)
