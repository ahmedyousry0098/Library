
export const errHandler = (API) => {
    return (req, res, next) => {
        API(req, res, next).catch(err => {
            next(new Error(err))
        })
    }
}
