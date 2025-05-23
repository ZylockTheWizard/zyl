import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import { BuildFormComponents } from './shared/base-form'
import { PageFormWrapper } from './shared/page-form-wrapper'
import { DEFAULT_VALIDATIONS } from './shared/validations'
import { electron_send_recieve } from '../app'

type LoginFieldValues = {
    user: string
    password: string
}

const LoginForm = BuildFormComponents<LoginFieldValues>()

export const Login = () => {
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = React.useState('')

    const onSubmit: SubmitHandler<LoginFieldValues> = (data: LoginFieldValues) => {
        return new Promise<void>((resolve) => {
            const onLoginCallback = (_event: any, val: any) => {
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
                resolve()
            }
            electron_send_recieve('login', onLoginCallback, data.user, data.password)
        })
    }

    return (
        <PageFormWrapper pageTitle="Sign In">
            <LoginForm.Form onSubmit={onSubmit} errorMessage={errorMessage}>
                <LoginForm.TextField
                    autoFocus
                    field="user"
                    defaultValue={window.zylSession.userData.id}
                    validations={DEFAULT_VALIDATIONS}
                />
                <LoginForm.TextField
                    field="password"
                    type="password"
                    defaultValue={window.zylSession.userData.password}
                    validations={DEFAULT_VALIDATIONS}
                />
                <LoginForm.SubmitButton label={'Sign In'} />
            </LoginForm.Form>
        </PageFormWrapper>
    )
}
