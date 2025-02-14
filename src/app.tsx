import React from 'react'
import { createRoot } from 'react-dom/client'
const { ipcRenderer } = window.require('electron')

window.alert = (message: string) => ipcRenderer.send('show-alert', message)
window.confirm = (message: string) => ipcRenderer.sendSync('show-confirm', message)
window.addEventListener('contextmenu', (event: MouseEvent) => {
    ipcRenderer.send('show-context-menu', event.x, event.y)
})

const root = createRoot(document.body)
root.render(<h2>Hello from React!</h2>)