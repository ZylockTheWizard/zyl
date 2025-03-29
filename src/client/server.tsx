import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import { Button, CircularProgress } from '@mui/material'
import { BuildFormComponents } from './shared/base-form'
import { PageFormWrapper } from './shared/page-form-wrapper'
import { PRIMARY_VALIDATIONS } from './shared/validations'
import { register } from '../app'

type ServerFieldValues = {
    url: string
}

const ServerForm = BuildFormComponents<ServerFieldValues>()

export const Server = () => {
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const onSubmit: SubmitHandler<ServerFieldValues> = (data: ServerFieldValues) => {
        setLoading(true)

        const cleanURL = data.url.trim().replace(/(\/|\\)$/, '')
        register('initial-server-status', (_event: any, val: any) => {
            setLoading(false)

            let error = ''
            if (val.error) error = val.error
            else {
                window.zylSession.userData = { url: data.url }
                window.ipcRenderer.send('save-user-data', { url: window.zylSession.userData.url })
                navigate('/login')
            }

            setErrorMessage(error)
        })
        window.ipcRenderer.send('connect-to-server', cleanURL)
    }

    return (
        <PageFormWrapper pageTitle="Server">
            <ServerForm.Form onSubmit={onSubmit} loading={loading} errorMessage={errorMessage}>
                <ServerForm.TextField
                    autoFocus
                    field="url"
                    label="URL"
                    defaultValue={window.zylSession.userData.url}
                    validations={PRIMARY_VALIDATIONS}
                />
                <Button type="submit" fullWidth variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={25} /> : 'Connnect'}
                </Button>
            </ServerForm.Form>
        </PageFormWrapper>
    )
}
