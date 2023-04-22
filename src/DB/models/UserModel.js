import mongoose, {Schema, model} from 'mongoose'
import {hashPassword} from '../../utils/encryption.js'

const userSchema = new Schema({
    name: {
        type: String, 
        default: 'user'
    }, 
    mobile: {
        type: Number,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: String,
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

userSchema.pre('save', function(next) {
    const user = this
    user.password = hashPassword({plainPassword: user.password})
    next()
})

const UserModel = model('user', userSchema)

export default UserModel