import React from 'react'
import { Box, Card, Stack, TextFieldVariants, Typography } from '@mui/material'
import { FieldError, UseFormRegister } from 'react-hook-form'

export type PageFormProps = {
    children: React.ReactNode
    pageTitle: string
    onSubmit: React.FormEventHandler<HTMLFormElement>
}

export const PageForm: React.FC<PageFormProps> = (props) => {
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

    return (
        <Stack direction="column" justifyContent="space-between" style={stackStyles}>
            <Card style={cardStyles} variant="outlined">
                <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: '34px' }}>
                    {props.pageTitle}
                </Typography>
                <Box
                    component="form"
                    onSubmit={props.onSubmit}
                    noValidate
                    sx={{
                        gap: 4,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {props.children}
                </Box>
            </Card>
        </Stack>
    )
}

type DynamicProperties = {
    label: string
    field: string
    error: FieldError
    loading: boolean
    register: UseFormRegister<any>
}

export const pageFormFieldPropGenerator = (props: DynamicProperties) => {
    const registerOptions = {
        required: props.label + ' is required',
        maxLength: {
            value: 255,
            message: props.label + ' cannot be greater than 255 characters',
        },
    }
    return {
        id: props.field,
        fullWidth: true,
        name: props.field,
        label: props.label,
        error: !!props.error,
        disabled: props.loading,
        helperText: props.error?.message,
        variant: 'outlined' as TextFieldVariants,
        ...props.register(props.field as any, registerOptions),
    }
}
