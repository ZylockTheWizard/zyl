import React from 'react'
import { useNavigate } from 'react-router'
import { Button, Typography } from '@mui/material'
import { isMaster } from '../../shared/common-functions'

export const SettingsTab = () => {
    const navigate = useNavigate()
    const userData = window.zylSession.userData
    console.log({ userData })
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
                {`${userData.id} `}
                <span style={{ fontWeight: 'normal' }}>
                    {`(${isMaster() ? 'Master' : 'Player'})`}
                </span>
            </Typography>
            <Button fullWidth variant="contained" color="error" onClick={onDisconnectClick}>
                Disconnect
            </Button>
        </>
    )
}
