// src/components/Dashboard/DocumentReviewServices.tsx
import React from 'react';
import SOPRequestCard from './SOPRequestCard';
import AcademicCVServiceCard from './AcademicCVServiceCard';
import type { Application } from '../../types/Application';
import type { AcademicCVRequest } from '../../types/AcademicCVRequest';

interface DocumentReviewServicesProps {
    applications: Application[];
    onRequestSOPWriting: (applicationId: string) => void;
    currentUserUid: string;
    onRequestCVService: () => void;
    cvRequest: AcademicCVRequest | null;
}

const DocumentReviewServices: React.FC<DocumentReviewServicesProps> = ({
    applications,
    onRequestSOPWriting,
    currentUserUid,
    onRequestCVService,
    cvRequest,
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-6">
                📄 Document Review & Writing Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOP Live Writing Card */}
                <SOPRequestCard
                    applications={applications}
                    onRequestSOPWriting={onRequestSOPWriting}
                    currentUserUid={currentUserUid}
                />

                {/* Academic CV Service Card */}
                <AcademicCVServiceCard
                    onRequestCVService={onRequestCVService}
                    requestStatus={cvRequest?.status || 'none'}
                    scheduledDate={cvRequest?.scheduledDate}
                    scheduledTime={cvRequest?.scheduledTime}
                    zoomLink={cvRequest?.zoomLink}
                    downloadUrl={cvRequest?.correctedCvUrl}
                />
            </div>
        </div>
    );
};

export default DocumentReviewServices;