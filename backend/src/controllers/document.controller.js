const Document = require('../models/Document.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const pythonServiceUrl = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:5000';

const uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Save to DB initially as pending
        const doc = await Document.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            uploadedBy: req.user._id,
            status: 'pending'
        });

        // Trigger Python RAG Ingestion by passing the full absolute path and document ID
        try {
            const absolutePath = path.resolve(doc.path);
            await axios.post(`${pythonServiceUrl}/ingest`, {
                document_id: doc._id.toString(),
                file_path: absolutePath
            }, { timeout: 60000 }); // 60 second timeout for ingestion

            doc.status = 'embedded';
            await doc.save();
            return res.status(201).json({ message: 'File uploaded and embedded successfully', doc });
        } catch (ragError) {
            const status = ragError.response?.status;
            const errorData = ragError.response?.data;
            console.error(`❌ RAG Ingestion Error [${status}]:`, errorData || ragError.message);
            
            doc.status = 'failed';
            await doc.save();
            return res.status(500).json({ 
                message: 'File uploaded but RAG embedding failed',
                error: errorData?.[ "error" ] || ragError.message
            });
        }
    } catch (error) {
        console.error("Document Upload Error:", error);
        res.status(500).json({ message: 'Server Error during upload' });
    }
};

const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ uploadedBy: req.user._id })
                                   .select('-summary -quiz') // Don't send huge payloads on list
                                   .sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(doc.path)) {
            fs.unlinkSync(doc.path);
        }

        // Tell RAG to delete vectors
        try {
            await axios.post(`${pythonServiceUrl}/reset`, {
                document_id: doc._id.toString()
            });
        } catch (e) {
            const status = e.response?.status;
            const errorData = e.response?.data;
            console.error(`❌ Failed to reset RAG vectors [${status}]:`, errorData || e.message);
        }

        // Remove from DB
        await Document.deleteOne({ _id: doc._id });

        res.json({ message: 'Document removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument
};
