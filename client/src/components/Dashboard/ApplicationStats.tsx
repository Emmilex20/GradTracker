import React, { useState } from 'react';
import type { Application } from '../../types/Application';
import ApplicationStatusChart from '../ApplicationStatusChart';
import { FaSpinner, FaChartPie, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaHourglassHalf, FaLightbulb, FaExchangeAlt } from 'react-icons/fa';
import ApplicationListModal from '../ApplicationListModal';

interface ApplicationStatsProps {
    applications: Application[];
    applicationsByStatus: Record<string, Application[]>;
    statusColumns: string[];
    loading: boolean;
    onOpenTracker: () => void; // New prop for the button click
}

const statusIconMap: Record<string, React.ReactNode> = {
    'Interested': <FaLightbulb className="text-yellow-500" />,
    'Applying': <FaHourglassHalf className="text-blue-500" />,
    'Submitted': <FaPaperPlane className="text-indigo-500" />,
    'Accepted': <FaCheckCircle className="text-green-500" />,
    'Rejected': <FaTimesCircle className="text-red-500" />,
};

const ApplicationStats: React.FC<ApplicationStatsProps> = ({ applications, applicationsByStatus, statusColumns, loading, onOpenTracker }) => {
    const totalApplications = applications.length;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const getStatusCounts = () => {
        return statusColumns.map(status => ({
            status,
            count: applicationsByStatus[status]?.length || 0,
        }));
    };

    const handleCardClick = (status: string) => {
        if (applicationsByStatus[status]?.length > 0) {
            setSelectedStatus(status);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStatus(null);
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:mt-6 sm:gap-6 mb-6 sm:mb-10 animate-fade-in">
            {/* Main chart section (no changes) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 sm:p-6 py-8 sm:py-12 flex flex-col justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaChartPie className="mr-2 text-blue-500" />
                    Application Progress
                </h2>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <FaSpinner className="animate-spin text-3xl text-blue-600" />
                    </div>
                ) : totalApplications > 0 ? (
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                        <ApplicationStatusChart data={getStatusCounts()} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 italic text-center text-sm">
                        Add your first application to see your progress chart!
                    </div>
                )}
            </div>

            {/* Stats grid section */}
            <div className="col-span-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                    My Stats
                </h2>
                <div className="flex-1 grid grid-cols-2 gap-4 mt-2">
                    {statusColumns.map(status => (
                        <div
                            key={status}
                            className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleCardClick(status)}
                        >
                            <div className="text-xl mb-1">
                                {statusIconMap[status]}
                            </div>
                            <p className="text-3xl font-extrabold text-gray-800">
                                {applicationsByStatus[status]?.length || 0}
                            </p>
                            <p className="text-xs font-semibold text-gray-500 text-center mt-1">{status}</p>
                        </div>
                    ))}
                    <div className="col-span-full bg-blue-100 rounded-xl p-4 flex flex-col items-center justify-center shadow-md">
                        <p className="text-4xl font-extrabold text-blue-600">{totalApplications}</p>
                        <p className="text-base font-semibold text-blue-800 mt-2 text-center">Total Applications</p>
                    </div>
                </div>
                {/* New button to open the tracker modal */}
                <button
                    onClick={onOpenTracker}
                    className="w-full mt-4 bg-primary text-white font-semibold py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                    <FaExchangeAlt />
                    <span>Open Tracker Board</span>
                </button>
            </div>

            {isModalOpen && selectedStatus && (
                <ApplicationListModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    applications={applicationsByStatus[selectedStatus] || []}
                    status={selectedStatus}
                />
            )}
        </section>
    );
};

export default ApplicationStats;