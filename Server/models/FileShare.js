const mongoose = require('mongoose');

const fileShareSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sharedWithId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sharedAt: {
        type: Date,
        default: Date.now,
    },
    canEdit: {
        type: Boolean,
        default: false,
    },
});

// Indice composto per evitare condivisioni duplicate
fileShareSchema.index({ fileId: 1, sharedWithId: 1 }, { unique: true });

module.exports = mongoose.model('FileShare', fileShareSchema);
