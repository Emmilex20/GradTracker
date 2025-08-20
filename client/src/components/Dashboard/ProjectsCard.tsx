// frontend/src/components/Dashboard/ProjectsCard.tsx

import React from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';

interface ProjectsCardProps {
  onJoinProjects: () => void;
}

const ProjectsCard: React.FC<ProjectsCardProps> = ({ onJoinProjects }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
      <div className="text-center sm:text-left mb-4 sm:mb-0">
        <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
          <FaUsers className="mr-2 text-primary" /> Join Ongoing Projects
        </h3>
        <p className="text-neutral-dark mt-1 text-sm sm:text-base">
          Collaborate with other applicants on group projects.
        </p>
      </div>
      <button
        onClick={onJoinProjects}
        className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
      >
        <span>Explore Projects</span>
        <FaPlus />
      </button>
    </div>
  );
};

export default ProjectsCard;