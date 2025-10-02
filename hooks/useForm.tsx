import Joi from "joi"
import { useState } from "react"
type IInputType = "text" | "select" | "checkbox" | "radio"
export interface IFormParam {
    [x: string]: {
        defaultValue: any,
        type?: IInputType,
        validator?: Joi.Schema | ((x: any, form: any) => string | null | undefined)
    }
}
export type TValidator = (value: string) => ({ error?: null | string })
export type THandleChange = (value: any, error?: string) => void
export interface ITextInputValidation {
    onChangeText?: THandleChange,
    isValid?: boolean | null | undefined;
    error?: string | null | undefined;
}
export interface ISelectionInputValidation {
    value: any,
    onChange?: THandleChange,
    isValid?: boolean | null | undefined;
    error?: string | null | undefined;
}

interface IForm {
    [x: string]: {
        value: any,
        error: null | string,
        defaultValue: null | string,
        isValid: boolean | null
    }
}
export function useForm(params: IFormParam) {

    const setData = () => {
        let obj: IForm = {}
        for (let i in params) {
            obj[i] = {
                value: params[i].defaultValue,
                defaultValue: params[i].defaultValue,
                error: null,
                isValid: null
            }
        }
        return obj
    }

    const [form, setForm] = useState(setData())

    const handleTextChange = (value: string, name: string, errors?: any) => {
        const field = params[name]
        const { error } = errors ? { error: { message: errors } } : (field.validator ? (Joi.isSchema(field.validator) ? field.validator.validate(value) : { error: { message: field.validator(value, form) } }) : { error: null })
        setForm((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                value,
                error: error ? error.message : null,
                isValid: null
            }
        }))
    }

    const field = (name: string, type: IInputType = "text", callback?: any) => {
        if (["text"].includes(type)) {
            const fields = {
                onChangeText: (value: string, error?: string) => handleTextChange(value, name, error),
                value: form[name].value,
                onBlur: () => {
                    setForm((prev) => ({
                        ...prev,
                        [name]: {
                            ...prev[name],
                            isValid: !form[name].error
                        }
                    }))
                },
                isValid: form[name].isValid,
                error: form[name].error,
            }
            return callback ? callback(fields) : fields
        } else if (["select"].includes(type)) {
            const fields = {
                onChange: (value: string, error?: string) => handleTextChange(value, name, error),
                value: form[name].value,
                isValid: form[name].isValid,
                error: form[name].error,
            }
            return callback ? callback(fields) : fields
        }
    }

    const isFormValid = (updateState = false, name?: string) => {
        const data: IForm = {...form}
        let isValid = true
        let lastError = null
        if (name) {
            const field = params[name]
            let err
            const error = form[name].error ?? (field.validator ? (Joi.isSchema(field.validator) ? ((err = field.validator.validate(form[name].value).error) ? err.message : null) : (field.validator(form[name].value, form) ?? null)) : null)

            data[name] = {
                ...form[name],
                error,
                isValid: !Boolean(error)
            }
            isValid = isValid && !Boolean(error)
            lastError = error
        } else {
            for (let name in form) {
                const field = params[name]
                let err;
                const error = form[name].error ?? (field.validator ? (Joi.isSchema(field.validator) ? ((err = field.validator.validate(form[name].value).error) ? err.message : null) : (field.validator(form[name].value, form) ?? null)) : null)
                data[name] = {
                    ...form[name],
                    error,
                    isValid: !Boolean(error)
                }
                isValid = isValid && !Boolean(error)
                // if(!isValid){
                //     lastError=error
                //     break;
                // }

            }
        }
        

        return { isValid, lastError }

    }

    const reset = () => {

        setForm(setData())
    }
    const getValues = () => {
        const values: any = {}
        for (let i in form) {
            values[i] = form[i].value
        }
        return values
    }
    const returns = { form, setForm, field, isFormValid, getValues, reset }

    return (
        returns
    )
}