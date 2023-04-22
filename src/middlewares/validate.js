import {CustomError} from '../utils/CustomError.js'

export const validate = (schema) => {
    return (req, res, next) => {

        const reqKeys = ['body', 'params', 'headers', 'file', 'files']
        let errors = []

        for (let key of reqKeys) {
            if (schema[key]) {
                const result = schema[key].validate(req[key], {abortEarly: false})
                if (result?.error?.details) {
                    errors.push(result.error.details)
                }
            }
        }

        if (errors.length) return next(new CustomError(`Validation Error ${errors}`, 406))

        next()
    }
}