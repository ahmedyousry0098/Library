import BookModel from '../../DB/models/bookModel.js'
import { CustomError } from '../../utils/CustomError.js'
import moment from 'moment'

export const getAllBooks = async (req, res, next) => {
    const books = await BookModel.find({isDeleted: false}).populate('createdBy', 'name email -_id')
    if (!books) return next(new CustomError('No Books Found', 404))
    return res.status(200).json({message: 'Done!', books})
}

export const addBook = async (req, res, next) => {
    const {title, description} = req.body
    const {_id} = req.user
    const newBook = new BookModel({title, description, createdBy: _id})    
    const savedBook = await newBook.save()
    if (!savedBook) return next(new CustomError('Something Went Wrong Please Try Again', 500))
    return res.status(201).json({message: "Done!", savedBook})
}

export const borrowBook = async (req, res, next) => {
    const {bookId} = req.params;
    const {_id} = req.user;
    const {returnsAfter} = req.body
    const book = await BookModel.findOne({_id: bookId, isDeleted: false})
    if (!book) return next(new CustomError('Invalid Book Id', 404))
    if (book.status === 'borrowed') return next(new CustomError('Sorry this book not available now', 404))
    const now = moment().format()
    const returnsAt = moment().add(returnsAfter, 'day').format()
    const borrowBook = await BookModel.updateOne(
        {_id: bookId}, 
        {status: 'borrowed', borrowedBy: _id, borrowedAt: now, returnsAt},
        {new: true}
    )
    if (!borrowBook.modifiedCount) return next(new CustomError('Something Went Wrong Please Try Again', 500))
    return res.status(200).json({message: 'Done', borrowBook})
}

export const returnBook = async (req, res, next) => {
    const {bookId} = req.params;
    const {_id} = req.user
    const book = await BookModel.findOne({_id: bookId, isDeleted: false})
    if (!book) return next(new CustomError('Invalid Book Id', 404))
    if (book.status !== 'borrowed') return next(new CustomError('This Book hasnot been borrowed', 404))
    if (book.borrowedBy._id.toString() !== _id.toString()) return next(new CustomError('Book must returned by same user'))
    const returnBook = await BookModel.updateOne(
        {_id: bookId}, 
        {
            status: 'available', 
            $unset: {
                borrowedBy: 1, 
                borrowedAt: 1,
                returnsAt: 1
            }}, 
        {new: true}
    )
    if (!returnBook.modifiedCount) return next(new CustomError('Something Went Wrong Please Try Again', 500))
    return res.status(200).json({message: 'Done', returnBook})
}

export const getBorrowedBooks = async (req, res, next) => {
    const borrowedBooks = await BookModel.find({status: 'borrowed', isDeleted: false}).select('title borrowedAt returnsAt')
    if (!borrowedBooks) return next(new CustomError('something went wrong, please reload the page', 404))
    if (!borrowedBooks.length) return res.status(200).json({message: 'No Books Found'})
    return res.status(200).json({message: 'Done', borrowedBooks})
}

export const getNotReturned = async (req, res, next) => {
    const delayfees = 50
    const books = await BookModel.find({status: 'borrowed', returnsAt: {$gte: moment().format()}, isDeleted: false})
    if (!books) return next(new CustomError('something went wrong, please reload the page', 404))
    if (!books.length) return res.status(200).json({message: 'No Books Found'})
    for (let book of books) {
        const delay = moment().diff(books[0]?.returnsAt, 'days', true)
        book.delayFees = delay * delayfees
        // const updateFees = await book.save()
        // if (!updateFees) return next(new CustomError('something went wrong, please reload the page', 404))
    }
    return res.status(200).json({message: 'Done', books})
}

export const deleteBook = async (req, res, next) => {
    const {bookId} = req.params;
    const {_id} = req.user
    const book = await BookModel.findOne({_id: bookId})
    if (!book) return next(new CustomError('Invalid Book Id', 404))
    if (book.createdBy._id.toString() !== _id.toString()) return next(new CustomError('You donot have permission to delete book', 403))
    const delBook = await BookModel.updateOne({_id: bookId}, {isDeleted: true}, {new: true})
    if (!delBook.modifiedCount) return next(new CustomError('Something Went Wrong Please Try Again', 500))
    return res.status(200).json({message: 'Done!'})
}

// multer
export const updateBookPic = async(req, res, next) => {
    const {bookId} = req.params
    const {_id} = req.user
    const book = await BookModel.findById(bookId)
    if (!book) return next(new CustomError('Invalid Book Id', 404))
    if (book.createdBy.toString() !== _id.toString()) return next(new CustomError('You donot have permission to delete book', 403))
    const updatePic = await BookModel.updateOne({_id: bookId}, {bookPic: req.file.dest}, {new: true})
    if (!updatePic) return next(new CustomError('SomeThing Went Wrong Please Try Again', 500))
    return res.status(200).json({message: 'Done!', updatePic})
}