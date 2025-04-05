import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import { Button, CircularProgress } from '@mui/material'
import { BuildFormComponents } from './shared/base-form'
import { PageFormWrapper } from './shared/page-form-wrapper'
import { PRIMARY_VALIDATIONS } from './shared/validations'
import { send_register } from '../app'

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
        setLoading(true)
        const onLoginCallback = (_event: any, val: any) => {
            setLoading(false)

            let error = ''
            if (val.error) error = val.error
            else {
                window.zylSession.userData = { id: data.user, password: data.password }
                window.ipcRenderer.send('save-user-data', window.zylSession.userData)
                if (val.result.passwordReset) {
                    navigate('/password-reset')
                } else {
                    window.zylSession.currentUsers = val.result.users
                    window.zylSession.currentScenes = val.result.scenes
                    window.zylSession.currentSceneId = val.result.sceneId
                    navigate('/game')
                }
            }

            setErrorMessage(error)
        }
        send_register('login', onLoginCallback, data.user, data.password)
    }

    return (
        <PageFormWrapper pageTitle="Sign In">
            <LoginForm.Form onSubmit={onSubmit} loading={loading} errorMessage={errorMessage}>
                <LoginForm.TextField
                    autoFocus
                    field="user"
                    defaultValue={window.zylSession.userData.id}
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
