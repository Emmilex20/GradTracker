// src/types/AcademicCVRequest.ts
export interface AcademicCVRequest {
    id: string;
    status: 'pending' | 'scheduled' | 'completed' | 'none';
    scheduledDate?: string;
    scheduledTime?: string;
    zoomLink?: string;
    correctedCvUrl?: string;
}