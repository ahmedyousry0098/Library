import { Router } from 'express'
import { errHandler } from '../../utils/errHandling.js'
import { validate } from '../../middlewares/validate.js'
import { isAuth } from '../../middlewares/isAuth.js'
import { 
    register, 
    verifyEmail, 
    logIn, 
    forgetPassword, 
    getIdentificationKey, 
    resetPassword, 
    updateUser, 
    deleteProfile,
    updatePassword,
    softDelete,
    logOut,
    getProfile,
    updateProfilePic
} from './user.controller.js'
import { 
    registerSchema, 
    loginSchema, 
    forgetPassSchema, 
    resetPassSchema, 
    updatePasswordSchema,
    updateProfileSchema,
} from './user.schema.js'
import {fileUpload} from '../../middlewares/fileUploads.js'
import {validation} from '../../middlewares/fileUploads.js'

const router = Router()

router.post('/register', validate(registerSchema), errHandler(register))

router.get('/verifyemail/:token', errHandler(verifyEmail))

router.post('/login', validate(loginSchema), errHandler(logIn))

router.post('/forgetpassword', validate(forgetPassSchema), errHandler(forgetPassword))

router.get('/resetpassword/:token', errHandler(getIdentificationKey))

router.post('/resetpassword/:token', validate(resetPassSchema), errHandler(resetPassword))

router.put('/updateprofile/:profileID', validate(updateProfileSchema), isAuth, errHandler(updateUser))

router.patch('/updatepassword/:profileID', validate(updatePasswordSchema), isAuth, errHandler(updatePassword))

router.delete('/deleteprofile/:profileID', isAuth, errHandler(deleteProfile))

router.patch('/deleteprofile/:profileID', isAuth, errHandler(softDelete))

router.post('/logout/:profileID', isAuth, errHandler(logOut))

router.get('/profile/:profileID', isAuth, errHandler(getProfile))

router.patch('/profilePic/:profileID', isAuth, fileUpload({
    storagePath: 'user/profile' ,
    validation: validation.image
}).single('image'), errHandler(updateProfilePic))

export default router