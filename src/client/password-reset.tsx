import React from 'react'
import { useNavigate } from 'react-router'
import { FieldError, SubmitHandler, useForm } from 'react-hook-form'
import { Alert, Button, CircularProgress, FormControl, TextField } from '@mui/material'
import { PageForm, pageFormFieldPropGenerator } from './shared/page-form'

type PasswordResetForm = {
    newPassword: string
    verifyPassword: string
}

export const PasswordReset = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState } = useForm<PasswordResetForm>()
    const { errors } = formState

    const [errorMessage, setErrorMessage] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const onSubmit: SubmitHandler<PasswordResetForm> = (data: PasswordResetForm) => {
        console.log({ data })
        if (data.newPassword !== data.verifyPassword) {
            setErrorMessage('The passwords do not match')
            return
        }
        setLoading(true)
        window.zylSession.userData = { password: data.newPassword }
        window.register('password-reset-callback', (_event: any, val: any) => {
            setLoading(false)
            console.log({ val })

            let error = ''
            if (val.error) error = val.error
            else navigate('/login')

            setErrorMessage(error)
        })
        window.ipcRenderer.send('password-reset', window.zylSession.userData)
    }

    const fieldProps = (label: string, field: string, error: FieldError) => {
        return pageFormFieldPropGenerator({ label, field, error, loading, register })
    }

    return (
        <PageForm pageTitle="Password Reset" onSubmit={handleSubmit(onSubmit)}>
            <FormControl>
                <TextField type="password" {...fieldProps('New Password', 'newPassword', errors.newPassword)} />
            </FormControl>
            <FormControl>
                <TextField type="password" {...fieldProps('Verify Password', 'verifyPassword', errors.verifyPassword)} />
            </FormControl>
            <Button type="submit" fullWidth variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={25} /> : 'Sign in'}
            </Button>
            {errorMessage && (
                <Alert variant="filled" severity="error">
                    {errorMessage}
                </Alert>
            )}
        </PageForm>
    )
}
