/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { FaDollarSign, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../Modal';
import FinancialSupportHistory from './FinancialSupportHistory';

// The Group type definition is now imported or defined here
interface Group {
    id: string;
    name: string;
}

interface FinancialSupportCardProps {
    applications: any[];
    userGroups: Group[]; // NEW PROP: Pass the user's groups here
}

const FinancialSupportCard: React.FC<FinancialSupportCardProps> = ({ applications, userGroups }) => {
    const { currentUser } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [notes, setNotes] = useState('');
    const [requestedAmount, setRequestedAmount] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentUser || !selectedApplicationId || !requestedAmount || !selectedGroupId) {
            alert('Please select an application, a group, and enter the requested amount.');
            return;
        }

        const selectedApp = applications.find(app => app.id === selectedApplicationId);
        
        if (!selectedApp) {
            alert('Selected application not found. Please try again or refresh the page.');
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, "financial_support_requests"), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                applicationId: selectedApplicationId,
                universityName: selectedApp.schoolName || '',
                requestedAmount: parseFloat(requestedAmount),
                notes,
                groupId: selectedGroupId,
                status: 'pending',
                requestedAt: Timestamp.now(),
            });

            alert('Financial support request sent successfully!');
            setIsFormOpen(false);
            setSelectedApplicationId('');
            setNotes('');
            setRequestedAmount('');
            setSelectedGroupId('');
        } catch (error) {
            console.error('Error sending financial support request:', error);
            alert('Failed to send request. Please try again.');
        } finally {
            setLoading(false);
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

            {isFormOpen && (
                <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-4">Request Financial Support Session</h2>
                        <form onSubmit={handleRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Application</label>
                                {applications.length > 0 ? (
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
                                ) : (
                                    <p className="mt-2 text-sm text-gray-500">
                                        No applications found. Please add an application on your dashboard first.
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Group</label>
                                {userGroups.length > 0 ? (
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        required
                                    >
                                        <option value="">-- Select a group --</option>
                                        {userGroups.map(group => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-500">
                                        No groups found. You are not a member of any financial support groups.
                                    </p>
                                )}
                            </div>

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
                                disabled={loading || applications.length === 0 || userGroups.length === 0}
                            >
                                {loading ? 'Sending...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </Modal>
            )}

            {showHistoryModal && (
                <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)}>
                    <FinancialSupportHistory onClose={() => setShowHistoryModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default FinancialSupportCard;