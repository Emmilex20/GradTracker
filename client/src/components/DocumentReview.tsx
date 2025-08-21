import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload,  FaSpinner, FaFile } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import type { Application } from '../types/Application';
import DocumentListModal from './DocumentListModal';

// Update the Document type to match the back-end's populated data
interface Document {
    _id: string;
    applicationId: Application; // Change to Application object
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
    status: 'uploaded' | 'pending_review' | 'review_complete';
    correctedFileUrl?: string;
}

// Update the props to make 'documents' optional
interface DocumentReviewProps {
    application: Application;
    onDocumentUpdated: () => void;
    documents?: Document[]; // Make documents prop optional
}

const API_URL = import.meta.env.VITE_API_URL;

const DocumentReview: React.FC<DocumentReviewProps> = ({ application, onDocumentUpdated, documents: documentsFromProps }) => {
    const { currentUser, token, userProfile } = useAuth();
    const [localDocuments, setLocalDocuments] = useState<Document[]>(documentsFromProps || []);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedType, setSelectedType] = useState<string>('Statement of Purpose');
    const [uploading, setUploading] = useState<boolean>(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState<boolean>(false);

    const refreshDocuments = async () => {
        if (!currentUser || userProfile?.role === 'admin') {
            return;
        }

        try {
            const response = await axios.get<Document[]>(`${API_URL}/applications/${application._id}/documents`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLocalDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    useEffect(() => {
        if (userProfile?.role !== 'admin') {
            refreshDocuments();
        } else {
            setLocalDocuments(documentsFromProps || []);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [application._id, currentUser, token, documentsFromProps]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !currentUser || !token) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('fileType', selectedType);
        formData.append('userId', currentUser.uid);

        try {
            await axios.post(`${API_URL}/applications/${application._id}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });
            setSelectedFile(null);
            refreshDocuments();
            onDocumentUpdated();
        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {/* The "helping hand" text */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg text-blue-800">
                <p className="font-bold text-lg">
                    Save and store all your application docs securely here.
                </p>
            </div>

            {/* Upload Form (visible to user) */}
            {userProfile?.role !== 'admin' && (
                <form onSubmit={handleUpload} className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="flex-shrink-0 w-full sm:w-auto p-2 border rounded-md"
                        >
                            <option value="Statement of Purpose">Statement of Purpose</option>
                            <option value="Academic CV">Academic CV</option>
                            <option value="Reference Letter">Reference Letter</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="flex-1 w-full">
                            <label className="relative flex justify-between items-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                                <div className="flex items-center space-x-2">
                                    <FaFile className="text-blue-500" />
                                    <span className="text-sm text-gray-500">
                                        {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={!selectedFile || uploading}
                            className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                            <span className="ml-2">{uploading ? 'Uploading...' : 'Upload'}</span>
                        </button>
                    </div>
                </form>
            )}

            {/* Button to open the modal */}
            {localDocuments.length > 0 && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsDocumentModalOpen(true)}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                    >
                        View All Uploaded Documents
                    </button>
                </div>
            )}
            
            {/* Render the modal */}
            <DocumentListModal
                isOpen={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                application={application}
                documents={localDocuments}
                onDocumentUpdated={() => {
                    // Update state and then call the parent function
                    refreshDocuments();
                    onDocumentUpdated();
                }}
            />
        </div>
    );
};

export default DocumentReview;