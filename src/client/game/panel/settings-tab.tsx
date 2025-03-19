import React from 'react'
import { useNavigate } from 'react-router'
import { Button, Typography } from '@mui/material'

export const SettingsTab = () => {
    const navigate = useNavigate()
    const userData = window.zylSession.userData
    const onDisconnectClick = function () {
        window.ipcRenderer.send('logout')
        navigate('/')
    }
    return (
        <>
            <Typography
                title="User"
                style={{
                    width: '100%',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '24px',
                }}
            >
                {`${userData.user} `}
                <span style={{ fontWeight: 'normal' }}>
                    {`(${userData.master === 1 ? 'Master' : 'Player'})`}
                </span>
            </Typography>
            <Button fullWidth variant="contained" color="error" onClick={onDisconnectClick}>
                Disconnect
            </Button>
        </>
    )
}
