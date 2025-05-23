import React from 'react'
import {
    FieldValues,
    FormProvider,
    Path,
    SubmitHandler,
    useForm,
    useFormContext,
} from 'react-hook-form'
import {
    Alert,
    Autocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    Switch,
    TextField,
} from '@mui/material'
import { buildValidations, Validations } from './validations'
import { camelCaseToTitleCase } from './common-functions'

export type BaseFormProps<T extends FieldValues> = {
    errorMessage?: string
    children: React.ReactNode
    onSubmit: SubmitHandler<T>
}

export const BaseForm = <T extends FieldValues>(props: BaseFormProps<T>) => {
    const { children, onSubmit, errorMessage } = props
    const methods = useForm<T>()
    return (
        <FormProvider<T> {...methods}>
            <Box
                component="form"
                onSubmit={methods.handleSubmit(onSubmit)}
                noValidate
                sx={{
                    gap: 4,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {children}
                {errorMessage && (
                    <Alert variant="filled" severity="error">
                        {errorMessage}
                    </Alert>
                )}
            </Box>
        </FormProvider>
    )
}

export type TextFieldOnChange = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>

export type BaseFormTextFieldProps<T extends FieldValues> = {
    field: Path<T>
    label?: string
    width?: string
    disabled?: boolean
    autoFocus?: boolean
    step?: string | number
    value?: string | number
    validations?: Validations
    onChange?: TextFieldOnChange
    defaultValue?: string | number
    type?: React.HTMLInputTypeAttribute
}
export const BaseFormTextField = <T extends FieldValues>(props: BaseFormTextFieldProps<T>) => {
    const {
        register,
        formState: { errors, isSubmitting },
    } = useFormContext<T>()
    const error = errors[props.field]
    const label = props.label || camelCaseToTitleCase(props.field)
    const registerOptions = buildValidations<T>(props.validations, label)
    const registerResult = register(props.field, registerOptions)
    return (
        <TextField
            sx={{ width: props.width }}
            {...registerResult}
            {...{
                label,
                error: !!error,
                id: props.field,
                fullWidth: true,
                type: props.type,
                name: props.field,
                value: props.value,
                variant: 'outlined',
                defaultValue: props.defaultValue,
                helperText: `${error?.message || ''}`,
                disabled: isSubmitting || props.disabled,
                slotProps: { htmlInput: { step: props.step } },
                onChange: (e) => {
                    registerResult.onChange(e)
                    if (props.onChange) props.onChange(e)
                },
            }}
        />
    )
}

export type AutocompletOnChange = (
    event: React.SyntheticEvent,
    value: string,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string>,
) => void

export type BaseFormAutocompleteProps<T extends FieldValues> = {
    field: Path<T>
    label?: string
    options?: string[]
    disabled?: boolean
    autoFocus?: boolean
    defaultValue?: string
    validations?: Validations
    onChange?: AutocompletOnChange
}
export const BaseFormAutocomplete = <T extends FieldValues>(
    props: BaseFormAutocompleteProps<T>,
) => {
    const {
        register,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useFormContext<T>()
    const error = errors[props.field]
    const label = props.label || camelCaseToTitleCase(props.field)
    const defaultValue = props.options.find((o) => o === props.defaultValue)
    const registerOptions = buildValidations<T>(props.validations, label)
    const registerResult = register(props.field, registerOptions)
    return (
        <Autocomplete
            fullWidth={true}
            options={props.options}
            defaultValue={defaultValue}
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...{
                        label,
                        error: !!error,
                        id: props.field,
                        name: props.field,
                        variant: 'outlined',
                        helperText: `${error?.message || ''}`,
                        disabled: isSubmitting || props.disabled,
                    }}
                />
            )}
            {...registerResult}
            onChange={(event, ...rest) => {
                registerResult.onChange(event)
                clearErrors(props.field)
                if (props.onChange) props.onChange(event, ...rest)
            }}
        />
    )
}

export type BaseFormSubmitButtonProps = {
    label: string
    disabled?: boolean
}
export const BaseFormSubmitButton = (props: BaseFormSubmitButtonProps) => {
    const {
        formState: { isSubmitting },
    } = useFormContext()
    return (
        <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isSubmitting || props.disabled}
        >
            {isSubmitting ? <CircularProgress size={25} /> : props.label}
        </Button>
    )
}

export type BaseFormSwitchFieldProps<T extends FieldValues> = {
    field: Path<T>
    label?: string
    defaultChecked?: boolean
    validations?: Validations
}

export const BaseFormSwitchField = <T extends FieldValues>(props: BaseFormSwitchFieldProps<T>) => {
    const {
        register,
        formState: { isSubmitting },
    } = useFormContext<T>()
    const label = props.label || camelCaseToTitleCase(props.field)
    const registerOptions = buildValidations<T>(props.validations, label)
    const registerResult = register(props.field, registerOptions)
    return (
        <FormControlLabel
            control={
                <Switch
                    {...registerResult}
                    {...{
                        defaultChecked: props.defaultChecked,
                    }}
                />
            }
            label={label}
            disabled={isSubmitting}
        />
    )
}

export const BuildFormComponents = <T extends FieldValues>() => {
    return {
        Form: BaseForm<T>,
        TextField: BaseFormTextField<T>,
        Autocomplete: BaseFormAutocomplete<T>,
        Switch: BaseFormSwitchField<T>,
        SubmitButton: BaseFormSubmitButton,
    }
}
