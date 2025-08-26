import React, { useState } from 'react';
import { FaDollarSign, FaHistory, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import Modal from '../Modal';
import FinancialSupportHistory from './FinancialSupportHistory';
import { toast } from 'react-toastify';
import SuccessToast from '../common/Toasts/SuccessToast';
import ErrorToast from '../common/Toasts/ErrorToast';
import ConfirmationModal from '../common/ConfirmationModal';
import type { Application } from '../../types/Application'; // Import the Application type

// The Group type definition is now imported or defined here
interface Group {
    id: string;
    name: string;
}

interface FinancialSupportCardProps {
    applications: Application[]; // Use the imported Application type
    userGroups: Group[];
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
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedApplicationData, setSelectedApplicationData] = useState<Application | null>(null);

    const isFormValid = selectedApplicationId !== '' && requestedAmount !== '';

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        // Reset form state on close
        setSelectedApplicationId('');
        setNotes('');
        setRequestedAmount('');
        setSelectedGroupId('');
        setSelectedApplicationData(null);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error(<ErrorToast message="Please fill in all required fields." />);
            return;
        }

        if (!currentUser) {
            toast.error(<ErrorToast message="Authentication error. Please log in again." />);
            return;
        }

        // Use 'app._id' to find the application, as defined in your type
        const selectedApp = applications.find(app => app._id === selectedApplicationId);
        
        // Console Log #1: Before opening the modal
        console.log("handleFormSubmit: selectedApplicationId:", selectedApplicationId);
        console.log("handleFormSubmit: selectedApp found?", !!selectedApp);

        if (!selectedApp) {
            toast.error(<ErrorToast message="Selected application not found. Please try again or refresh the page." />);
            return;
        }

        setSelectedApplicationData(selectedApp);
        setIsConfirmOpen(true);
    };

    const confirmRequest = async () => {
        // Console Log #2: At the start of the confirmation function
        console.log("confirmRequest: selectedApplicationId:", selectedApplicationId);
        console.log("confirmRequest: selectedApplicationData:", selectedApplicationData);

        setIsConfirmOpen(false);
        setLoading(true);

        if (!currentUser || !selectedApplicationData) {
            toast.error(<ErrorToast message="An unexpected error occurred. Please try again." />);
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "financial_support_requests"), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                applicationId: selectedApplicationData._id, // Use '_id' here
                universityName: selectedApplicationData.schoolName || '',
                requestedAmount: parseFloat(requestedAmount),
                notes,
                groupId: selectedGroupId,
                status: 'pending',
                requestedAt: Timestamp.now(),
            });

            toast.success(<SuccessToast message="Financial support request sent successfully!" />);
            handleCloseForm();
        } catch (error) {
            console.error('Error sending financial support request:', error);
            toast.error(<ErrorToast message="Failed to send request. Please try again." />);
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
                    onClick={handleOpenForm}
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
                <Modal isOpen={isFormOpen} onClose={handleCloseForm}>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-4">Request Financial Support Session</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
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
                                            <option key={app._id} value={app._id}>
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
                                <label className="block text-sm font-medium text-gray-700">Select Group (Optional)</label>
                                {userGroups.length > 0 ? (
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                                        You are not a member of any financial support groups.
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
                                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                disabled={loading || !isFormValid}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <span>Submit Request</span>
                                )}
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

            {isConfirmOpen && (
                <ConfirmationModal
                isOpen={isConfirmOpen} // Add this line
                message="Are you sure you want to submit this financial support request? A mentor will be notified."
                onConfirm={confirmRequest}
                onCancel={() => setIsConfirmOpen(false)}
                title="Confirm Request"
                confirmButtonText="Submit Request"
                />
            )}
        </div>
    );
};

export default FinancialSupportCard;