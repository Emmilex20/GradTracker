import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import type { Document } from '../types/documents';
import api from '../utils/api'; // <-- IMPORT THE NEW AXIOS INSTANCE

const API_URL = import.meta.env.VITE_API_URL;

const AdminReviewPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchDocumentsForReview = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Use the `api` instance for the request
            const response = await api.get<Document[]>(`${API_URL}/admin/documents/for-review`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents for review:', error);
            alert('Failed to fetch documents for review.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentsForReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const handleCorrectedFileUpload = async (documentId: string, applicationId: string) => {
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            // Use the `api` instance for the request
            await api.post(
                `${API_URL}/applications/${applicationId}/documents/${documentId}/corrected-version`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            setSelectedFile(null);
            fetchDocumentsForReview();
            alert('Corrected document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading corrected document:', error);
            alert('Failed to upload corrected document.');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Documents Awaiting Review</h1>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
            ) : documents.length > 0 ? (
                <ul className="space-y-4">
                    {documents.map(doc => (
                        <li key={doc._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-xl font-bold text-gray-700">{doc.fileType} for {doc.applicationId.programName}</h3>
                                <p className="text-gray-500">
                                    School: {doc.applicationId.schoolName}
                                    <br />
                                    Filename: {doc.fileName}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                    className="p-3 text-blue-600 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                    title="Download Original"
                                >
                                    <FaDownload />
                                </button>
                                
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                    />
                                    <span className="cursor-pointer p-3 text-purple-600 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200" title="Upload Corrected Version">
                                        <FaUpload />
                                    </span>
                                </label>
                                
                                <button
                                    onClick={() => handleCorrectedFileUpload(doc._id, doc.applicationId._id)}
                                    disabled={!selectedFile}
                                    className="p-3 text-white bg-green-600 rounded-full shadow-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Submit Corrected Document"
                                >
                                    <FaCheck />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 italic">No documents currently awaiting review.</p>
            )}
        </div>
    );
};

export default AdminReviewPage;