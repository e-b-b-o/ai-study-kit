import api from './api';

const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const uploadDocumentWithProgress = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) onProgress(percent);
        },
    });
    return response.data;
};

const getDocuments = async () => {
    const response = await api.get('/documents');
    return response.data;
};

const getDocumentById = async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
};

const deleteDocument = async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
};

const generateSummary = async (id) => {
    const response = await api.post(`/generate/summary/${id}`);
    return response.data;
};

const generateQuiz = async (id) => {
    const response = await api.post(`/generate/quiz/${id}`);
    return response.data;
};

const generateFlashcards = async (id) => {
    const response = await api.post(`/generate/flashcards/${id}`);
    return response.data;
};

const generateNotes = async (id) => {
    const response = await api.post(`/generate/notes/${id}`);
    return response.data;
};

const chatWithDocument = async (id, message) => {
    const response = await api.post(`/generate/chat/${id}`, { message });
    return response.data;
};

export const studyKitService = {
    uploadDocument,
    uploadDocumentWithProgress,
    getDocuments,
    getDocumentById,
    deleteDocument,
    generateSummary,
    generateQuiz,
    generateFlashcards,
    generateNotes,
    chatWithDocument
};
