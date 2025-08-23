import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import type { Application } from '../types/Application';
import type { DropResult } from '@hello-pangea/dnd';
import DocumentReview from './DocumentReview';
import type { UserProfile } from '../types/UserProfile';
import { FaTimes, FaPaperclip, FaGraduationCap, FaLink, FaComments, FaCalendarAlt, FaHistory } from 'react-icons/fa';

import DashboardHeader from './Dashboard/DashboardHeader';
import ApplicationStats from './Dashboard/ApplicationStats';
import UpcomingDeadlines from './Dashboard/UpcomingDeadlines';
import MentorConnectionCard from './Dashboard/MentorConnectionCard';
import ApplicationDetail from './ApplicationDetail';
import AddApplicationForm from './AddApplicationForm';
import EditApplicationForm from './EditApplicationForm';
import FeedbackForm from './FeedbackForm';
import ApplicationSearch from './ApplicationSearch';
import SOPRequestCard from './Dashboard/SOPRequestCard';
import ProjectsCard from './Dashboard/ProjectsCard';
import JoinProjectsModal from './JoinProjectsModal';
import ApplicationTrackerModal from './ApplicationTrackerModal';
import AIPredictor from './AIPredictor';
import InterviewPrepForm from './InterviewPrepForm';
import InterviewPrepHistory from './Dashboard/InterviewPrepHistory'; 
import VisaInterviewPrepForm from './VisaInterviewPrepForm';
import VisaInterviewHistory from './Dashboard/VisaInterviewHistory';
import Modal from './Modal';
import { fetchMyGroups } from '../services/groupService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../firebase';

// Services & Models
import FinancialSupportCard from './Dashboard/FinancialSupportCard';
import type { Group } from '../types/Group';
import AcademicCVServiceCard from './Dashboard/AcademicCVServiceCard';
import AcademicCVRequestModal from './AcademicCVRequestModal';

const API_URL = import.meta.env.VITE_API_URL;

interface MentorRequest {
    id: string;
    mentorId: string;
    mentorName: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

// Corrected type for the Academic CV request data to match the card component
interface AcademicCVRequest {
    id: string;
    status: 'pending' | 'scheduled' | 'completed' | 'none';
    scheduledDate?: string;
    scheduledTime?: string;
    zoomLink?: string;
    correctedCvUrl?: string;
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
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<Application[]>([]);
    const [selectedApplicationForTabs, setSelectedApplicationForTabs] = useState<Application | null>(null);
    const [userGroups, setUserGroups] = useState<Group[]>([]);

    const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
    const [loadingMentorRequests, setLoadingMentorRequests] = useState(true);

    const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
    const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
    
    const [isInterviewPrepFormOpen, setIsInterviewPrepFormOpen] = useState(false);
    const [showInterviewPrepHistoryModal, setShowInterviewPrepHistoryModal] = useState(false);

    const [isVisaPrepFormOpen, setIsVisaPrepFormOpen] = useState(false);
    const [showVisaPrepHistoryModal, setShowVisaPrepHistoryModal] = useState(false);
    
    // NEW STATE FOR ACADEMIC CV SERVICE
    const [isCVServiceModalOpen, setIsCVServiceModalOpen] = useState(false);
    const [cvRequest, setCvRequest] = useState<AcademicCVRequest | null>(null);

    const detailsSectionRef = useRef<HTMLDivElement>(null);
    const statusColumns = ['Interested', 'Submitted', 'Accepted', 'Rejected'];

    const fetchApplications = useCallback(async () => {
        if (!currentUser || !token) {
            setLoading(false);
            return;
        }
        setLoading(true);
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
    
    const fetchUserGroups = useCallback(async () => {
        if (!currentUser || !token) return;
        try {
            const groups = await fetchMyGroups(currentUser.uid, token);
            setUserGroups(groups);
        } catch (error) {
            console.error('Error fetching user groups:', error);
        }
    }, [currentUser, token]);
    
    // UPDATED FUNCTION TO FETCH ACADEMIC CV REQUEST
    const fetchCVRequest = useCallback(async () => {
        if (!currentUser || !token) return;
        try {
            const response = await axios.get(`${API_URL}/cv-service/my-request`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const backendData = response.data;

            if (backendData.status === 'none') {
                setCvRequest(null);
            } else {
                // Map the status and include all relevant data
                const status = backendData.status === 'review_complete' ? 'completed' : backendData.status;

                setCvRequest({
                    id: backendData.id,
                    status: status,
                    scheduledDate: backendData.scheduledDate,
                    scheduledTime: backendData.scheduledTime,
                    zoomLink: backendData.zoomLink,
                    correctedCvUrl: backendData.correctedCvUrl
                });
            }
        } catch (error) {
            console.error('Error fetching CV request:', error);
            setCvRequest(null);
        }
    }, [currentUser, token]);

    const handleRequestSOPWriting = async (applicationId: string) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "sop_requests"), {
                applicationId,
                userId: currentUser.uid,
                status: 'pending',
                timestamp: new Date().toISOString()
            });
            toast.success('SOP Live Writing request has been sent! An admin will be notified.');
        } catch (error) {
            console.error('Error sending SOP request:', error);
            toast.error('Failed to send SOP request. Please try again.');
        }
    };

    const handleInterviewRequestSent = () => {
        setIsInterviewPrepFormOpen(false);
        toast.success('Interview preparation request sent successfully! We will be in touch shortly.');
    };
    
    const handleVisaRequestSent = () => {
        setIsVisaPrepFormOpen(false);
        toast.success('Visa preparation request sent successfully! We will be in touch shortly.');
    };

    // Corrected HANDLER FOR ACADEMIC CV SERVICE - Uploading file
    const handleCVUpload = async (file: File) => {
        if (!currentUser || !token) {
            toast.error('You must be logged in to submit a request.');
            throw new Error('User not authenticated.');
        }

        const formData = new FormData();
        formData.append('cvFile', file);

        try {
            await axios.post(`${API_URL}/cv-service/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Your CV has been uploaded and submitted for review!');
            setIsCVServiceModalOpen(false);
            fetchCVRequest(); // Refresh the status to show "pending"
        } catch (error: unknown) {
            console.error('Failed to upload CV file:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    toast.error('You already have a pending CV review request.');
                } else {
                    toast.error('Failed to upload file. Please try again.');
                }
            } else {
                toast.error('An unexpected error occurred during file upload.');
            }
            throw error; // Re-throw to trigger the modal's error state
        }
    };

    // Corrected HANDLER for new CV request with notes
    const handleNewCVRequest = async (data: { notes: string }) => {
        if (!currentUser || !token) {
            toast.error('You must be logged in to submit a request.');
            throw new Error('User not authenticated.');
        }

        try {
            await axios.post(`${API_URL}/cv-service/new-request`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Your new CV request has been submitted successfully!');
            setIsCVServiceModalOpen(false);
            fetchCVRequest();
        } catch (error: unknown) {
            console.error('Failed to submit new CV request:', error);
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                toast.error('You already have a pending CV review request.');
            } else {
                toast.error('Failed to submit request. Please try again.');
            }
            throw error;
        }
    };

    useEffect(() => {
        if (currentUser && token) {
            fetchApplications();
            fetchMentorRequests();
            fetchUserGroups();
            fetchCVRequest(); // Fetch CV request data on mount
        }
    }, [currentUser, token, fetchApplications, fetchMentorRequests, fetchUserGroups, fetchCVRequest]);

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
            toast.error('Failed to update application status. Please try again.');
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
            toast.error('An error occurred while sending the request.');
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

    const handleViewDetailsFromTracker = (application: Application) => {
        setIsTrackerModalOpen(false);
        setSelectedApplication(application);
    };

    const handleViewDashboardSections = (application: Application) => {
        setIsTrackerModalOpen(false);
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
                    onOpenTracker={() => setIsTrackerModalOpen(true)}
                />

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
                            
                            <div className="tab-content">
                                {selectedApplicationForTabs ? (
                                    <div className="bg-neutral-light rounded-xl p-4 sm:p-6 shadow-inner">
                                        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
                                            <FaPaperclip className="mr-2 text-primary" />
                                            Document Storage and Reviews
                                        </h3>
                                        <DocumentReview
                                            application={selectedApplicationForTabs}
                                            onDocumentUpdated={handleApplicationUpdated}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-48 text-neutral-dark italic">
                                        Select an application above to view its details.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8 mb-6 text-neutral-dark">
                            <h3 className="text-xl font-bold mb-2">No Applications Added Yet</h3>
                            <p className="mb-4">Add your first application using the "Add New" button above to get started!</p>
                        </div>
                    )}
                </div>

                <SOPRequestCard
                    applications={applications}
                    onRequestSOPWriting={handleRequestSOPWriting}
                    currentUserUid={currentUser.uid}
                />

                {/* Academic CV Service Card */}
                <AcademicCVServiceCard 
                    onRequestCVService={() => setIsCVServiceModalOpen(true)} 
                    requestStatus={cvRequest?.status || 'none'}
                    scheduledDate={cvRequest?.scheduledDate}
                    scheduledTime={cvRequest?.scheduledTime}
                    zoomLink={cvRequest?.zoomLink}
                    downloadUrl={cvRequest?.correctedCvUrl}
                />

                {/* Admission Interview Prep Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                        <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
                            <FaGraduationCap className="mr-2 text-primary" /> Admission Interview Preparation
                        </h3>
                        <p className="text-neutral-dark mt-1 text-sm sm:text-base">
                            Request one-on-one sessions for your university admission interviews.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <button
                            onClick={() => setIsInterviewPrepFormOpen(true)}
                            className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 w-full"
                        >
                            <span>Request Session</span>
                            <FaCalendarAlt />
                        </button>
                        <button
                            onClick={() => setShowInterviewPrepHistoryModal(true)}
                            className="bg-gray-200 text-secondary font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 w-full"
                        >
                            <span>View History</span>
                            <FaHistory />
                        </button>
                    </div>
                </div>

                {/* Visa Interview Prep Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                        <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
                            <FaLink className="mr-2 text-primary" /> Visa Interview Preparation
                        </h3>
                        <p className="text-neutral-dark mt-1 text-sm sm:text-base">
                            Request one-on-one sessions to prepare for your visa interview.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <button
                            onClick={() => setIsVisaPrepFormOpen(true)}
                            className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 w-full"
                        >
                            <span>Request Visa Session</span>
                            <FaCalendarAlt />
                        </button>
                        <button
                            onClick={() => setShowVisaPrepHistoryModal(true)}
                            className="bg-gray-200 text-secondary font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 w-full"
                        >
                            <span>View History</span>
                            <FaHistory />
                        </button>
                    </div>
                </div>

                {/* Financial Support Card */}
                <FinancialSupportCard applications={applications} userGroups={userGroups} />

                <AIPredictor 
                    applications={applications}
                />

                {upcomingDeadlines.length > 0 && (
                    <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} getDaysUntil={getDaysUntil} />
                )}

                <MentorConnectionCard
                    currentRequests={mentorRequests}
                    loadingRequests={loadingMentorRequests}
                    onSendRequest={handleSendMentorRequest}
                />

                <ProjectsCard onJoinProjects={() => setIsProjectsModalOpen(true)} />

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
                <ApplicationDetail
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onDelete={handleApplicationDeleted}
                    onEdit={() => setIsEditing(true)}
                    onApplicationUpdated={handleApplicationUpdated}
                />
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
            {isProjectsModalOpen && (
                <JoinProjectsModal
                    onClose={() => setIsProjectsModalOpen(false)}
                />
            )}
            {isInterviewPrepFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <InterviewPrepForm
                        applications={applications}
                        onClose={() => setIsInterviewPrepFormOpen(false)}
                        onInterviewRequestSent={handleInterviewRequestSent}
                    />
                </div>
            )}
            
            {/* Admission Interview History Modal - Corrected */}
            {showInterviewPrepHistoryModal && (
                <Modal 
                    isOpen={showInterviewPrepHistoryModal}
                    onClose={() => setShowInterviewPrepHistoryModal(false)}
                >
                    <InterviewPrepHistory onClose={() => setShowInterviewPrepHistoryModal(false)} />
                </Modal>
            )}

            {/* Visa Interview Prep Form Modal */}
            {isVisaPrepFormOpen && (
                <VisaInterviewPrepForm
                    onClose={() => setIsVisaPrepFormOpen(false)}
                    onVisaRequestSent={handleVisaRequestSent}
                />
            )}

            {/* Visa Interview History Modal - Corrected */}
            {showVisaPrepHistoryModal && (
                <Modal 
                    isOpen={showVisaPrepHistoryModal}
                    onClose={() => setShowVisaPrepHistoryModal(false)}
                >
                    <VisaInterviewHistory onClose={() => setShowVisaPrepHistoryModal(false)} />
                </Modal>
            )}

            <ApplicationTrackerModal
                isOpen={isTrackerModalOpen}
                onClose={() => setIsTrackerModalOpen(false)}
                applications={applications}
                onApplicationStatusChange={onDragEnd}
                onViewDetailsModal={handleViewDetailsFromTracker}
                onViewDashboardSections={handleViewDashboardSections}
            />

            {/* Academic CV Service Modal - Corrected */}
            <AcademicCVRequestModal
                isOpen={isCVServiceModalOpen}
                onClose={() => setIsCVServiceModalOpen(false)}
                onUpload={handleCVUpload}
                onNewRequest={handleNewCVRequest}
            />

            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default Dashboard;