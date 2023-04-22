import multer from 'multer'
import fs from 'fs'
import { nanoid } from 'nanoid'
import path from 'path'
import { fileURLToPath } from 'url'

export const validation = {
    image: ['image/jpeg', 'image/gif', 'image/png']
}

export function fileUpload ({storagePath='general' ,validation=[]}) {

    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const fullPath = path.join(__dirname, `../uploads/${storagePath}`)
    const uniqueId = nanoid()

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, {recursive: true})
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            file.dest = `uploads/${storagePath}/${uniqueId}_${file.originalname}}`
            cb(null, fullPath)
        },
        filename: (req, file, cb) => {
            cb(null, `${uniqueId}_${file.originalname}`)
        }
    })

    function fileFilter (req, file, cb) {
        if (validation.includes(file.mimetype)){
            cb(null, true)
        } else {
            cb('Invalid File', false)
        }
    }

    const upload = multer({fileFilter, storage})
    return upload
}