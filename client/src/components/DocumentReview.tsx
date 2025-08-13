/* eslint-disable no-irregular-whitespace */
// src/components/DocumentReview.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaDownload, FaTrash, FaSpinner, FaPaperPlane, FaCheckCircle, FaFile } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import type { Application } from '../types/Application';

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
    // Use either the prop or a local state
    const [localDocuments, setLocalDocuments] = useState<Document[]>(documentsFromProps || []);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedType, setSelectedType] = useState<string>('Statement of Purpose');
    const [uploading, setUploading] = useState<boolean>(false);
    const [loadingDocs, setLoadingDocs] = useState<boolean>(false); // Changed default to false
    const [correctedFile, setCorrectedFile] = useState<File | null>(null);
    const [isSubmittingCorrection, setIsSubmittingCorrection] = useState<boolean>(false);

    // This function will be used to update both local state and the parent
    const refreshDocuments = async () => {
        // Only fetch documents if the documents prop is not provided (i.e., not the admin view)
        if (!currentUser || userProfile?.role === 'admin') {
            return;
        }

        setLoadingDocs(true);
        try {
            const response = await axios.get<Document[]>(`${API_URL}/applications/${application._id}/documents`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLocalDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        // If documents are not provided as a prop, fetch them on mount
        if (userProfile?.role !== 'admin') {
            refreshDocuments();
        } else {
            // If documents are provided as a prop, use them directly
            setLocalDocuments(documentsFromProps || []);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [application._id, currentUser, token, documentsFromProps]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleCorrectedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCorrectedFile(e.target.files[0]);
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
            refreshDocuments(); // Use the new refreshDocuments function
            onDocumentUpdated();
        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await axios.delete(`${API_URL}/applications/${application._id}/documents/${documentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                refreshDocuments(); // Use the new refreshDocuments function
                onDocumentUpdated();
            } catch (error) {
                console.error('Failed to delete document:', error);
                alert('Failed to delete document. Please try again.');
            }
        }
    };

    /**
     * Corrected handleDownload function to force a direct download
     * by creating a temporary anchor tag. This function now calls the
     * back-end to get a signed URL before downloading the file.
     */
    const handleDownload = async (documentId: string, filename: string) => {
      if (!token) {
        console.error('Authentication token is missing.');
        alert('Authentication token is missing. Please log in again.');
        return;
      }

      try {
        // Step 1: Call the backend to get the signed download URL
        const response = await axios.get<{ downloadUrl: string }>(
          `${API_URL}/documents/${documentId}/download-url`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const downloadUrl = response.data.downloadUrl;

        // Step 2: Use the signed URL to trigger the download directly
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error('Error downloading the document:', error);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          alert('You do not have permission to download this document.');
        } else {
          alert('Failed to download document. Please ensure you are logged in and have permission.');
        }
      }
    };

    const handleSubmitForReview = async (documentId: string) => {
        if (window.confirm('Are you sure you want to submit this document for review?')) {
            try {
                await axios.put(`${API_URL}/applications/${application._id}/documents/${documentId}/submit-for-review`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                refreshDocuments(); // Use the new refreshDocuments function
                onDocumentUpdated();
            } catch (error) {
                console.error('Failed to submit for review:', error);
                alert('Failed to submit document for review. Please try again.');
            }
        }
    };

    const handleCorrectedUpload = async (documentId: string) => {
        if (!correctedFile || !token) return;
        setIsSubmittingCorrection(true);

        const formData = new FormData();
        formData.append('correctedDocument', correctedFile);

        try {
            await axios.post(`${API_URL}/admin/documents/correct/${documentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setCorrectedFile(null);
            // After successful upload, inform the parent component to refresh its state
            onDocumentUpdated();
        } catch (error) {
            console.error('Failed to upload corrected document:', error);
            alert('Failed to upload corrected document.');
        } finally {
            setIsSubmittingCorrection(false);
        }
    };

    return (
        <div>
            {/* The "helping hand" text */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg text-blue-800">
                <p className="font-bold text-lg">
                    Keep all your important application documents in one secure place. Upload your Statement of Purpose, CV, and other files here so you can easily access and review them at any time, saving you the hassle of searching through emails and folders.
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

            {/* Document List */}
            <h4 className="font-bold text-lg mb-2 text-gray-700">Uploaded Documents</h4>
            {loadingDocs ? (
                <div className="flex items-center justify-center p-8">
                    <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
            ) : localDocuments.length > 0 ? (
                <ul className="space-y-3">
                    {localDocuments.map(doc => (
                        <li key={doc._id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-shadow duration-200 hover:shadow-md">
                            <div className="flex items-center space-x-3 truncate">
                                <span className="text-gray-500 text-sm font-medium">{doc.fileType}:</span>
                                <span className="font-medium text-gray-800 truncate">{doc.fileName}</span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    doc.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
                                    doc.status === 'review_complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {doc.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                                {/* Download original document */}
                                <button
                                    onClick={() => handleDownload(doc._id, doc.fileName)} // Call with doc._id, not doc.fileUrl
                                    className="p-2 text-blue-600 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                    title="Download Original Document"
                                >
                                    <FaDownload />
                                </button>
                                {/* Show "Submit for Review" button if status is 'uploaded' and it's not an admin */}
                                {userProfile?.role !== 'admin' && doc.status === 'uploaded' && (
                                    <button
                                        onClick={() => handleSubmitForReview(doc._id)}
                                        className="p-2 text-purple-600 rounded-full hover:bg-purple-100 transition-colors duration-200"
                                        title="Submit for Review"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                )}
                                {/* Download corrected version if available */}
                                {doc.status === 'review_complete' && doc.correctedFileUrl && (
                                    <button
                                        onClick={() => handleDownload(doc._id, `${doc.fileName}_corrected`)} // Pass doc._id
                                        className="p-2 text-green-600 rounded-full hover:bg-green-100 transition-colors duration-200"
                                        title="Download Corrected Version"
                                    >
                                        <FaDownload />
                                    </button>
                                )}
                                {/* Admin-specific upload for corrections */}
                                {userProfile?.role === 'admin' && doc.status === 'pending_review' && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="file"
                                            onChange={handleCorrectedFileChange}
                                            className="text-sm"
                                        />
                                        <button
                                            onClick={() => handleCorrectedUpload(doc._id)}
                                            disabled={!correctedFile || isSubmittingCorrection}
                                            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
                                            title="Upload Corrected Document"
                                        >
                                            {isSubmittingCorrection ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                                        </button>
                                    </div>
                                )}
                                {/* Delete button */}
                                {userProfile?.role !== 'admin' && (
                                    <button
                                        onClick={() => handleDeleteDocument(doc._id)}
                                        className="p-2 text-red-600 rounded-full hover:bg-red-100 transition-colors duration-200"
                                        title="Delete Document"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 italic p-4 text-center bg-white rounded-xl shadow-sm">No documents uploaded yet.</p>
            )}
        </div>
    );
};

export default DocumentReview;