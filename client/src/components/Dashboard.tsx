import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AddApplicationForm from './AddApplicationForm';
import ApplicationDetail from './ApplicationDetail';
import EditApplicationForm from './EditApplicationForm';
import type { Application } from '../types/Application';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import FeedbackForm from './FeedbackForm';
import ApplicationCard from './ApplicationCard';
import ApplicationStatusChart from './ApplicationStatusChart';
import { FaPlus, FaSpinner, FaChartPie, FaUserCircle, FaCalendarPlus, FaBell, FaCommentAlt } from 'react-icons/fa'; // FaSearch is removed
import type { UserProfile } from '../types/UserProfile';

const Dashboard: React.FC = () => {
    const { currentUser, userProfile } = useAuth();
    const typedUserProfile = userProfile as UserProfile | null;

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [receiveNotifications, setReceiveNotifications] = useState<boolean | null>(null);

    const statusColumns = ['Interested', 'Applying', 'Submitted', 'Accepted', 'Rejected'];

    // --- NEW: State for upcoming deadlines and milestone count ---
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<Application[]>([]);
    
    const fetchApplications = async () => {
        if (!currentUser) return;
        setLoading(true);
        setFetchError(null);
        try {
            const response = await axios.get<Application[]>(`http://localhost:5000/api/applications/${currentUser.uid}`);
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setFetchError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchApplications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // --- NEW: Effect to calculate upcoming deadlines ---
    useEffect(() => {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const upcoming = applications
            .filter(app => 
                app.deadline && new Date(app.deadline) > today && new Date(app.deadline) <= sevenDaysFromNow
            )
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        
        setUpcomingDeadlines(upcoming);
    }, [applications]);

    useEffect(() => {
        if (typedUserProfile && receiveNotifications === null) {
            setReceiveNotifications(typedUserProfile.receiveNotifications);
        }
    }, [typedUserProfile, receiveNotifications]);

    const handleApplicationUpdated = () => {
        fetchApplications();
        setSelectedApplication(null);
        setIsEditing(false);
    };
    
    const handleApplicationDeleted = (id: string) => {
        setApplications(applications.filter(app => app._id !== id));
        setSelectedApplication(null);
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const updatedApplication = applications.find(app => app._id === draggableId);
        if (!updatedApplication) return;

        const newStatus = destination.droppableId as Application['status'];

        const newApplications = applications.map(app => 
            app._id === draggableId ? { ...app, status: newStatus } : app
        );
        setApplications(newApplications);

        try {
            await axios.put(`http://localhost:5000/api/applications/${draggableId}`, {
                status: newStatus,
            });
        } catch (err) {
            console.error('Failed to update application status:', err);
            fetchApplications();
            alert('Failed to update application status. Please try again.');
        }
    };

    const applicationsByStatus = statusColumns.reduce((acc, status) => {
        acc[status] = applications.filter(app => app.status === status);
        return acc;
    }, {} as Record<string, Application[]>);

    const DashboardSkeleton = () => (
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 animate-pulse">
            {statusColumns.map((status) => (
                <div key={status} className="bg-neutral-200 rounded-2xl p-4 shadow-sm">
                    <div className="h-6 w-3/4 bg-neutral-300 rounded-md mb-4"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm mb-4 h-28"></div>
                    ))}
                </div>
            ))}
        </div>
    );

    const displayName = typedUserProfile?.firstName || currentUser?.email?.split('@')[0] || 'User';

    const handleToggleNotifications = async () => {
        if (!currentUser) return;

        const newSetting = !receiveNotifications;
        setReceiveNotifications(newSetting);

        try {
            await axios.put(`http://localhost:5000/api/users/${currentUser.uid}/notifications`, {
                receiveNotifications: newSetting,
            });
            console.log('Notification settings updated.');
        } catch (error) {
            console.error('Failed to update notification settings:', error);
            setReceiveNotifications(!newSetting);
            alert('Failed to update settings. Please try again.');
        }
    };
    
    const handleCalendarSync = () => {
        if (!currentUser) return;
        const icalUrl = `http://localhost:5000/api/applications/${currentUser.uid}/calendar`;
        
        alert(`Copy this URL to subscribe to your calendar feed:\n\n${icalUrl}\n\n1. Go to your Google/Outlook Calendar.\n2. Find the "Add Calendar" or "Subscribe from URL" option.\n3. Paste the URL. Changes will sync automatically.`);
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-lg text-gray-600">Please log in to view your dashboard.</p>
            </div>
        );
    }

    const getDaysUntil = (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            
            {/* Header */}
            <header className="sticky top-0 bg-white shadow-md z-20 py-20 pb-2">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left-aligned: Brand and Greeting */}
        <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-blue-600 whitespace-nowrap">
                Grad Tracker
            </h1>
            <span className="hidden md:block text-gray-500 font-medium text-lg">
                Hello, {displayName}! 👋
            </span>
        </div>

        {/* Right-aligned: Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
            <a
                href="http://localhost:5000/auth/google"
                className="bg-blue-500 text-white font-semibold py-2 px-3 sm:px-4 rounded-xl shadow-md hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base flex items-center justify-center whitespace-nowrap"
            >
                <span className="hidden sm:inline">Connect Gmail</span>
                <span className="sm:hidden">Gmail</span>
            </a>
            <button
                onClick={handleCalendarSync}
                className="bg-green-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-xl shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 text-sm sm:text-base whitespace-nowrap"
                title="Sync to Calendar"
            >
                <FaCalendarPlus />
                <span className="hidden sm:inline">Sync</span>
            </button>

            <Link to="/programs">
                <button className="bg-gray-100 text-gray-700 font-semibold py-2 px-3 sm:px-4 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base flex items-center space-x-1 whitespace-nowrap">
                    <span className="sm:hidden">
                        <FaPlus />
                    </span>
                    <span className="hidden sm:inline">Browse Programs</span>
                </button>
            </Link>

            <button
                onClick={() => setIsFeedbackOpen(true)}
                className="bg-purple-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-xl shadow-md hover:bg-purple-700 transition-colors duration-200 text-sm sm:text-base flex items-center space-x-1 whitespace-nowrap"
            >
                <span className="sm:hidden">
                    <FaCommentAlt />
                </span>
                <span className="hidden sm:inline">Feedback</span>
            </button>
        </div>
    </div>
</header>
            
            <main className="container mx-auto px-4 sm:px-6 py-10 sm:py-40">
                
                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-10 py-2">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in transition-all duration-300 transform hover:scale-[1.01]">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Application Progress</h2>
                            <FaChartPie size={24} className="text-blue-500" />
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center h-60 sm:h-80">
                                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                            </div>
                        ) : (
                            <ApplicationStatusChart applications={applications} />
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in transition-all duration-300 transform hover:scale-[1.01]">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Stats</h2>
                            <FaUserCircle size={24} className="text-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-center">
                            {statusColumns.map(status => (
                                <div key={status} className="p-4 bg-gray-100 rounded-lg transition-shadow duration-200 hover:shadow-md">
                                    <p className="text-sm font-medium text-gray-500 truncate">{status}</p>
                                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">
                                        {applicationsByStatus[status]?.length || 0}
                                    </p>
                                </div>
                            ))}
                            <div className="p-4 bg-blue-600 text-white rounded-lg transition-shadow duration-200 hover:shadow-lg col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1">
                                <p className="text-sm font-medium">Total</p>
                                <p className="text-2xl sm:text-3xl font-extrabold mt-2">
                                    {applications.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings Toggle */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-10 flex justify-between items-center animate-fade-in transition-all duration-300 transform hover:scale-[1.01]">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Email Notifications</h3>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">Receive email reminders for upcoming deadlines.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={!!receiveNotifications}
                                onChange={handleToggleNotifications}
                            />
                            <div className="block bg-gray-300 w-12 sm:w-14 h-7 sm:h-8 rounded-full"></div>
                            <div
                                className={`dot absolute left-1 top-1 bg-white w-5 sm:w-6 h-5 sm:h-6 rounded-full transition-transform duration-300 ${
                                    receiveNotifications ? 'transform translate-x-5 sm:translate-x-6 bg-blue-600' : ''
                                }`}
                            ></div>
                        </div>
                    </label>
                </div>
        
                {/* --- NEW: Upcoming Deadlines Section --- */}
                {upcomingDeadlines.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-10 animate-fade-in transition-all duration-300 transform hover:scale-[1.01]">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-red-600">
                                Upcoming Deadlines <FaBell className="inline ml-2 animate-bounce-slow" />
                            </h2>
                        </div>
                        <ul className="space-y-4">
                            {upcomingDeadlines.map(app => (
                                <li key={app._id} className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 transition-shadow duration-200 hover:shadow-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{app.schoolName}</p>
                                            <p className="text-sm text-gray-600 truncate">{app.programName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                Due in <span className="font-bold text-lg text-red-600">{getDaysUntil(app.deadline)}</span> days
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Kanban Board Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">My Applications</h2>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-blue-600 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                        >
                            <FaPlus />
                            <span>Add New</span>
                        </button>
                    </div>

                    {fetchError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4" role="alert">
                            <span className="block sm:inline">{fetchError}</span>
                        </div>
                    )}

                    {loading ? (
                        <DashboardSkeleton />
                    ) : (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <section className="flex flex-col md:flex-row md:space-x-6 overflow-x-auto pb-4 gap-6">
                                {statusColumns.map(status => (
                                    <Droppable key={status} droppableId={status}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-shrink-0 w-full md:w-80 bg-gray-100 rounded-2xl p-4 shadow-inner min-h-[250px] transition-all duration-200"
                                            >
                                                <h2 className="text-lg font-bold text-gray-700 mb-4 flex justify-between items-center">
                                                    <span>{status}</span>
                                                    <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                                        {applicationsByStatus[status].length}
                                                    </span>
                                                </h2>
                                                {applicationsByStatus[status].length > 0 ? (
                                                    applicationsByStatus[status].map((app, index) => (
                                                        <Draggable key={app._id} draggableId={app._id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <ApplicationCard
                                                                    application={app}
                                                                    onClick={() => setSelectedApplication(app)}
                                                                    isDragging={snapshot.isDragging}
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                />
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <div className="bg-white p-6 rounded-xl text-center text-gray-400 italic shadow-sm border border-gray-200">
                                                        <p className="mb-2">No applications here yet.</p>
                                                        <p>Drag and drop or add a new one.</p>
                                                    </div>
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                ))}
                            </section>
                        </DragDropContext>
                    )}
                </div>
            </main>
            
            {/* Modals */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                    <AddApplicationForm
                        onApplicationAdded={handleApplicationUpdated}
                        onClose={() => setIsFormOpen(false)}
                    />
                </div>
            )}
            {isFeedbackOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                    <FeedbackForm
                        onClose={() => setIsFeedbackOpen(false)}
                        onFeedbackSubmitted={() => setIsFeedbackOpen(false)}
                    />
                </div>
            )}
            {selectedApplication && !isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                    <ApplicationDetail
                        application={selectedApplication}
                        onClose={() => setSelectedApplication(null)}
                        onDelete={handleApplicationDeleted}
                        onEdit={() => setIsEditing(true)}
                        onApplicationUpdated={handleApplicationUpdated}
                    />
                </div>
            )}
            {selectedApplication && isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                    <EditApplicationForm
                        application={selectedApplication}
                        onApplicationUpdated={handleApplicationUpdated}
                        onClose={() => {
                            setIsEditing(false);
                            setSelectedApplication(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;