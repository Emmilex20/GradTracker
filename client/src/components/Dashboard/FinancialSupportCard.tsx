/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { FaDollarSign, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../Modal';
import FinancialSupportHistory from './FinancialSupportHistory'; // We'll create this next

interface FinancialSupportCardProps {
    applications: any[]; // You can type this more strictly later if needed
}

const FinancialSupportCard: React.FC<FinancialSupportCardProps> = ({ applications }) => {
    const { currentUser } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [notes, setNotes] = useState('');
    const [requestedAmount, setRequestedAmount] = useState(''); // NEW STATE FOR AMOUNT

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        // Check for required fields: user, application, and the new requested amount
        if (!currentUser || !selectedApplicationId || !requestedAmount) {
            alert('Please select an application, enter the requested amount, and make sure you are logged in.');
            return;
        }

        const selectedApp = applications.find(app => app.id === selectedApplicationId);

        try {
            await addDoc(collection(db, "financial_support_requests"), {
                userId: currentUser.uid,
                userEmail: currentUser.email, // ADDED USER EMAIL
                applicationId: selectedApplicationId,
                universityName: selectedApp?.schoolName || '', // ADDED UNIVERSITY NAME
                requestedAmount: parseFloat(requestedAmount), // CONVERT TO NUMBER
                notes,
                status: 'pending',
                requestedAt: Timestamp.now(),
            });

            alert('Financial support request sent successfully!');
            setIsFormOpen(false);
            setSelectedApplicationId('');
            setNotes('');
            setRequestedAmount('');
        } catch (error) {
            console.error('Error sending financial support request:', error);
            alert('Failed to send request. Please try again.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
                    <FaDollarSign className="mr-2 text-primary" /> Financial Support Request
                </h3>
                <p className="text-neutral-dark mt-1 text-sm sm:text-base">
                    Request one-on-one sessions for financial aid and scholarship guidance.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 w-full"
                >
                    <span>Request Session</span>
                    <FaDollarSign />
                </button>
                <button
                    onClick={() => setShowHistoryModal(true)}
                    className="bg-gray-200 text-secondary font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 w-full"
                >
                    <span>View History</span>
                    <FaHistory />
                </button>
            </div>

            {/* Request Form Modal */}
            {isFormOpen && (
                <Modal onClose={() => setIsFormOpen(false)}>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-4">Request Financial Support Session</h2>
                        <form onSubmit={handleRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Application</label>
                                <select
                                    value={selectedApplicationId}
                                    onChange={(e) => setSelectedApplicationId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    required
                                >
                                    <option value="">-- Select an application --</option>
                                    {applications.map(app => (
                                        <option key={app.id} value={app.id}>
                                            {app.schoolName} - {app.programName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* NEW FIELD: Requested Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Requested Amount ($)</label>
                                <input
                                    type="number"
                                    value={requestedAmount}
                                    onChange={(e) => setRequestedAmount(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    placeholder="e.g., 5000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    placeholder="e.g., specific scholarship questions, need help with budgeting, etc."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Submit Request
                            </button>
                        </form>
                    </div>
                </Modal>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <Modal onClose={() => setShowHistoryModal(false)}>
                    <FinancialSupportHistory onClose={() => setShowHistoryModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default FinancialSupportCard;