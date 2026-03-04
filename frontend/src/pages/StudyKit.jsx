import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyKitService } from '../services/studyKitService';

function StudyKit() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [document, setDocument] = useState(null);
    const [summary, setSummary] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState('summary'); // 'summary' or 'quiz'

    useEffect(() => {
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        try {
            const data = await studyKitService.getDocumentById(id);
            setDocument(data);
            if (data.summary) setSummary(data.summary);
            if (data.quiz && data.quiz.length > 0) setQuiz(data.quiz);
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

    if (!document) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-indigo-600">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">
                            Study Kit: {document.originalName}
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto py-8 sm:px-6 lg:px-8 w-full">
                
                {error && <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button 
                        onClick={() => setView('summary')}
                        className={`pb-4 px-2 font-medium text-sm border-b-2 ${view === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Academic Summary
                    </button>
                    <button 
                        onClick={() => setView('quiz')}
                        className={`pb-4 px-2 font-medium text-sm border-b-2 ${view === 'quiz' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Practice Quiz
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white shadow rounded-lg p-8 min-h-[500px]">
                    {view === 'summary' && (
                        <div>
                            {!summary ? (
                                <div className="text-center py-20">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Yet</h3>
                                    <p className="text-gray-500 mb-6 font-light">Generate a structured academic summary strictly from the uploaded PDF.</p>
                                    <button 
                                        onClick={handleGenerateSummary}
                                        disabled={loading}
                                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Analyzing Content...' : 'Generate Summary'}
                                    </button>
                                </div>
                            ) : (
                                <div className="prose max-w-none prose-indigo">
                                    <h2 className="text-2xl font-bold mb-4 text-indigo-900">Academic Summary</h2>
                                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
                                        {summary}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'quiz' && (
                        <div>
                            {!quiz ? (
                                <div className="text-center py-20">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Yet</h3>
                                    <p className="text-gray-500 mb-6 font-light">Generate 10 deterministic multiple-choice questions based ONLY on the text.</p>
                                    <button 
                                        onClick={handleGenerateQuiz}
                                        disabled={loading}
                                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Generating Quiz...' : 'Generate 10-Question Quiz'}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 text-indigo-900">Practice Quiz</h2>
                                    <div className="flex flex-col gap-8">
                                        {quiz.map((q, i) => (
                                            <div key={i} className="bg-indigo-50/50 p-6 rounded-lg border border-indigo-100">
                                                <p className="font-semibold text-gray-900 mb-4">{i + 1}. {q.question}</p>
                                                <ul className="flex flex-col gap-2 pl-4">
                                                    {q.options.map((opt, optIndex) => (
                                                        <li key={optIndex} className="text-gray-700 list-disc">{opt}</li>
                                                    ))}
                                                </ul>
                                                <div className="mt-4 pt-4 border-t border-indigo-200">
                                                    <p className="text-sm font-medium text-indigo-800">
                                                        <span className="font-bold">Correct Answer:</span> {q.correctAnswer}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default StudyKit;
