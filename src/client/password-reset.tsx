import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import { PageFormWrapper } from './shared/page-form-wrapper'
import { BuildFormComponents } from './shared/base-form'
import { DEFAULT_VALIDATIONS } from './shared/validations'
import { electron_send_recieve } from '../app'

type PasswordResetFieldValues = {
    newPassword: string
    verifyPassword: string
}

const PasswordResetForm = BuildFormComponents<PasswordResetFieldValues>()

export const PasswordReset = () => {
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = React.useState('')

    const onSubmit: SubmitHandler<PasswordResetFieldValues> = (data: PasswordResetFieldValues) => {
        if (data.newPassword !== data.verifyPassword) {
            setErrorMessage('The passwords do not match')
            return
        }
        window.zylSession.userData = { password: data.newPassword }
        const user = window.zylSession.userData.id
        const password = window.zylSession.userData.password
        return new Promise<void>((resolve) => {
            const onPasswordResetCallback = (_event: any, val: any) => {
                let error = ''
                if (val.error) error = val.error
                else navigate('/login')
                setErrorMessage(error)
                resolve()
            }
            electron_send_recieve('password-reset', onPasswordResetCallback, user, password)
        })
    }

    return (
        <PageFormWrapper pageTitle="Password Reset">
            <PasswordResetForm.Form onSubmit={onSubmit} errorMessage={errorMessage}>
                <PasswordResetForm.TextField
                    type="password"
                    field="newPassword"
                    validations={DEFAULT_VALIDATIONS}
                />
                <PasswordResetForm.TextField
                    type="password"
                    field="verifyPassword"
                    validations={DEFAULT_VALIDATIONS}
                />
                <PasswordResetForm.SubmitButton label={'Sign In'} />
            </PasswordResetForm.Form>
        </PageFormWrapper>
    )
}
