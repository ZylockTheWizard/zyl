import React from 'react'
import { useNavigate } from 'react-router'
import { FieldError, SubmitHandler, useForm } from 'react-hook-form'
import { Alert, Button, CircularProgress, FormControl, TextField } from '@mui/material'
import { PageForm, pageFormFieldPropGenerator } from './shared/page-form'

type ServerForm = {
    url: string
}

export const Server = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState } = useForm<ServerForm>()
    const { errors } = formState

    const [errorMessage, setErrorMessage] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const onSubmit: SubmitHandler<ServerForm> = (data: ServerForm) => {
        console.log({ data })
        const cleanURL = data.url.trim().replace(/(\/|\\)$/, '')
        setLoading(true)
        window.register('initial-server-status', (_event: any, val: any) => {
            setLoading(false)
            console.log({ val })

            let error = ''
            if (val.error) {
                error = val.error
            } else {
                window.zylSession.userData = {
                    url: data.url,
                }
                window.ipcRenderer.send('save-user-data', { url: window.zylSession.userData.url })
                navigate('/login')
            }

            setErrorMessage(error)
        })
        window.ipcRenderer.send('connect-to-server', cleanURL)
    }

    const fieldProps = (label: string, field: string, error: FieldError) => {
        return pageFormFieldPropGenerator({ label, field, error, loading, register })
    }

    return (
        <PageForm pageTitle="Server" onSubmit={handleSubmit(onSubmit)}>
            <FormControl>
                <TextField autoFocus defaultValue={window.zylSession.userData.url} {...fieldProps('URL', 'url', errors.url)} />
            </FormControl>
            <Button type="submit" fullWidth variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={25} /> : 'Connnect'}
            </Button>
            {errorMessage && (
                <Alert variant="filled" severity="error">
                    {errorMessage}
                </Alert>
            )}
        </PageForm>
    )
}
