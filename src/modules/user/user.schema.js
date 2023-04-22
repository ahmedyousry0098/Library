import joi from 'joi'

export const registerSchema = {
    body: joi.object().keys({
        name: joi.string().regex(/^[A-Za-z ]{4,30}$/),
        mobile: joi.string().regex(/^(002|\+2)?(01)[0125][0-9]{8}$/),
        email: joi.string().email({maxDomainSegments: 2}).required(),
        password: joi.string().regex(/^[A-Za-z0-9@$.]{3,30}$/).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
        gender: joi.valid('male', 'female'),
        age: joi.number().min(12).max(60)
    })
}

export const loginSchema = {
    body: joi.object().required().keys({
        email: joi.string().email({maxDomainSegments: 2}).required(),
        password: joi.string().regex(/^[A-Za-z0-9@$.]{3,30}$/).required()
    })
}

export const forgetPassSchema = {
    body: joi.object().required().keys({
        email: joi.string().email({maxDomainSegments: 2}).required()
    })
}

export const resetPassSchema = {
    body: joi.object().required().keys({
        newPassword: joi.string().regex(/^[A-Za-z0-9@$.]{3,30}$/).required(),
        confirmNewPassword: joi.string().valid(joi.ref('newPassword')).required()
    })
}

export const updateProfileSchema = {
    body: joi.object().keys({
        name: joi.string().regex(/^[A-Za-z ]{3,30}$/),
        mobile: joi.string().regex(/^(002|\+2)?(01)[0125][0-9]{8}/)
    })
}

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string().pattern(new RegExp(/^[A-Za-z0-9@$.]{3,30}$/)).required(),
        newPassword: joi.string().invalid(joi.ref('oldPassword')).pattern(new RegExp(/^[A-Za-z0-9@$.]{3,30}$/)).required(),
        cPassword: joi.string().valid(joi.ref('newPassword')).required()
    }).required()
}