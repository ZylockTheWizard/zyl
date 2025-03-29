import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import { Button, CircularProgress } from '@mui/material'
import { PageFormWrapper } from './shared/page-form-wrapper'
import { BuildFormComponents } from './shared/base-form'
import { PRIMARY_VALIDATIONS } from './shared/validations'
import { send_register } from '../app'

type PasswordResetFieldValues = {
    newPassword: string
    verifyPassword: string
}

const PasswordResetForm = BuildFormComponents<PasswordResetFieldValues>()

export const PasswordReset = () => {
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const onSubmit: SubmitHandler<PasswordResetFieldValues> = (data: PasswordResetFieldValues) => {
        if (data.newPassword !== data.verifyPassword) {
            setErrorMessage('The passwords do not match')
            return
        }
        setLoading(true)
        window.zylSession.userData = { password: data.newPassword }
        const user = window.zylSession.userData.id
        const password = window.zylSession.userData.password
        const onPasswordResetCallback = (_event: any, val: any) => {
            setLoading(false)

            let error = ''
            if (val.error) error = val.error
            else navigate('/login')

            setErrorMessage(error)
        }
        send_register('password-reset', onPasswordResetCallback, user, password)
    }

    return (
        <PageFormWrapper pageTitle="Password Reset">
            <PasswordResetForm.Form
                onSubmit={onSubmit}
                loading={loading}
                errorMessage={errorMessage}
            >
                <PasswordResetForm.TextField
                    type="password"
                    field="newPassword"
                    validations={PRIMARY_VALIDATIONS}
                />
                <PasswordResetForm.TextField
                    type="password"
                    field="verifyPassword"
                    validations={PRIMARY_VALIDATIONS}
                />
                <Button type="submit" fullWidth variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={25} /> : 'Sign in'}
                </Button>
            </PasswordResetForm.Form>
        </PageFormWrapper>
    )
}
