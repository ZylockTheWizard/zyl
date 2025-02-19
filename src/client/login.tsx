import React from 'react'
import { useNavigate } from 'react-router'
import { FieldError, SubmitHandler, useForm } from 'react-hook-form'
import { Alert, Box, Button, Card, CircularProgress, FormControl, Stack, TextField, TextFieldVariants, Typography } from '@mui/material'

type LoginForm = {
    user: string
    password: string
}

export const Login = () => {
    const cardStyles: React.CSSProperties = {
        gap: 20,
        width: '390px',
        display: 'flex',
        padding: '32px',
        alignSelf: 'center',
        flexDirection: 'column',
    }

    const stackStyles: React.CSSProperties = {
        height: '80%',
        padding: '16px',
        justifyContent: 'center',
    }

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
            console.log({ val })

            let error = ''
            if (val.error) error = val.error
            else if (val.length === 0) error = 'User not found'
            else if (val[0].password !== data.password) error = 'Password is incorrect'
            else if (val[0].passwordReset === 1) navigate('/chat')
            else navigate('/chat')

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
        <Stack direction="column" justifyContent="space-between" style={stackStyles}>
            <Card style={cardStyles} variant="outlined">
                <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: '34px' }}>
                    Sign in
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    sx={{
                        gap: 4,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <FormControl>
                        <TextField autoFocus {...fieldProps('User', 'user', errors.user)} />
                    </FormControl>
                    <FormControl>
                        <TextField type="password" {...fieldProps('Password', 'password', errors.password)} />
                    </FormControl>
                    <Button type="submit" fullWidth variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={25} /> : 'Sign in'}
                    </Button>
                    {errorMessage && (
                        <Alert variant="filled" severity="error">
                            {errorMessage}
                        </Alert>
                    )}
                </Box>
            </Card>
        </Stack>
    )
}
