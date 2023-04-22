import mongoose, {Schema} from 'mongoose'

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['borrowed', 'available'],
        default: 'available',
    },
    borrowedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    borrowedAt: Date,
    returnsAt: Date,
    isDeleted: {
        type: Boolean,
        default: false,
    },
    bookPic: String
}, {
    timestamps: true
})

const BookModel = mongoose.model('book', bookSchema)

export default BookModel