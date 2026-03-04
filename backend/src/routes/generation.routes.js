const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');
const { 
    generateSummary, 
    generateQuiz 
} = require('../controllers/generation.controller.js');

router.post('/summary/:id', protect, generateSummary);
router.post('/quiz/:id', protect, generateQuiz);

module.exports = router;
