import mongoose from 'mongoose'

mongoose.set('strictQuery', false)

export const connectDB = async () => {
    return await mongoose.connect('mongodb://127.0.0.1:27017/library')
        .then(() => console.log('DB Connected'))
        .catch((err) => console.log({err}))
}