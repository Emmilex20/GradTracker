import React, { useState } from 'react';
import Modal from './Modal';
import { FaUpload, FaTimes, FaFileAlt } from 'react-icons/fa';

interface AcademicCVRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (file: File) => void;
}

const AcademicCVRequestModal: React.FC<AcademicCVRequestModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
                setSelectedFile(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5 MB limit
                setError('File size exceeds the 5MB limit.');
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleConfirm = async () => {
        if (selectedFile) {
            setIsSubmitting(true);
            try {
                await onConfirm(selectedFile);
                // The parent component should handle closing the modal on success
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError('Failed to upload file. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Request Academic CV Review</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={20} />
                    </button>
                </div>
                <p className="mb-4">
                    Upload your current CV for a professional academic review.
                </p>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="cv-file">
                        Upload CV file (PDF, DOC, or DOCX)
                    </label>
                    <input
                        type="file"
                        id="cv-file"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-indigo-700"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                    />
                    {selectedFile && (
                        <p className="mt-2 text-sm text-green-600 flex items-center">
                            <FaFileAlt className="mr-2" />
                            Selected file: {selectedFile.name}
                        </p>
                    )}
                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedFile || isSubmitting}
                        className="bg-primary text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <FaUpload className="mr-2 animate-pulse" /> Submitting...
                            </>
                        ) : (
                            <>
                                <FaUpload className="mr-2" /> Submit for Review
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AcademicCVRequestModal;