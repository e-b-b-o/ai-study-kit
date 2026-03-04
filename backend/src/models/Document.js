const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chromaCollectionId: { type: String },
    status: { type: String, enum: ['pending', 'embedded', 'failed'], default: 'pending' },
    summary: { type: String },
    quiz: [{
        question: { type: String },
        options: [{ type: String }],
        correctAnswer: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
