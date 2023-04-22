import UserModel from '../DB/models/UserModel.js'
import {CustomError} from '../utils/CustomError.js'
import { errHandler } from '../utils/errHandling.js'
import {decodeJWT} from '../utils/JWT.js'

export const isAuth = errHandler(
    async (req, res, next) => {
        const {authentication} = req.headers
        if (!authentication) return next(new CustomError('Please provide your identification', 401))
        const decoded = decodeJWT({token: authentication})
        if (!decoded || !decoded.id) return next(new CustomError('Wrong identification key', 401))
        const user = await UserModel.findById(decoded.id).select('-password')
        if (!user) return next(new CustomError('Invalid Indentification key', 401 ))
        if (!user.isConfirmed) return next(new CustomError('Please Confirm Your Email First'))
        req.user = user;
        next()
    }
)