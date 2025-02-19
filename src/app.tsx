import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Login } from './client/login'
import { Chat } from './client/chat'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { Overlay } from './client/overlay'

declare global {
    interface Window {
        ipcRenderer: Electron.IpcRenderer
        register: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
    }
    interface Document {
        getElementById<T extends HTMLElement>(id: string): T | null
    }
}

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

const darkTheme = createTheme({ palette: { mode: 'dark' } })

ReactDOM.createRoot(document.body).render(
    <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Overlay />
        <BrowserRouter>
            <Routes>
                <Route path="/main_window" element={<Login />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>
        </BrowserRouter>
    </ThemeProvider>,
)
