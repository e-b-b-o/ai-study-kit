import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { studyKitService } from '../services/studyKitService';
import { useTheme } from '../components/ThemeProvider';
import ChatSidebar from '../components/ChatSidebar';
import {
    ArrowLeft, BookOpen, HelpCircle, Brain, StickyNote,
    MessageCircle, Loader2, Sun, Moon, RotateCcw, Sparkles
} from 'lucide-react';

function StudyKit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { theme, toggleTheme } = useTheme();

    const [document, setDocument] = useState(null);
    const [summary, setSummary] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [flashcards, setFlashcards] = useState(null);
    const [notes, setNotes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState('summary');
    const [chatOpen, setChatOpen] = useState(false);
    const [flippedCards, setFlippedCards] = useState({});

    useEffect(() => {
        fetchDocument();
        const tab = searchParams.get('tab');
        if (tab && ['summary', 'quiz', 'flashcards', 'notes'].includes(tab)) {
            setView(tab);
        }
        if (tab === 'chat') {
            setChatOpen(true);
        }
    }, [id]);

    const fetchDocument = async () => {
        try {
            const data = await studyKitService.getDocumentById(id);
            setDocument(data);
            if (data.summary) setSummary(data.summary);
            if (data.quiz && data.quiz.length > 0) setQuiz(data.quiz);
            if (data.flashcards && data.flashcards.length > 0) setFlashcards(data.flashcards);
            if (data.notes) setNotes(data.notes);
        } catch (err) {
            setError('Failed to fetch study kit');
        }
    };

    const handleGenerateSummary = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await studyKitService.generateSummary(id);
            setSummary(data.summary);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate summary');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await studyKitService.generateQuiz(id);
            setQuiz(data.quiz);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await studyKitService.generateFlashcards(id);
            setFlashcards(data.flashcards);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate flashcards');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateNotes = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await studyKitService.generateNotes(id);
            setNotes(data.notes);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate notes');
        } finally {
            setLoading(false);
        }
    };

    const toggleFlipCard = (index) => {
        setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const tabs = [
        { id: 'summary', label: 'Summary', icon: <BookOpen size={16} /> },
        { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={16} /> },
        { id: 'flashcards', label: 'Flashcards', icon: <Brain size={16} /> },
        { id: 'notes', label: 'Notes', icon: <StickyNote size={16} /> },
    ];

    if (!document) {
        return (
            <div className="sk-loading">
                <Loader2 size={32} className="spin" />
                <p>Loading study kit...</p>
            </div>
        );
    }

    return (
        <div className="sk-layout">
            {/* Header */}
            <header className="sk-header">
                <div className="sk-header-inner">
                    <div className="sk-header-left">
                        <button onClick={() => navigate('/dashboard')} className="sk-back-btn">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="sk-header-title">
                            <h1>{document.originalName}</h1>
                        </div>
                    </div>
                    <div className="sk-header-right">
                        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className={`sk-chat-toggle ${chatOpen ? 'active' : ''}`}
                        >
                            <MessageCircle size={18} />
                            <span>AI Tutor</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="sk-body">
                <main className={`sk-main ${chatOpen ? 'sidebar-open' : ''}`}>
                    {error && (
                        <div className="dash-alert dash-alert-error" style={{ margin: '0 0 1.5rem' }}>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="sk-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`sk-tab ${view === tab.id ? 'active' : ''}`}
                                onClick={() => setView(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="sk-content">
                        {/* ── Summary ── */}
                        {view === 'summary' && (
                            <div className="sk-panel">
                                {!summary ? (
                                    <div className="sk-empty">
                                        <BookOpen size={48} />
                                        <h3>No Summary Yet</h3>
                                        <p>Generate a structured academic summary strictly from your uploaded material.</p>
                                        <button onClick={handleGenerateSummary} disabled={loading} className="btn btn-primary">
                                            {loading ? <><Loader2 size={16} className="spin" /> Analyzing...</> : <><Sparkles size={16} /> Generate Summary</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="sk-result">
                                        <h2>Academic Summary</h2>
                                        <div className="sk-text-content">{summary}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Quiz ── */}
                        {view === 'quiz' && (
                            <div className="sk-panel">
                                {!quiz ? (
                                    <div className="sk-empty">
                                        <HelpCircle size={48} />
                                        <h3>No Quiz Yet</h3>
                                        <p>Generate 10 multiple-choice questions based only on your uploaded text.</p>
                                        <button onClick={handleGenerateQuiz} disabled={loading} className="btn btn-primary">
                                            {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : <><Sparkles size={16} /> Generate Quiz</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="sk-result">
                                        <h2>Practice Quiz</h2>
                                        <div className="sk-quiz-list">
                                            {quiz.map((q, i) => (
                                                <div key={i} className="sk-quiz-item">
                                                    <p className="sk-quiz-question">{i + 1}. {q.question}</p>
                                                    <ul className="sk-quiz-options">
                                                        {q.options.map((opt, oi) => (
                                                            <li key={oi}>{opt}</li>
                                                        ))}
                                                    </ul>
                                                    <div className="sk-quiz-answer">
                                                        <strong>Correct:</strong> {q.correctAnswer}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Flashcards ── */}
                        {view === 'flashcards' && (
                            <div className="sk-panel">
                                {!flashcards ? (
                                    <div className="sk-empty">
                                        <Brain size={48} />
                                        <h3>No Flashcards Yet</h3>
                                        <p>Generate flashcards for active recall practice from your material.</p>
                                        <button onClick={handleGenerateFlashcards} disabled={loading} className="btn btn-primary">
                                            {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : <><Sparkles size={16} /> Generate Flashcards</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="sk-result">
                                        <div className="sk-result-header">
                                            <h2>Flashcards</h2>
                                            <button onClick={() => setFlippedCards({})} className="btn btn-outline btn-sm">
                                                <RotateCcw size={14} /> Reset All
                                            </button>
                                        </div>
                                        <div className="sk-flashcard-grid">
                                            {flashcards.map((card, i) => (
                                                <div
                                                    key={i}
                                                    className={`sk-flashcard ${flippedCards[i] ? 'flipped' : ''}`}
                                                    onClick={() => toggleFlipCard(i)}
                                                >
                                                    <div className="sk-flashcard-inner">
                                                        <div className="sk-flashcard-front">
                                                            <span className="sk-flashcard-label">Question</span>
                                                            <p>{card.front}</p>
                                                        </div>
                                                        <div className="sk-flashcard-back">
                                                            <span className="sk-flashcard-label">Answer</span>
                                                            <p>{card.back}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Notes ── */}
                        {view === 'notes' && (
                            <div className="sk-panel">
                                {!notes ? (
                                    <div className="sk-empty">
                                        <StickyNote size={48} />
                                        <h3>No Notes Yet</h3>
                                        <p>Generate concise, organized study notes from your material.</p>
                                        <button onClick={handleGenerateNotes} disabled={loading} className="btn btn-primary">
                                            {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : <><Sparkles size={16} /> Generate Notes</>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="sk-result">
                                        <h2>Study Notes</h2>
                                        <div className="sk-text-content">{notes}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Chat Sidebar */}
                <ChatSidebar
                    documentId={id}
                    isOpen={chatOpen}
                    onClose={() => setChatOpen(false)}
                />
            </div>
        </div>
    );
}

export default StudyKit;
