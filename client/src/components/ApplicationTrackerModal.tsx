// src/components/ApplicationTrackerModal.tsx

import React from 'react';
import type { Application } from '../types/Application';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { FaTimes, FaPlus } from 'react-icons/fa';
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
            <div className="relative w-full max-w-7xl h-[90vh] bg-neutral-light rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
                    aria-label="Close modal"
                >
                    <FaTimes className="text-2xl" />
                </button>
                <h2 className="text-3xl font-bold text-secondary mb-8">Application Tracker Board</h2>
                
                <DragDropContext onDragEnd={onApplicationStatusChange}>
                    <section className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 custom-scrollbar">
                        {statusColumns.map(status => (
                            <Droppable key={status} droppableId={status}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-shrink-0 w-80 sm:w-auto bg-gray-100 rounded-2xl p-4 shadow-md transition-all duration-300
                                                    ${snapshot.isDraggingOver ? 'bg-indigo-100 scale-[1.01] shadow-xl' : ''}`}
                                    >
                                        <h2 className="text-lg font-bold text-secondary mb-4 flex justify-between items-center border-b pb-2 border-gray-300">
                                            <span className="capitalize">{status}</span>
                                            <span className="text-sm font-medium text-neutral-dark bg-neutral-200 px-2 py-1 rounded-full">
                                                {applicationsByStatus[status].length}
                                            </span>
                                        </h2>
                                        <div className="flex flex-col gap-3 min-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
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
                                                                draggableProps={provided.draggableProps}
                                                                dragHandleProps={provided.dragHandleProps}
                                                            />
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <div className={`bg-white p-6 rounded-xl text-center text-neutral-dark italic shadow-sm border border-neutral-300 transition-all duration-300
                                                                 ${snapshot.isDraggingOver ? 'animate-pulse' : ''}`}>
                                                    <FaPlus className="text-2xl text-gray-400 mx-auto mb-2" />
                                                    <p className="mb-1 text-sm">No applications here.</p>
                                                    <p className="text-xs">Drop a card here to get started.</p>
                                                </div>
                                            )}
                                            {provided.placeholder}
                                        </div>
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