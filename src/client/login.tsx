import React from 'react'
import { useNavigate } from 'react-router'
import { FieldError, SubmitHandler, useForm } from 'react-hook-form'
import { Alert, Button, CircularProgress, FormControl, TextField, TextFieldVariants } from '@mui/material'
import { PageForm } from './shared/page-form'

type LoginForm = {
    user: string
    password: string
}

export const Login = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState } = useForm<LoginForm>()
    const { errors } = formState

    const [errorMessage, setErrorMessage] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const onSubmit: SubmitHandler<LoginForm> = (data: LoginForm) => {
        console.log({ data })
        setLoading(true)
        window.register('login-callback', (_event: any, val: any) => {
            setLoading(false)
            console.log({ loginCallback: val })

            window.zylSession.userData = {
                user: data.user,
                password: data.password,
            }

            let error = ''
            if (val.error) error = val.error
            else if (val.result.passwordReset) navigate('/password-reset')
            else {
                window.zylSession.loginData = val.result
                navigate('/chat')
            }

            setErrorMessage(error)
        })
        window.ipcRenderer.send('login', data)
    }

    const fieldProps = (label: string, field: string, error: FieldError) => {
        const registerOptions = {
            required: label + ' is required',
            maxLength: {
                value: 255,
                message: label + ' cannot be greater than 255 characters',
            },
        }
        return {
            label,
            id: field,
            name: field,
            error: !!error,
            fullWidth: true,
            disabled: loading,
            helperText: error?.message,
            variant: 'outlined' as TextFieldVariants,
            ...register(field as any, registerOptions),
        }
    }

    return (
        <PageForm pageTitle="Sign In" onSubmit={handleSubmit(onSubmit)}>
            <FormControl>
                <TextField autoFocus defaultValue={window.zylSession.userData.user} {...fieldProps('User', 'user', errors.user)} />
            </FormControl>
            <FormControl>
                <TextField
                    type="password"
                    defaultValue={window.zylSession.userData.password}
                    {...fieldProps('Password', 'password', errors.password)}
                />
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
