// This component remains unchanged from the previous response.
import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner } from 'react-icons/fa';

interface AcademicCVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

const AcademicCVUploadModal: React.FC<AcademicCVUploadModalProps> = ({ isOpen, onClose, requestId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('correctedCV', file);

    try {
      await axios.post(`/api/cv-service/correct/${requestId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUploadSuccess('Corrected CV uploaded successfully!');
      setTimeout(onClose, 1500); // Close modal after a delay
    } catch (err) {
      console.error('Error uploading corrected CV:', err);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-6 border w-full max-w-lg shadow-lg rounded-md bg-white mx-4">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Corrected CV</h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Select corrected CV file
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {uploadSuccess && (
            <div className="text-green-600 text-sm font-semibold">{uploadSuccess}</div>
          )}
          {uploadError && (
            <div className="text-red-600 text-sm font-semibold">{uploadError}</div>
          )}
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? <><FaSpinner className="animate-spin mr-2" /> Uploading...</> : 'Upload Corrected CV'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcademicCVUploadModal;