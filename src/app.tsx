import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"
import { Login } from "./client/login"
import { Chat } from "./client/chat"

const { ipcRenderer } = window.require('electron')
window.alert = (message: string) => ipcRenderer.send('show-alert', message)
window.confirm = (message: string) => ipcRenderer.sendSync('show-confirm', message)
window.addEventListener('contextmenu', (event: MouseEvent) => {
    ipcRenderer.send('show-context-menu', event.x, event.y)
})

ReactDOM.createRoot(document.body).render(  
    <BrowserRouter>
        <Routes>
            <Route path="/main_window" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
        </Routes>
    </BrowserRouter>
)