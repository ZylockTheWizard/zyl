import React from 'react'
import { FieldError, FieldValues, Path, SubmitHandler, useForm } from 'react-hook-form'
import { Alert, Box, TextField } from '@mui/material'
import { buildValidations, Validations } from './validations'
import { camelCaseToTitleCase } from './common-functions'

export type BaseFormProps<T extends FieldValues> = {
    loading?: boolean
    errorMessage?: string
    children: React.ReactNode
    onSubmit: SubmitHandler<T>
}

export const BaseForm = <T extends FieldValues>(props: BaseFormProps<T>) => {
    const { children, onSubmit, loading, errorMessage } = props

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<T>()

    const fields = React.Children.map(children, (c: any): any => {
        if (!(c?.type?.name === 'BaseFormTextField')) {
            return c
        }
        const textFieldProps = c.props as BaseFormTextFieldProps<T>
        const error = errors[textFieldProps.field] as FieldError
        const label = textFieldProps.label || camelCaseToTitleCase(textFieldProps.field)
        const registerOptions = buildValidations<T>(textFieldProps.validations, label)
        return (
            <TextField
                {...{
                    label,
                    error: !!error,
                    fullWidth: true,
                    variant: 'outlined',
                    id: textFieldProps.field,
                    type: textFieldProps.type,
                    name: textFieldProps.field,
                    helperText: error?.message,
                    defaultValue: textFieldProps.defaultValue,
                    disabled: loading || textFieldProps.disabled,
                    ...register(textFieldProps.field, registerOptions),
                }}
            />
        )
    })

    return (
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
            {fields}
            {errorMessage && (
                <Alert variant="filled" severity="error">
                    {errorMessage}
                </Alert>
            )}
        </Box>
    )
}

export type BaseFormTextFieldProps<T extends FieldValues> = {
    field: Path<T>
    label?: string
    disabled?: boolean
    autoFocus?: boolean
    defaultValue?: string
    validations?: Validations
    type?: React.HTMLInputTypeAttribute
}

export const BaseFormTextField = <T extends FieldValues>(_props: BaseFormTextFieldProps<T>) => <></>

export const BuildFormComponents = <T extends FieldValues>() => {
    return {
        Form: BaseForm<T>,
        TextField: BaseFormTextField<T>,
    }
}
