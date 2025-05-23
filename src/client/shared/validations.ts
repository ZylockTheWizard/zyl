import { FieldValues, Path, RegisterOptions } from 'react-hook-form'

export type Validations = {
    required?: boolean
    maxLength?: boolean | number
    pattern?: {
        value: RegExp
        message?: string
    }
}

export const buildValidations = <T extends FieldValues>(
    val: Validations | undefined,
    label: string,
) => {
    const registerOptions: RegisterOptions<T, Path<T>> = {}
    if (val?.required) registerOptions.required = `${label} is required`
    if (val?.maxLength) {
        const max = typeof val.maxLength === 'number' ? val.maxLength : 255
        registerOptions.maxLength = {
            value: max,
            message: `${label} cannot be greater than ${max} characters`,
        }
    }
    if (val?.pattern) {
        registerOptions.pattern = {
            value: val.pattern.value,
            message: `${label} ${val.pattern.message}`,
        }
    }

    return registerOptions
}

export const DEFAULT_VALIDATIONS: Validations = {
    required: true,
    maxLength: true,
}
