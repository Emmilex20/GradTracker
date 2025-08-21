// src/components/Dashboard/AIPredictor.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCloudUploadAlt, FaMagic, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type { Application } from '../types/Application'; // Import the Application type

const API_PREDICT_URL = import.meta.env.VITE_API_PREDICT_URL;

interface Props {
    applications: Application[]; // Prop to receive the list of applications
}

const AIPredictor: React.FC<Props> = ({ applications }) => {
    const { token } = useAuth();
    const [sopFile, setSopFile] = useState<File | null>(null);
    const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
    const [school, setSchool] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [prediction, setPrediction] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const isButtonActive = sopFile && transcriptFile && cvFile && school && department;

    // Effect to update school and department when a new application is selected
    useEffect(() => {
        if (selectedApplicationId) {
            const selectedApp = applications.find(app => app._id === selectedApplicationId);
            if (selectedApp) {
                setSchool(selectedApp.schoolName);
                setDepartment(selectedApp.programName);
            }
        } else {
            // Clear fields if no application is selected
            setSchool('');
            setDepartment('');
        }
    }, [selectedApplicationId, applications]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
        if (e.target.files && e.target.files.length > 0) {
            switch (fileType) {
                case 'sop':
                    setSopFile(e.target.files.item(0) || null);
                    break;
                case 'transcript':
                    setTranscriptFile(e.target.files.item(0) || null);
                    break;
                case 'cv':
                    setCvFile(e.target.files.item(0) || null);
                    break;
            }
            setPrediction(null);
            setError(null);
            setStatusMessage(null);
        }
    };
    
    // Handler for the new application dropdown
    const handleApplicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedApplicationId(e.target.value);
        setPrediction(null);
        setError(null);
        setStatusMessage(null);
    };

    const handlePredict = async () => {
        if (!sopFile || !transcriptFile || !cvFile || !school || !department) {
            setError("Please upload all three documents and select an application to get a prediction.");
            return;
        }

        setLoading(true);
        setError(null);
        setPrediction(null);
        setStatusMessage("Analyzing your documents with our AI model...");

        const formData = new FormData();
        formData.append('sop', sopFile);
        formData.append('transcript', transcriptFile);
        formData.append('cv', cvFile);
        formData.append('school', school);
        formData.append('department', department);

        try {
            const response = await axios.post(
                `${API_PREDICT_URL}/predict`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            const score = response.data.score;
            setPrediction(score);
            setStatusMessage("Prediction complete!");
        } catch (err) {
            console.error('Prediction failed:', err);
            setError('Prediction failed. Please try again.');
            setStatusMessage(null);
        } finally {
            setLoading(false);
        }
    };

    const getPredictionColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getPredictionCategory = (score: number) => {
        if (score >= 80) return 'High Chance';
        if (score >= 50) return 'Good Chance';
        return 'Room for Improvement';
    };

    const getPredictionDescription = (score: number) => {
        if (score >= 80) {
            return "Excellent! Your application materials are highly compelling. The AI model predicts a strong likelihood of admission.";
        }
        if (score >= 50) {
            return "Good job! Your documents present a solid case. There is a good chance for a positive outcome, but consider refining your materials to stand out further.";
        }
        return "The AI model suggests there is room for improvement. Focus on strengthening your narrative, highlighting key achievements, and aligning your documents more closely with program requirements.";
    };

    const getFileStatus = (file: File | null) => {
        if (file) {
            return <FaCheckCircle className="text-green-500 ml-2" />;
        }
        return <FaExclamationCircle className="text-gray-400 ml-2" />;
    };

    return (
        <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-secondary flex items-center mb-2 sm:mb-0">
                    <FaMagic className="mr-2 text-primary" /> AI Application Predictor
                </h2>
                <span className="text-sm text-neutral-500">
                    Powered by advanced AI
                </span>
            </div>

            <p className="text-neutral-600 mb-6 text-center text-sm sm:text-base">
                Upload your Statement of Purpose (SOP), Academic Transcript, and Curriculum Vitae (CV) to receive an AI-driven prediction on your application's potential.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="w-full">
                    <label htmlFor="application-select" className="block text-sm font-medium text-gray-700 mb-1">Select an Application</label>
                    <select
                        id="application-select"
                        className="w-full p-3 rounded-lg border-2 border-neutral-200 focus:outline-none focus:border-primary transition-colors"
                        value={selectedApplicationId}
                        onChange={handleApplicationChange}
                    >
                        <option value="">-- Select from your applications --</option>
                        {applications.map(app => (
                            <option key={app._id} value={app._id}>
                                {app.schoolName} - {app.programName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full">
                    <label htmlFor="school-input" className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                    <input
                        id="school-input"
                        type="text"
                        placeholder="School Name"
                        className="w-full p-3 rounded-lg border-2 border-neutral-200 focus:outline-none focus:border-primary transition-colors bg-gray-100 cursor-not-allowed"
                        value={school}
                        readOnly // Make the field read-only
                    />
                </div>
                <div className="w-full sm:col-span-2">
                    <label htmlFor="department-input" className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                    <input
                        id="department-input"
                        type="text"
                        placeholder="Department Name"
                        className="w-full p-3 rounded-lg border-2 border-neutral-200 focus:outline-none focus:border-primary transition-colors bg-gray-100 cursor-not-allowed"
                        value={department}
                        readOnly // Make the field read-only
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.label
                    htmlFor="sop-upload"
                    className={`flex-grow w-full p-4 bg-neutral-100 rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors flex items-center justify-between ${sopFile ? 'border-2 border-green-300' : 'border-2 border-transparent'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-neutral-dark flex items-center">
                        <FaCloudUploadAlt className="mr-2" /> Upload SOP
                        {getFileStatus(sopFile)}
                    </span>
                    <span className="text-sm text-neutral-500 text-right truncate max-w-[50%]">{sopFile ? sopFile.name : 'No file selected'}</span>
                </motion.label>
                <input id="sop-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'sop')} />

                <motion.label
                    htmlFor="transcript-upload"
                    className={`flex-grow w-full p-4 bg-neutral-100 rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors flex items-center justify-between ${transcriptFile ? 'border-2 border-green-300' : 'border-2 border-transparent'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-neutral-dark flex items-center">
                        <FaCloudUploadAlt className="mr-2" /> Upload Transcript
                        {getFileStatus(transcriptFile)}
                    </span>
                    <span className="text-sm text-neutral-500 text-right truncate max-w-[50%]">{transcriptFile ? transcriptFile.name : 'No file selected'}</span>
                </motion.label>
                <input id="transcript-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'transcript')} />

                <motion.label
                    htmlFor="cv-upload"
                    className={`flex-grow w-full p-4 bg-neutral-100 rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors flex items-center justify-between ${cvFile ? 'border-2 border-green-300' : 'border-2 border-transparent'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-neutral-dark flex items-center">
                        <FaCloudUploadAlt className="mr-2" /> Upload CV
                        {getFileStatus(cvFile)}
                    </span>
                    <span className="text-sm text-neutral-500 text-right truncate max-w-[50%]">{cvFile ? cvFile.name : 'No file selected'}</span>
                </motion.label>
                <input id="cv-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'cv')} />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className="text-red-500 mt-4 text-center text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-6 text-center">
                <motion.button
                    onClick={handlePredict}
                    disabled={!isButtonActive || loading}
                    className={`bg-primary text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ${
                        isButtonActive && !loading
                            ? 'hover:bg-indigo-700 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                    } flex items-center justify-center mx-auto`}
                    whileHover={isButtonActive && !loading ? { scale: 1.05 } : {}}
                    whileTap={isButtonActive && !loading ? { scale: 0.95 } : {}}
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-2" /> Predicting...
                        </>
                    ) : (
                        'Get Prediction Score'
                    )}
                </motion.button>
                <p className={`text-sm mt-2 transition-opacity duration-300 ${isButtonActive ? 'text-green-600 opacity-100' : 'text-neutral-500 opacity-80'}`}>
                    Please upload all three documents and select an application for the prediction to be activated.
                </p>
            </div>

            <AnimatePresence>
                {statusMessage && (
                    <motion.div
                        className="mt-4 text-center text-sm text-neutral-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {statusMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {prediction !== null && (
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-xl font-bold">Your AI-Predicted Score:</p>
                        <motion.div
                            className="mt-4 inline-block"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 0.3 }}
                        >
                            <span className={`text-6xl font-extrabold ${getPredictionColor(prediction)}`}>
                                {prediction.toFixed(0)}%
                            </span>
                            <p className={`mt-2 text-lg font-semibold ${getPredictionColor(prediction)}`}>
                                {getPredictionCategory(prediction)}
                            </p>
                        </motion.div>
                        <motion.p
                            className="mt-4 text-neutral-600 max-w-lg mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            {getPredictionDescription(prediction)}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AIPredictor;