import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import { BuildFormComponents } from './shared/base-form'
import { PageFormWrapper } from './shared/page-form-wrapper'
import { DEFAULT_VALIDATIONS } from './shared/validations'
import { electron_listen } from '../app'

type ServerFieldValues = {
    url: string
}

const ServerForm = BuildFormComponents<ServerFieldValues>()

export const Server = () => {
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = React.useState('')

    const onSubmit: SubmitHandler<ServerFieldValues> = (data: ServerFieldValues) => {
        const cleanURL = data.url.trim().replace(/(\/|\\)$/, '')
        return new Promise<void>((resolve) => {
            electron_listen('initial-server-status', (_event: any, val: any) => {
                let error = ''
                if (val.error) error = val.error
                else {
                    window.zylSession.userData = { url: data.url }
                    window.ipcRenderer.send('save-user-data', {
                        url: window.zylSession.userData.url,
                    })
                    navigate('/login')
                }
                setErrorMessage(error)
                resolve()
            })
            window.ipcRenderer.send('connect-to-server', cleanURL)
        })
    }

    return (
        <PageFormWrapper pageTitle="Server">
            <ServerForm.Form onSubmit={onSubmit} errorMessage={errorMessage}>
                <ServerForm.TextField
                    autoFocus
                    field="url"
                    label="URL"
                    defaultValue={window.zylSession.userData.url}
                    validations={DEFAULT_VALIDATIONS}
                />
                <ServerForm.SubmitButton label={'Connect'} />
            </ServerForm.Form>
        </PageFormWrapper>
    )
}
