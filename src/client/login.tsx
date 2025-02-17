import React from 'react'
//import { useNavigate } from 'react-router'
import { FieldError, SubmitHandler, useForm } from 'react-hook-form'
import { 
    Box, 
    Button, 
    Card, 
    FormControl, 
    Stack, 
    TextField, 
    TextFieldVariants, 
    Typography 
} from '@mui/material'

type LoginForm = {
    url: string
    user: string
    password: string
}

export const Login = () => {
    const cardStyles: React.CSSProperties = {
        gap: 20,
        width: '300px',
        display: 'flex',
        padding: '32px',
        alignSelf: 'center',
        flexDirection: 'column'
    }

    const stackStyles: React.CSSProperties = {
        padding: '16px',
        justifyContent: 'center'
    }

    //const navigate = useNavigate()
    const { register, handleSubmit, formState } = useForm<LoginForm>()
    const { errors } = formState

    const onSubmit: SubmitHandler<LoginForm> = (data: LoginForm) => {
        console.log({data})
        window.ipcRenderer.on('login-callback', (_event: any, val: any) => {
            console.log({val})
        })
        window.ipcRenderer.send('login', data)
        //navigate('/chat')
    }

    const fieldProps = (label: string, field: string, error: FieldError) => {
        const registerOptions = {
            required: label + ' is required',
            maxLength: {
                value: 255,
                message: label + ' cannot be greater than 255 characters'
            }
        }
        return {
            label,
            id: field,
            name: field,
            error: !!error,
            fullWidth: true,
            helperText: error?.message,
            variant: 'outlined' as TextFieldVariants,
            ...register(field as any, registerOptions)
        }
    }

    return (
        <Stack 
            direction="column" 
            justifyContent="space-between" 
            style={stackStyles}
        >
            <Card style={cardStyles} variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: '34px' }}
                >
                    Sign in
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 4,
                    }}
                >
                    <FormControl>
                        <TextField autoFocus {...fieldProps('URL', 'url', errors.url)} />
                    </FormControl>
                    <FormControl>
                        <TextField {...fieldProps('User', 'user', errors.user)} />
                    </FormControl>
                    <FormControl>
                        <TextField type="password" {
                            ...fieldProps('Password', 'password', errors.password)
                        } />
                    </FormControl>
                    <Button type="submit" fullWidth variant="contained">
                        Sign in
                    </Button>
                </Box>
            </Card>
        </Stack>
    )
}