import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaEye, FaSpinner } from 'react-icons/fa';
import AcademicCVUploadModal from './AcademicCVUploadModal';
import { useAuth } from '../../context/AuthContext';

// Use the environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

interface CVRequest {
  id: string;
  userId: string;
  userEmail: string;
  cvUrl: string;
  status: 'pending' | 'review_complete';
  createdAt: string;
}

const AdminAcademicCVService: React.FC = () => {
  const { token } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<CVRequest[]>([]);
  const [reviewedRequests, setReviewedRequests] = useState<CVRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CVRequest | null>(null);

  const fetchCVRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // ** CORRECTED URL HERE **
      const response = await axios.get(`${API_URL}/admin/cv-service/all-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        const pending = response.data.filter(req => req.status === 'pending');
        const completed = response.data.filter(req => req.status === 'review_complete');
        
        setPendingRequests(pending);
        setReviewedRequests(completed);
      } else {
        console.error('API response for all reviews is not an array:', response.data);
        setPendingRequests([]);
        setReviewedRequests([]);
      }
    } catch (err) {
      console.error('Error fetching CV requests:', err);
      setError('Failed to load CV requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCVRequests();
    } else {
      setLoading(false);
      setError('Authentication token not found. Please log in.');
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleReviewClick = (request: CVRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    fetchCVRequests();
  };

  if (loading) return <div className="text-center py-4"><FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto" /></div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending CV Reviews</h2>
      {pendingRequests.length === 0 ? (
        <p className="text-gray-500">No pending CV review requests at this time.</p>
      ) : (
        <ul className="space-y-4">
          {pendingRequests.map((request) => (
            <li key={request.id} className="bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Request from {request.userEmail}</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Submitted:</span> {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex space-x-2">
                <a
                  href={request.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm flex items-center"
                >
                  <FaEye className="mr-2" /> View CV
                </a>
                <button
                  onClick={() => handleReviewClick(request)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center"
                >
                  <FaUpload className="mr-2" /> Upload Review
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {reviewedRequests.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Completed CV Reviews</h2>
          <ul className="space-y-4">
            {reviewedRequests.map((request) => (
              <li key={request.id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Review for {request.userEmail}</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Status:</span> Review Complete
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedRequest && (
        <AcademicCVUploadModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          requestId={selectedRequest.id}
        />
      )}
    </div>
  );
};

export default AdminAcademicCVService;