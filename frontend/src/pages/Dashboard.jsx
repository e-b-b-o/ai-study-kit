import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyKitService } from '../services/studyKitService';
import authService from '../services/authService';
import { useTheme } from '../components/ThemeProvider';
import {
    Upload, FileText, Type, Trash2, ExternalLink, LogOut,
    Sun, Moon, BookOpen, Brain, StickyNote, MessageCircle,
    HelpCircle, CheckCircle2, AlertCircle, CloudUpload, X, Sparkles
} from 'lucide-react';

function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [showStudyMode, setShowStudyMode] = useState(false);
    const [lastUploadedDocId, setLastUploadedDocId] = useState(null);
    const [selectedStudyMode, setSelectedStudyMode] = useState('');
    const [generating, setGenerating] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const user = authService.getCurrentUser();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await studyKitService.getDocuments();
            setDocuments(data);
        } catch (err) {
            setError('Failed to fetch documents');
        }
    };

    const handleFileSelect = (selectedFile) => {
        const allowedExts = ['.pdf', '.txt', '.docx'];
        const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExts.includes(ext)) {
            setError('Only PDF, TXT, and DOCX files are allowed');
            return;
        }
        setFile(selectedFile);
        setError('');
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        setError('');
        setSuccessMsg('');

        try {
            const data = await studyKitService.uploadDocumentWithProgress(file, (progress) => {
                setUploadProgress(progress);
            });
            setFile(null);
            setUploadProgress(100);
            setSuccessMsg('Document uploaded and processing started!');
            setLastUploadedDocId(data._id || data.document?._id);
            setShowStudyMode(true);
            fetchDocuments();
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload document');
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleTextUpload = async () => {
        if (!textContent.trim()) return;
        // Create a text file from the content
        const blob = new Blob([textContent], { type: 'text/plain' });
        const textFile = new File([blob], `pasted-text-${Date.now()}.txt`, { type: 'text/plain' });

        setUploading(true);
        setUploadProgress(0);
        setError('');
        setSuccessMsg('');

        try {
            const data = await studyKitService.uploadDocumentWithProgress(textFile, (progress) => {
                setUploadProgress(progress);
            });
            setTextContent('');
            setUploadProgress(100);
            setSuccessMsg('Text content uploaded and processing started!');
            setLastUploadedDocId(data._id || data.document?._id);
            setShowStudyMode(true);
            fetchDocuments();
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload text');
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await studyKitService.deleteDocument(id);
            fetchDocuments();
        } catch (err) {
            setError('Failed to delete document');
        }
    };

    const handleGenerate = async () => {
        if (!selectedStudyMode || !lastUploadedDocId) return;
        if (selectedStudyMode === 'tutor') {
            navigate(`/study-kit/${lastUploadedDocId}?tab=chat`);
            return;
        }
        navigate(`/study-kit/${lastUploadedDocId}?tab=${selectedStudyMode}`);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const dashTabs = [
        { id: 'upload', label: 'Upload', icon: <Upload size={18} /> },
        { id: 'documents', label: 'My Documents', icon: <FileText size={18} /> },
    ];

    const studyModes = [
        { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={24} />, desc: 'Test your knowledge' },
        { id: 'summary', label: 'Summary', icon: <BookOpen size={24} />, desc: 'Academic overview' },
        { id: 'flashcards', label: 'Flashcards', icon: <Brain size={24} />, desc: 'Active recall cards' },
        { id: 'notes', label: 'Notes', icon: <StickyNote size={24} />, desc: 'Study notes' },
        { id: 'tutor', label: 'Tutor Mode', icon: <MessageCircle size={24} />, desc: 'Chat with AI' },
    ];

    return (
        <div className="dash-layout">
            {/* Top Bar */}
            <header className="dash-header">
                <div className="dash-header-inner">
                    <span className="dash-logo" onClick={() => navigate('/dashboard')}>
                        <Sparkles size={20} style={{ color: 'var(--purple-accent)' }} />
                        <span>AI Study Kit</span>
                    </span>
                    <div className="dash-header-actions">
                        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button onClick={handleLogout} className="dash-logout-btn">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="dash-main">
                {/* Welcome */}
                <div className="dash-welcome">
                    <h1>Welcome, <span className="text-gradient">{user?.name || 'Student'}</span></h1>
                    <p>Upload your study materials and let AI do the heavy lifting.</p>
                </div>

                {/* Tab Navigation */}
                <div className="dash-tabs">
                    {dashTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`dash-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab.id); setShowStudyMode(false); }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Messages */}
                {error && (
                    <div className="dash-alert dash-alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X size={16} /></button>
                    </div>
                )}
                {successMsg && (
                    <div className="dash-alert dash-alert-success">
                        <CheckCircle2 size={18} />
                        <span>{successMsg}</span>
                        <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
                    </div>
                )}

                {/* Upload Tab */}
                {activeTab === 'upload' && !showStudyMode && (
                    <div className="dash-upload-grid">
                        {/* Upload File Card */}
                        <div
                            className={`upload-card ${dragOver ? 'dragover' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => !file && fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.txt,.docx"
                                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                            <div className="upload-card-icon">
                                <CloudUpload size={40} />
                            </div>
                            <h3>Upload File</h3>
                            <p>Drag & drop or click to browse</p>
                            <span className="upload-card-formats">PDF, TXT, DOCX — up to 15MB</span>

                            {file && (
                                <div className="upload-file-preview">
                                    <FileText size={16} />
                                    <span>{file.name}</span>
                                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {uploading && (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{uploadProgress}%</span>
                                </div>
                            )}

                            {file && !uploading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                    className="btn btn-primary upload-submit-btn"
                                >
                                    <Upload size={16} /> Upload & Process
                                </button>
                            )}
                        </div>

                        {/* Upload Text Card */}
                        <div className="upload-card upload-text-card">
                            <div className="upload-card-icon">
                                <Type size={40} />
                            </div>
                            <h3>Upload Text</h3>
                            <p>Paste your study content below</p>
                            <textarea
                                className="upload-textarea"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                placeholder="Paste your notes, lecture content, or any text you want to study..."
                                rows={6}
                            />
                            {uploading && (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{uploadProgress}%</span>
                                </div>
                            )}
                            {textContent.trim() && !uploading && (
                                <button
                                    onClick={handleTextUpload}
                                    className="btn btn-primary upload-submit-btn"
                                >
                                    <Upload size={16} /> Upload & Process
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Study Mode Selection */}
                {showStudyMode && (
                    <div className="study-mode-panel">
                        <h2><Sparkles size={22} /> Choose Your Study Mode</h2>
                        <p>Your document is being processed. Select how you'd like to study:</p>
                        <div className="study-mode-grid">
                            {studyModes.map(mode => (
                                <button
                                    key={mode.id}
                                    className={`study-mode-card ${selectedStudyMode === mode.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedStudyMode(mode.id)}
                                >
                                    <div className="study-mode-icon">{mode.icon}</div>
                                    <span className="study-mode-label">{mode.label}</span>
                                    <span className="study-mode-desc">{mode.desc}</span>
                                </button>
                            ))}
                        </div>
                        <div className="study-mode-actions">
                            <button
                                onClick={() => { setShowStudyMode(false); setSelectedStudyMode(''); }}
                                className="btn btn-outline"
                            >
                                Upload More
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={!selectedStudyMode}
                                className="btn btn-primary"
                            >
                                <Sparkles size={16} /> Generate
                            </button>
                        </div>
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="dash-documents">
                        <h2>Your Lecture Materials</h2>
                        {documents.length === 0 ? (
                            <div className="dash-empty">
                                <FileText size={48} />
                                <p>No documents uploaded yet.</p>
                                <button onClick={() => setActiveTab('upload')} className="btn btn-primary">
                                    Upload Your First Document
                                </button>
                            </div>
                        ) : (
                            <div className="dash-doc-list">
                                {documents.map((doc) => (
                                    <div key={doc._id} className="dash-doc-item">
                                        <div className="dash-doc-info">
                                            <FileText size={20} className="dash-doc-icon" />
                                            <div>
                                                <p className="dash-doc-name">{doc.originalName}</p>
                                                <div className="dash-doc-meta">
                                                    <span className={`dash-doc-status dash-doc-status-${doc.status}`}>
                                                        {doc.status}
                                                    </span>
                                                    <span className="dash-doc-date">
                                                        {new Date(doc.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dash-doc-actions">
                                            <button
                                                onClick={() => navigate(`/study-kit/${doc._id}`)}
                                                disabled={doc.status !== 'embedded'}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <ExternalLink size={14} /> Open
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc._id)}
                                                className="dash-doc-delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
