process.on('uncaughtException', (err) => {
    console.log({err})
})

import express from 'express'
import { connectDB } from './src/DB/connection.js'
import userRouter from './src/modules/user/user.routes.js'
import bookRouter from './src/modules/books/book.routes.js'
import { globalErrHandling } from './src/middlewares/globalErrHandling.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
config()

const app = express()
const port = process.env.PORT
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fullPath = path.join(__dirname, './src/uploads')
connectDB()

app.use(express.json())
console.log(fullPath);
app.use('/uploads', express.static(fullPath))
app.use('/user', userRouter)
app.use('/book', bookRouter)
app.all('*', (req, res, next) => {
    return res.status(404).json({message: 'Page Not Found'})
})

app.use(globalErrHandling)

process.on('unhandledRejection', (err) => {
    console.log({err})
})

app.listen(port, () => {
    console.log(`Server Running on Port ${port}`);
})
