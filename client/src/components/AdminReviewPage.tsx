import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import type { Document } from '../types/documents';
import api from '../utils/api';

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
      await api.post(
        `${API_URL}/applications/${applicationId}/documents/${documentId}/corrected-version`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
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
    <div className="p-8 max-w-6xl mx-auto bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen rounded-xl shadow-inner">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
        Documents Awaiting Review
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <FaSpinner className="animate-spin text-5xl text-indigo-500" />
        </div>
      ) : documents.length > 0 ? (
        <ul className="space-y-6">
          {documents.map(doc => (
            <li
              key={doc._id}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                
                {/* Document Info */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-1">
                    {doc.fileType} for <span className="text-indigo-600">{doc.applicationId.programName}</span>
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    <span className="font-medium">School:</span> {doc.applicationId.schoolName} <br />
                    <span className="font-medium">Filename:</span> {doc.fileName}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="p-3 text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                    title="Download Original"
                  >
                    <FaDownload />
                  </button>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                    <span
                      className="p-3 text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors duration-200"
                      title="Upload Corrected Version"
                    >
                      <FaUpload />
                    </span>
                  </label>

                  <button
                    onClick={() => handleCorrectedFileUpload(doc._id, doc.applicationId._id)}
                    disabled={!selectedFile}
                    className={`p-3 rounded-full shadow-md transition-colors duration-200 ${
                      selectedFile
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-green-300 text-white cursor-not-allowed opacity-50'
                    }`}
                    title="Submit Corrected Document"
                  >
                    <FaCheck />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 italic">
          No documents currently awaiting review.
        </p>
      )}
    </div>
  );
};

export default AdminReviewPage;
