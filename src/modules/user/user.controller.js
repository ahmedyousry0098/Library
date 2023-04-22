import UserModel from '../../DB/models/UserModel.js'
import { sendEmail } from '../../services/sendMail.js'
import { comparePassword } from '../../utils/encryption.js'
import { verifyTemp } from '../../services/templates/verifyTemp.js'
import { resetPasswordTemplate } from '../../services/templates/resetPasswordTemp.js'
import { generateJWT, decodeJWT } from '../../utils/JWT.js'
import { CustomError } from '../../utils/CustomError.js'

export const register =  async (req, res, next) => {
    const {email} = req.body
    const userExist = await UserModel.findOne({email})
    if (userExist) return next(new CustomError('User already exist', 409))
    const token = generateJWT({payload: req.body, expiresIn: 60*10})
    if (!token) return next(new CustomError('Cannot generate jwt', 503))
    const confirmationLink = `${req.protocol}://${req.headers.host}/user/verifyemail/${process.env.TOKEN_PREFIX}${token}`
    const emailStatus = await sendEmail({
        to: email,
        subject: 'Please Confirm Your Account below',
        htmlTemp: verifyTemp({confirmationLink})
    })
    if (!emailStatus) return next(new CustomError('cannot send confirmation email'))
    return res.status(200).json('Done')
}

export const verifyEmail = async (req, res, next) => {
    const {token} = req.params;
    const userInfo = decodeJWT({token})
    if (!userInfo) return next(new CustomError('please provide a valid identification', 401))
    const userExist = await UserModel.findOne({email: userInfo.email})
    if (userExist) {
        if (userExist.isConfirmed) {
            return next(new CustomError('Email is already Confirmed'))
        } else {
            const confirm = await UserModel.findByIdAndUpdate(userExist._id, {isConfirmed: true})
            return confirm 
                ? res.status(200).json({message: 'Email Confirmed'})
                : next(new CustomError('SomeThing Went Wrong Please Try Again!', 500))
        }
    }
    const newUser = new UserModel(userInfo)
    const saveUser = await newUser.save()
    if(!saveUser) return next(new CustomError('SomeThing Went Wrong Please Try Again!', 500))
    const updateConfirmEmail = await UserModel.findByIdAndUpdate(saveUser._id, {isConfirmed: true}, {new: true})
    if (!updateConfirmEmail) return next(new CustomError('SomeThing Went Wrong Please Try Again!', 500))
    return res.status(200).json({message: 'email verified successfully', saveUser})
}

export const logIn = async (req, res, next) => {
    const {email, password} = req.body
    const user = await UserModel.findOne({email})
    if (!user) return next(new CustomError('Wrong Login Informations', 401))
    const passMatching = comparePassword({
        password, 
        reference: user.password
    })
    if (!passMatching) return next(new CustomError('Wrong Login Info', 401))
    if (!user.isConfirmed) {
        return next(new CustomError('Please Check Email Box and Confirm Your Email First!', 451))
    }
    const token = generateJWT({
        payload: {
            id: user._id, 
            email: user.email
        }
    })
    if (!token) return next(new CustomError('SomeThing Went Wrong Please Try Again', 500))
    await UserModel.findByIdAndUpdate(user._id, {isLoggedIn: true}, {new: true})
    return res.status(202).json({message: 'Logged In Successfully', token})
}

export const forgetPassword = async (req, res, next) => {
    const {email} = req.body;
    const user = await UserModel.findOne({email})
    if (!user) return next(new CustomError('email not exist', 401))
    const token = generateJWT({payload: {id: user._id, email: user.email}})
    const resetLink = `${req.protocol}://${req.headers.host}/user/resetpassword/${process.env.TOKEN_PREFIX}${token}`
    const resetEmail = await sendEmail({
        to: email,
        subject: 'RESET YOU PASSWORD',
        htmlTemp: resetPasswordTemplate({resetLink})
    })
    if (!resetEmail) return next(new CustomError('Cannot send email', 500))
    return res.status(200).json({message: 'please check your email and follow Instructions to reset your password'})
}

export const getIdentificationKey = async (req, res, next) => {
    const {token} = req.params;
    const decoded = decodeJWT({token})
    if (!decoded || !decoded.id) return next(new CustomError('Invalid Authentication Info', 401))
    return res.status(200).json({message: 'Done', token})
}

export const resetPassword = async (req, res, next) => {
    const {token} = req.params;
    const {newPassword} = req.body;
    const decoded = decodeJWT({token})
    if (!decoded || !decoded.id) return next(new CustomError('Invalid Auth Informations', 401))
    const user = await UserModel.findByIdAndUpdate(decoded.id, {password: newPassword}, {new:true})
    if (!user) return next(new CustomError('User Not Found', 401))
    return res.status(201).json({message: 'Done!'})
}

export const updateUser = async (req, res, next) => {
    const {name, mobile} = req.body;
    const {_id} = req.user
    const {profileID} = req.params
    if (profileID !== _id.toString()) return next(new CustomError('Cannot Access Other Users Profile', 403))
    const updatedUser = await UserModel.findByIdAndUpdate(_id, {name, mobile}, {new: true})
    if (!updatedUser) return next(new CustomError('Something Went Wrong! Please Try Again!', 500)) // check if process done successfully
    return res.status(201).json({message: 'Done', updatedUser})
}

export const updatePassword = async (req, res, next) => {
    const {oldPassword, newPassword} = req.body;
    const {_id} = req.user;
    const {profileID} = req.params
    const user = await UserModel.findById(_id) // get user to update him by save() .. to apply hook!
    if (profileID !== _id.toString()) return next(new CustomError('Cannot Access Other Users Profile', 403))
    const isPassMatch = comparePassword({password: oldPassword, reference: user.password})
    if (!isPassMatch) return next(new CustomError('Invalid Password, Please Try Again', 401))
    // const convertedUser = user.toObject()
    user.password = newPassword
    const saved = await user.save()
    return saved ? res.status(200).json({message: "Done!", saved}) : next(new CustomError('Something Went Wrong Please Try Again!', 500))
}

export const deleteProfile = async (req, res, next) => {
    const {_id} = req.user;
    const {profileID} = req.params
    // const profile = await UserModel.findById(_id)
    if (profileID !== _id.toString()) return next(new CustomError('Cannot Access Other Users Profile', 403))
    const deletedUser = await UserModel.deleteOne({_id})
    if (!deletedUser.deletedCount) return next(new CustomError('Something Went Wrong Please Try Again', 500))
    return res.status(200).json({message: "Done!", deletedUser})
}

export const softDelete = async (req, res, next) => {
    const {_id} = req.user;
    const {profileID} = req.params
    if (profileID !== _id.toString()) return next(new CustomError('Cannot Access Other Users Profile', 403))
    const deletedUser = await UserModel.findByIdAndUpdate(_id, {isDeleted: true}, {new: true})
    if (!deletedUser) return next(new CustomError('Something Went Wrong Please Try Again', 403))
    return res.status(200).json({message: 'Done'})
}

export const logOut = async (req, res, next) => {
    const {_id} = req.user
    const {profileID} = req.params
    if (profileID !== _id.toString()) return next(new CustomError('Cannot Access Other Users Profile', 403))
    const logOut = await UserModel.updateOne({_id}, {isLoggedIn: false}, {new: true})
    if (!logOut.updatedCount) return next(new CustomError('Something Went Wrong Please Try Again', 403))
    return res.status(200).json({message: 'Done!'})
}

export const getProfile = async (req, res, next) => {
    const {profileID} = req.params
    const {_id} = req.user
    if (profileID !== _id.toString()) return next(new CustomError('Cannot Access Other Users Profile', 403))
    const profile = await UserModel.findById(_id).select("-password")
    if (!profile) return next(new CustomError('Cannot find profile Info', 404))
    return res.status(200).json({message: 'Done', profile})
}

export const updateProfilePic = async (req, res, next) => {
    const {_id} = req.user
    const {profileID} = req.params
    console.log(req.file);
    if (_id.toString() !== profileID) return next(new CustomError('Cannot access other users profiles', 401))
    const profilePic = await UserModel.findByIdAndUpdate(_id, {profilePic: req.file.dest}, {new:true})
    if (!profilePic) return next(new CustomError('SomeThing Went Wrong Please Try Again!', 500))
    return res.status(200).json({message: 'Done!!', profilePic})
}