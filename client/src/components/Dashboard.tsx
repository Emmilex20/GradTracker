import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import type { Application } from '../types/Application';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import ApplicationCard from './ApplicationCard';
import EmailTracker from './EmailTracker';
import DocumentReview from './DocumentReview';
import type { UserProfile } from '../types/UserProfile';
import { FaPlus, FaTimes, FaEnvelope, FaPaperclip, FaGraduationCap, FaLink, FaComments } from 'react-icons/fa';

import DashboardHeader from './Dashboard/DashboardHeader';
import ApplicationStats from './Dashboard/ApplicationStats';
import UpcomingDeadlines from './Dashboard/UpcomingDeadlines';
import MentorConnectionCard from './Dashboard/MentorConnectionCard';
import DashboardSkeleton from './Dashboard/DashboardSkeleton';
import ApplicationDetail from './ApplicationDetail';
import AddApplicationForm from './AddApplicationForm';
import EditApplicationForm from './EditApplicationForm';
import FeedbackForm from './FeedbackForm';
import ApplicationSearch from './ApplicationSearch';
import SOPRequestCard from './Dashboard/SOPRequestCard';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL;

interface MentorRequest {
    id: string;
    mentorId: string;
    mentorName: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

const Dashboard: React.FC = () => {
    const { currentUser, userProfile, token } = useAuth();
    const typedUserProfile = userProfile as UserProfile | null;
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<Application[]>([]);
    const [selectedApplicationForTabs, setSelectedApplicationForTabs] = useState<Application | null>(null);

    const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
    const [loadingMentorRequests, setLoadingMentorRequests] = useState(true);

    const detailsSectionRef = useRef<HTMLDivElement>(null);
    const statusColumns = ['Interested', 'Submitted', 'Accepted', 'Rejected'];

    const fetchApplications = useCallback(async () => {
        if (!currentUser || !token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError(null);
        try {
            const response = await axios.get<Application[]>(`${API_URL}/applications/${currentUser.uid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(response.data);
            if (response.data.length > 0) {
                setSelectedApplicationForTabs(response.data[0]);
            } else {
                setSelectedApplicationForTabs(null);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            setFetchError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentUser, token]);

    const fetchMentorRequests = useCallback(async () => {
        if (!token) return;
        setLoadingMentorRequests(true);
        try {
            const response = await axios.get<MentorRequest[]>(`${API_URL}/mentee/requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMentorRequests(response.data);
        } catch (error) {
            console.error('Error fetching mentee requests:', error);
        } finally {
            setLoadingMentorRequests(false);
        }
    }, [token]);

    const handleRequestSOPWriting = async (applicationId: string) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "sop_requests"), {
                applicationId,
                userId: currentUser.uid,
                status: 'pending',
                timestamp: new Date().toISOString()
            });

            alert('SOP Live Writing request has been sent! An admin will be notified.');

        } catch (error) {
            console.error('Error sending SOP request:', error);
            alert('Failed to send SOP request. Please try again.');
        }
    };

    useEffect(() => {
        if (currentUser && token) {
            fetchApplications();
            fetchMentorRequests();
        }
    }, [currentUser, token, fetchApplications, fetchMentorRequests]);

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
        if (!updatedApplication || !token) return;
        const newStatus = destination.droppableId as Application['status'];
        const newApplications = applications.map(app =>
            app._id === draggableId ? { ...app, status: newStatus } : app
        );
        setApplications(newApplications);
        try {
            await axios.put(`${API_URL}/applications/${draggableId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
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

    const displayName = typedUserProfile?.firstName || currentUser?.email?.split('@')[0] || 'User';

    const handleCalendarSync = () => {
        if (!currentUser) return;
        const icalUrl = `${API_URL}/applications/${currentUser.uid}/calendar`;
        alert(`Copy this URL to subscribe to your calendar feed:\n\n${icalUrl}\n\n1. Go to your Google/Outlook Calendar.\n2. Find the "Add Calendar" or "Subscribe from URL" option.\n3. Paste the URL. Changes will sync automatically.`);
    };

    const handleSendMentorRequest = async (mentorId: string) => {
        if (!token) return;
        try {
            await axios.post(`${API_URL}/mentors/request`, { mentorId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchMentorRequests(); 
        } catch (error) {
            console.error('Error sending mentor request:', error);
            alert('An error occurred while sending the request.');
        }
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-light">
                <p className="text-lg text-secondary">Please log in to view your dashboard.</p>
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

    const handleViewDetailsModal = (application: Application) => {
        setSelectedApplication(application);
    };

    const handleViewDashboardSections = (application: Application) => {
        setSelectedApplicationForTabs(application);
        setTimeout(() => {
            if (detailsSectionRef.current) {
                detailsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <div className="min-h-screen bg-neutral-light font-sans text-secondary">
            <main className="container mx-auto px-4 sm:px-6 py-10 pt-32">
                <DashboardHeader
                    displayName={displayName}
                    handleCalendarSync={handleCalendarSync}
                    setIsFeedbackOpen={setIsFeedbackOpen}
                />
                
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
                    <ApplicationSearch />
                </div>
                
                <ApplicationStats
                    applications={applications}
                    applicationsByStatus={applicationsByStatus}
                    statusColumns={statusColumns}
                    loading={loading}
                />

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-2 sm:mb-0">My Applications</h2>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
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
                            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4">
                                {statusColumns.map(status => (
                                    <Droppable key={status} droppableId={status}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-shrink-0 w-full bg-neutral-light rounded-2xl p-4 shadow-inner min-h-[250px] transition-all duration-200"
                                            >
                                                <h2 className="text-lg font-bold text-secondary mb-4 flex justify-between items-center">
                                                    <span>{status}</span>
                                                    <span className="text-sm font-medium text-neutral-dark bg-neutral-200 px-2 py-1 rounded-full">
                                                        {applicationsByStatus[status].length}
                                                    </span>
                                                </h2>
                                                {applicationsByStatus[status].length > 0 ? (
                                                    applicationsByStatus[status].map((app, index) => (
                                                        <Draggable key={app._id} draggableId={app._id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <ApplicationCard
                                                                    application={app}
                                                                    onViewDetailsModal={handleViewDetailsModal}
                                                                    onViewDashboardSections={handleViewDashboardSections}
                                                                    isDragging={snapshot.isDragging}
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                />
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <div className="bg-white p-6 rounded-xl text-center text-neutral-dark italic shadow-sm border border-neutral-300">
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

                <div ref={detailsSectionRef} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 sm:mt-10">
                    {applications.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-secondary">
                                    Application Details: <span className="text-primary">{selectedApplicationForTabs?.schoolName}</span>
                                </h2>
                                <button
                                    onClick={() => setSelectedApplicationForTabs(null)}
                                    className="text-neutral-dark hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-neutral-100"
                                    title="Close Details"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                <div className="bg-neutral-light rounded-xl p-4 sm:p-6 shadow-inner">
                                    <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
                                        <FaEnvelope className="mr-2 text-primary" />
                                        Email Tracker
                                    </h3>
                                    {selectedApplicationForTabs ? (
                                        <EmailTracker
                                            application={selectedApplicationForTabs}
                                            onEmailAdded={fetchApplications}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-48 text-neutral-dark italic">
                                            Select an application above to view its details.
                                        </div>
                                    )}
                                </div>
                                <div className="bg-neutral-light rounded-xl p-4 sm:p-6 shadow-inner">
                                    <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
                                        <FaPaperclip className="mr-2 text-primary" />
                                        Document Storage and Reviews
                                    </h3>
                                    {selectedApplicationForTabs ? (
                                        <DocumentReview
                                            application={selectedApplicationForTabs}
                                            onDocumentUpdated={fetchApplications}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-48 text-neutral-dark italic">
                                            Select an application above to view its details.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8 mb-6 text-neutral-dark">
                            <h3 className="text-xl font-bold mb-2">No Applications Added Yet</h3>
                            <p className="mb-4">Add your first application using the "Add New" button above to get started!</p>
                        </div>
                    )}
                </div>

                {/* Updated SOP Live Writing Section */}
                <SOPRequestCard
                    applications={applications}
                    onRequestSOPWriting={handleRequestSOPWriting}
                    currentUserUid={currentUser.uid} 
                />
                
                {upcomingDeadlines.length > 0 && (
                    <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} getDaysUntil={getDaysUntil} />
                )}
                
                <MentorConnectionCard
                    currentRequests={mentorRequests}
                    loadingRequests={loadingMentorRequests}
                    onSendRequest={handleSendMentorRequest}
                />

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                        <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
                            <FaLink className="mr-2 text-primary" /> Application Resources & Blog
                        </h3>
                        <p className="text-neutral-dark mt-1 text-sm sm:text-base">
                            Access guides, tips, and articles to help you ace your applications.
                        </p>
                    </div>
                    <a
                        href="/resources"
                        className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                    >
                        <span>Explore Resources</span>
                        <FaGraduationCap />
                    </a>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                        <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
                            <FaComments className="mr-2 text-primary" /> Connect With Other Applicants
                        </h3>
                        <p className="text-neutral-dark mt-1 text-sm sm:text-base">
                            Join forums and groups to share experiences and get support from peers.
                        </p>
                    </div>
                    <a
                        href="/community"
                        className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                    >
                        <span>Join the Community</span>
                        <FaComments />
                    </a>
                </div>

            </main>
            
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
                        <AddApplicationForm
                            onApplicationAdded={handleApplicationUpdated}
                            onClose={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}
            {isFeedbackOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
                        <FeedbackForm
                            onClose={() => setIsFeedbackOpen(false)}
                            onFeedbackSubmitted={() => setIsFeedbackOpen(false)}
                        />
                    </div>
                </div>
            )}
            {selectedApplication && !isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
                        <ApplicationDetail
                            application={selectedApplication}
                            onClose={() => setSelectedApplication(null)}
                            onDelete={handleApplicationDeleted}
                            onEdit={() => setIsEditing(true)}
                            onApplicationUpdated={handleApplicationUpdated}
                        />
                    </div>
                </div>
            )}
            {selectedApplication && isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
                        <EditApplicationForm
                            application={selectedApplication}
                            onApplicationUpdated={handleApplicationUpdated}
                            onClose={() => {
                                setIsEditing(false);
                                setSelectedApplication(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;