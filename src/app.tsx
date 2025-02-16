import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Login } from './client/login'
import { Chat } from './client/chat'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'

const { ipcRenderer } = window.require('electron')
window.alert = (message: string) => ipcRenderer.send('show-alert', message)
window.confirm = (message: string) => ipcRenderer.sendSync('show-confirm', message)
window.addEventListener('contextmenu', (event: MouseEvent) => {
    ipcRenderer.send('show-context-menu', event.x, event.y)
})

const darkTheme = createTheme({palette: {mode: 'dark'}})

ReactDOM.createRoot(document.body).render(  
    <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
            <Routes>
                <Route path="/main_window" element={<Login />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>
        </BrowserRouter>
    </ThemeProvider>
)