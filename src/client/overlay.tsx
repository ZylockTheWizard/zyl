import React from 'react'
import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import { register } from '../app'

export const Overlay = () => {
    const [connected, setConnected] = React.useState(true)
    register('server-status', (_event: any, val: any) => {
        if (val.status === 'connected') {
            setConnected(true)
        } else if (val.status === 'error') {
            setConnected(false)
        }
    })

    const overlayStyles: React.CSSProperties = {
        top: 0,
        gap: 40,
        left: 0,
        zIndex: 999,
        width: '100%',
        color: 'black',
        height: '100%',
        overflow: 'auto',
        position: 'fixed',
        alignItems: 'center',
        justifyContent: 'center',
        display: connected ? 'none' : 'flex',
        backgroundColor: 'rgba(128, 128, 128, 0.7)',
    }

    const loadingStyles: React.CSSProperties = {
        opacity: '1',
        width: '100px',
        height: '100px',
        color: 'inherit',
    }

    const onClick = () => {
        window.ipcRenderer.send('reset')
        setConnected(true)
        window.location.hash = '#/'
    }
    return (
        <Stack direction="column" justifyContent="space-between" style={overlayStyles}>
            <CircularProgress style={loadingStyles} />
            <Typography variant="h2">Connecting to the server...</Typography>
            <Button variant="contained" color="error" onClick={onClick}>
                Return to Server Page
            </Button>
        </Stack>
    )
}
