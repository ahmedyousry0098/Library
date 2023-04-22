import {Router} from 'express'
import { getAllBooks, addBook, borrowBook, returnBook, getBorrowedBooks, getNotReturned, deleteBook, updateBookPic } from './book.controller.js'
import { errHandler } from '../../utils/errHandling.js'
import { isAuth } from '../../middlewares/isAuth.js';
import { fileUpload, validation } from '../../middlewares/fileUploads.js';

const router = Router();

router.get('/getall', errHandler(getAllBooks))
router.post('/add', isAuth, errHandler(addBook))
router.patch('/borrow/:bookId', isAuth, errHandler(borrowBook))
router.patch('/return/:bookId', isAuth, errHandler(returnBook))
router.get('/getborrowed', isAuth, errHandler(getBorrowedBooks))
router.get('/notreturnedyet', isAuth, errHandler(getNotReturned))
router.delete('/delete', isAuth, errHandler(deleteBook))
router.patch('/updatepic/:bookId', isAuth, fileUpload({
    storagePath: 'book/imgs', 
    validation: validation.image
}).single('image'), errHandler(updateBookPic))

export default router