const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['image', 'video', 'other'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sharedUserIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    uploadDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('File', fileSchema);