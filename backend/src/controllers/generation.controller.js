const Document = require('../models/Document.js');
const axios = require('axios');

const pythonServiceUrl = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:5000';

const generateSummary = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (doc.status !== 'embedded') {
            return res.status(400).json({ message: 'Document is not fully processed yet' });
        }

        // Return cached summary if exists
        if (doc.summary) {
            return res.json({ summary: doc.summary });
        }

        // Request from Python RAG service
        const response = await axios.post(`${pythonServiceUrl}/generate-summary`, {
            document_id: doc._id.toString()
        }, { timeout: 120000 }); // Generation might take ~1 min

        const summaryText = response.data.summary;
        
        // Cache and save
        doc.summary = summaryText;
        await doc.save();

        res.json({ summary: summaryText });
    } catch (error) {
        console.error("Summary Generation Error:", error.message);
        res.status(500).json({ message: 'Server Error during summary generation' });
    }
};

const generateQuiz = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (doc.status !== 'embedded') {
            return res.status(400).json({ message: 'Document is not fully processed yet' });
        }

        // Return cached quiz if exists
        if (doc.quiz && doc.quiz.length > 0) {
            return res.json({ quiz: doc.quiz });
        }

        // Request from Python RAG service
        const response = await axios.post(`${pythonServiceUrl}/generate-quiz`, {
            document_id: doc._id.toString()
        }, { timeout: 120000 }); // Generative JSON from long context can take time

        const quizArray = response.data.quiz;
        
        // Ensure it's an array and valid
        if (!Array.isArray(quizArray) || quizArray.length === 0) {
             return res.status(500).json({ message: 'RAG Service returned malformed quiz JSON' });
        }

        // Cache and save
        doc.quiz = quizArray;
        await doc.save();

        res.json({ quiz: quizArray });
    } catch (error) {
        console.error("Quiz Generation Error:", error.message);
        res.status(500).json({ message: 'Server Error during quiz generation' });
    }
};

module.exports = {
    generateSummary,
    generateQuiz
};
