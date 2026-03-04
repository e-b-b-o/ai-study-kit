import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyKitService } from '../services/studyKitService';
import authService from '../services/authService';

function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setError('');
        try {
            await studyKitService.uploadDocument(file);
            setFile(null);
            fetchDocuments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
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

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-indigo-900">AI Study Kit Generator</h1>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
                <div className="px-4 py-6 sm:px-0 flex flex-col gap-8">
                    
                    {/* Upload Section */}
                    <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Lecture PDF</h2>
                        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                        
                        <form onSubmit={handleUpload} className="flex items-center gap-4">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-indigo-50 file:text-indigo-700
                                  hover:file:bg-indigo-100 cursor-pointer"
                            />
                            <button
                                type="submit"
                                disabled={!file || uploading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {uploading ? 'Processing...' : 'Upload'}
                            </button>
                        </form>
                    </div>

                    {/* Documents List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-5 py-5 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Lecture Materials</h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {documents.length === 0 ? (
                                <li className="px-6 py-4 text-gray-500 text-center">No documents uploaded yet. Upload a PDF to get started!</li>
                            ) : (
                                documents.map((doc) => (
                                    <li key={doc._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{doc.originalName}</p>
                                            <div className="flex gap-2">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    doc.status === 'embedded' ? 'bg-green-100 text-green-800' : 
                                                    doc.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {doc.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => navigate(`/study-kit/${doc._id}`)}
                                                disabled={doc.status !== 'embedded'}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Open Study Kit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(doc._id)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
