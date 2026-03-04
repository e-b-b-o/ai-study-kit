const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middlewares/upload.middleware.js');
const { protect } = require('../middlewares/authMiddleware.js');
const { 
    uploadDocument, 
    getDocuments, 
    getDocumentById, 
    deleteDocument 
} = require('../controllers/document.controller.js');

router.post('/upload', protect, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, next);
        }
        next();
    });
}, uploadDocument);

router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
