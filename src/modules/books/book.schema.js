import joi from 'joi'

export const booksSchema = {
    body: joi.object().required().keys({
        title: joi.string().required()
        
    })
}