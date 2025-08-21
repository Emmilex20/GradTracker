// src/components/ApplicationTrackerModal.tsx

import React from 'react';
import type { Application } from '../types/Application';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { FaTimes } from 'react-icons/fa';
import ApplicationCard from './ApplicationCard';

interface ApplicationTrackerModalProps {
    isOpen: boolean;
    onClose: () => void;
    applications: Application[];
    onApplicationStatusChange: (result: DropResult) => void;
    onViewDetailsModal: (application: Application) => void;
    onViewDashboardSections: (application: Application) => void;
}

const statusColumns = ['Interested', 'Submitted', 'Accepted', 'Rejected'];

const ApplicationTrackerModal: React.FC<ApplicationTrackerModalProps> = ({
    isOpen,
    onClose,
    applications,
    onApplicationStatusChange,
    onViewDetailsModal,
    onViewDashboardSections,
}) => {
    if (!isOpen) {
        return null;
    }

    const applicationsByStatus = statusColumns.reduce((acc, status) => {
        acc[status] = applications.filter(app => app.status === status);
        return acc;
    }, {} as Record<string, Application[]>);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-7xl h-[90vh] bg-neutral-light rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    <FaTimes className="text-2xl" />
                </button>
                <h2 className="text-2xl font-bold text-secondary mb-6">Application Tracker Board</h2>
                
                <DragDropContext onDragEnd={onApplicationStatusChange}>
                    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4 h-full">
                        {statusColumns.map(status => (
                            <Droppable key={status} droppableId={status}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex-shrink-0 w-full bg-white rounded-2xl p-4 shadow-inner min-h-[250px] transition-all duration-200"
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
                                                            onViewDetailsModal={onViewDetailsModal}
                                                            onViewDashboardSections={onViewDashboardSections}
                                                            isDragging={snapshot.isDragging}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        />
                                                    )}
                                                </Draggable>
                                            ))
                                        ) : (
                                            <div className="bg-neutral-light p-6 rounded-xl text-center text-neutral-dark italic shadow-sm border border-neutral-300">
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
            </div>
        </div>
    );
};

export default ApplicationTrackerModal;