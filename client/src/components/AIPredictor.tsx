import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCloudUploadAlt, FaMagic, FaSpinner } from 'react-icons/fa';

const API_PREDICT_URL = import.meta.env.VITE_API_PREDICT_URL;

const AIPredictor: React.FC = () => {
    const { token } = useAuth();
    const [sopFile, setSopFile] = useState<File | null>(null);
    const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [prediction, setPrediction] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
        if (e.target.files && e.target.files[0]) {
            switch (fileType) {
                case 'sop':
                    setSopFile(e.target.files[0]);
                    break;
                case 'transcript':
                    setTranscriptFile(e.target.files[0]);
                    break;
                case 'cv':
                    setCvFile(e.target.files[0]);
                    break;
            }
            setPrediction(null);
            setError(null);
        }
    };

    const handlePredict = async () => {
        if (!sopFile || !transcriptFile || !cvFile) {
            setError("Please upload all three documents to get a prediction.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('sop', sopFile);
        formData.append('transcript', transcriptFile);
        formData.append('cv', cvFile);

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
            // Assuming the API returns a score from 0-100
            const score = response.data.score;
            setPrediction(score);
        } catch (err) {
            console.error('Prediction failed:', err);
            setError('Prediction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPredictionColor = (score: number) => {
        if (score >= 80) return 'text-green-500'; // High chance
        if (score >= 50) return 'text-yellow-500'; // Medium chance
        return 'text-red-500'; // Lower chance
    };

    const getPredictionCategory = (score: number) => {
        if (score >= 80) return 'High Chance';
        if (score >= 50) return 'Good Chance';
        return 'Room for Improvement';
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-secondary flex items-center">
                    <FaMagic className="mr-2 text-primary" /> AI Application Predictor
                </h2>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <label htmlFor="sop-upload" className="flex-grow w-full p-4 bg-neutral-100 rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors flex items-center justify-between">
                        <span className="text-neutral-dark flex items-center">
                            <FaCloudUploadAlt className="mr-2" /> Upload SOP
                        </span>
                        <span className="text-sm text-neutral-500">{sopFile ? sopFile.name : 'No file selected'}</span>
                    </label>
                    <input id="sop-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'sop')} />
                    
                    <label htmlFor="transcript-upload" className="flex-grow w-full p-4 bg-neutral-100 rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors flex items-center justify-between">
                        <span className="text-neutral-dark flex items-center">
                            <FaCloudUploadAlt className="mr-2" /> Upload Transcript
                        </span>
                        <span className="text-sm text-neutral-500">{transcriptFile ? transcriptFile.name : 'No file selected'}</span>
                    </label>
                    <input id="transcript-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'transcript')} />

                    <label htmlFor="cv-upload" className="flex-grow w-full p-4 bg-neutral-100 rounded-xl cursor-pointer hover:bg-neutral-200 transition-colors flex items-center justify-between">
                        <span className="text-neutral-dark flex items-center">
                            <FaCloudUploadAlt className="mr-2" /> Upload CV
                        </span>
                        <span className="text-sm text-neutral-500">{cvFile ? cvFile.name : 'No file selected'}</span>
                    </label>
                    <input id="cv-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'cv')} />
                </div>
            </div>

            {error && <div className="text-red-500 mt-4 text-center">{error}</div>}

            <div className="mt-6 text-center">
                <button
                    onClick={handlePredict}
                    disabled={!sopFile || !transcriptFile || !cvFile || loading}
                    className="bg-primary text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-2" /> Predicting...
                        </>
                    ) : (
                        'Get Prediction Score'
                    )}
                </button>
            </div>

            {prediction !== null && (
                <div className="mt-8 text-center animate-fade-in">
                    <p className="text-xl font-bold">Your AI-Predicted Score:</p>
                    <div className="mt-4">
                        <span className={`text-6xl font-extrabold ${getPredictionColor(prediction)}`}>
                            {prediction.toFixed(0)}%
                        </span>
                        <p className={`mt-2 text-lg font-semibold ${getPredictionCategory(prediction)}`}>
                            {getPredictionCategory(prediction)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIPredictor;