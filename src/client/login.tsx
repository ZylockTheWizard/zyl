import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import { Button, CircularProgress } from '@mui/material'
import { BuildFormComponents } from './shared/base-form'
import { PageFormWrapper } from './shared/page-form-wrapper'
import { PRIMARY_VALIDATIONS } from './shared/validations'
import { areEqual } from './shared/common-functions'

type LoginFieldValues = {
    user: string
    password: string
}

const LoginForm = BuildFormComponents<LoginFieldValues>()

export const Login = () => {
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const onSubmit: SubmitHandler<LoginFieldValues> = (data: LoginFieldValues) => {
        console.log({ data })
        setLoading(true)
        window.register('login-callback', (_event: any, val: any) => {
            setLoading(false)
            console.log({ loginCallback: val })

            let error = ''
            if (val.error) error = val.error
            else if (val.result.passwordReset) navigate('/password-reset')
            else {
                window.zylSession.currentUsers = val.result.users
                window.zylSession.currentScenes = val.result.scenes
                window.zylSession.userData = window.zylSession.currentUsers.find((u) =>
                    areEqual(u.id, data.user),
                )
                navigate('/game')
            }

            setErrorMessage(error)
        })
        window.ipcRenderer.send('login', data)
    }

    return (
        <PageFormWrapper pageTitle="Sign In">
            <LoginForm.Form onSubmit={onSubmit} loading={loading} errorMessage={errorMessage}>
                <LoginForm.TextField
                    autoFocus
                    field="user"
                    defaultValue={window.zylSession.userData.user}
                    validations={PRIMARY_VALIDATIONS}
                />
                <LoginForm.TextField
                    field="password"
                    type="password"
                    defaultValue={window.zylSession.userData.password}
                    validations={PRIMARY_VALIDATIONS}
                />
                <Button type="submit" fullWidth variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={25} /> : 'Sign in'}
                </Button>
            </LoginForm.Form>
        </PageFormWrapper>
    )
}
