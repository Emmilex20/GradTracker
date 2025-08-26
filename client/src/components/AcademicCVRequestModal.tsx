/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/AcademicCVRequestModal.tsx
import React, { useState } from 'react';
import Modal from './Modal';
import { FaUpload, FaTimes, FaFileAlt, FaPencilAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SuccessToast from './common/Toasts/SuccessToast';
import ErrorToast from './common/Toasts/ErrorToast';
import ConfirmationModal from './common/ConfirmationModal';

// The new interface for the new CV request data
interface NewCVRequestData {
    notes: string;
}

interface AcademicCVRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
    onNewRequest: (data: NewCVRequestData) => Promise<void>;
}

const AcademicCVRequestModal: React.FC<AcademicCVRequestModalProps> = ({ isOpen, onClose, onUpload, onNewRequest }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [view, setView] = useState<'main' | 'upload' | 'new_request'>('main');
    const [newCVNotes, setNewCVNotes] = useState<string>('');
    const [isConfirmUploadOpen, setIsConfirmUploadOpen] = useState(false);
    const [isConfirmNewRequestOpen, setIsConfirmNewRequestOpen] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(<ErrorToast message="Invalid file type. Please upload a PDF, DOC, or DOCX file." />);
                setSelectedFile(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5 MB limit
                toast.error(<ErrorToast message="File size exceeds the 5MB limit." />);
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadClick = () => {
        if (!selectedFile) {
            toast.error(<ErrorToast message="Please select a file to upload." />);
            return;
        }
        setIsConfirmUploadOpen(true);
    };

    const confirmUpload = async () => {
        setIsConfirmUploadOpen(false);
        if (!selectedFile) return;

        setIsSubmitting(true);
        try {
            await onUpload(selectedFile);
            toast.success(<SuccessToast message="CV uploaded successfully!" />);
            handleClose();
        } catch (err) {
            toast.error(<ErrorToast message="Failed to upload file. Please try again." />);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewRequestClick = () => {
        if (newCVNotes.trim() === '') {
            toast.error(<ErrorToast message="Please provide some notes for the new CV request." />);
            return;
        }
        setIsConfirmNewRequestOpen(true);
    };

    const confirmNewRequest = async () => {
        setIsConfirmNewRequestOpen(false);
        if (newCVNotes.trim() === '') return;

        setIsSubmitting(true);
        try {
            await onNewRequest({ notes: newCVNotes });
            toast.success(<SuccessToast message="New CV request submitted successfully!" />);
            handleClose();
        } catch (err) {
            toast.error(<ErrorToast message="Failed to submit request. Please try again." />);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setNewCVNotes('');
        setIsSubmitting(false);
        setView('main'); // Reset view on close
        setIsConfirmUploadOpen(false);
        setIsConfirmNewRequestOpen(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Request Academic CV Review</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={20} />
                    </button>
                </div>

                {view === 'main' && (
                    <div className="space-y-4">
                        <p className="mb-4 text-gray-700">
                            How would you like to proceed?
                        </p>
                        <button
                            onClick={() => setView('upload')}
                            className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <FaUpload /> <span>Upload Existing CV</span>
                        </button>
                        <button
                            onClick={() => setView('new_request')}
                            className="w-full bg-gray-200 text-secondary font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <FaPencilAlt /> <span>Request New CV Write-up</span>
                        </button>
                    </div>
                )}

                {view === 'upload' && (
                    <>
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
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setView('main')}
                                className="bg-gray-200 text-secondary font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleUploadClick}
                                disabled={isSubmitting || !selectedFile}
                                className="bg-primary text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="mr-2 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="mr-2" /> Submit for Review
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {view === 'new_request' && (
                    <>
                        <p className="mb-4">
                            Provide some details about your academic and professional background to help us write your CV from scratch.
                        </p>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="notes">
                                Your Notes & Key Details
                            </label>
                            <textarea
                                id="notes"
                                rows={6}
                                value={newCVNotes}
                                onChange={(e) => setNewCVNotes(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
                                placeholder="E.g., previous degrees, research experience, publications, awards, etc."
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setView('main')}
                                className="bg-gray-200 text-secondary font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNewRequestClick}
                                disabled={isSubmitting || newCVNotes.trim() === ''}
                                className="bg-primary text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="mr-2 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FaPencilAlt className="mr-2" /> Request New CV
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Modal for Upload */}
            {isConfirmUploadOpen && (
                <ConfirmationModal
                    isOpen={isConfirmUploadOpen} // Add this prop
                    message="Are you sure you want to submit this file for review? Once submitted, you cannot edit it until a mentor provides feedback."
                    onConfirm={confirmUpload}
                    onCancel={() => setIsConfirmUploadOpen(false)}
                    title="Submit CV for Review"
                    confirmButtonText="Submit for Review"
                />
            )}

            {/* Confirmation Modal for New Request */}
            {isConfirmNewRequestOpen && (
                <ConfirmationModal
                    isOpen={isConfirmNewRequestOpen} // Add this prop
                    message="Are you sure you want to submit this request? A mentor will use these notes to write a new CV for you."
                    onConfirm={confirmNewRequest}
                    onCancel={() => setIsConfirmNewRequestOpen(false)}
                    title="Request New CV"
                    confirmButtonText="Request New CV"
                />
            )}
        </Modal>
    );
};

export default AcademicCVRequestModal;