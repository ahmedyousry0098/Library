export const globalErrHandling = (err, req, res, next) => {
    // console.log(err.message);
    if (err) {
        return res
            .status(err.statusCode || 500)
            .json({err: err.message, stack: err.stack})
    }
}