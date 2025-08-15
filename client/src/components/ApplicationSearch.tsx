// src/components/ApplicationSearch.tsx

import React from 'react';
import { FaSearch, FaFlask, FaLaptopCode, FaChartBar, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const categories = [
    { name: 'Data Science', icon: <FaChartBar />, link: '/programs?category=data-science' },
    { name: 'Computer Science', icon: <FaLaptopCode />, link: '/programs?category=computer-science' },
    { name: 'Biomedical Science', icon: <FaFlask />, link: '/programs?category=biomedical-science' },
    { name: 'All Programs', icon: <FaGraduationCap />, link: '/programs' },
];

const ApplicationSearch: React.FC = () => {
    return (
        <div className="flex flex-col items-center w-full mb-8 space-y-6">
            {/* Main Search Bar */}
            <div className="w-full max-w-2xl relative group">
                <Link
                    to="/programs"
                    className="flex items-center justify-center py-5 px-6 rounded-3xl bg-white text-secondary font-display font-semibold text-lg border-2 border-transparent transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/50 focus:ring-offset-2"
                    aria-label="Search for graduate programs"
                >
                    <div className="flex items-center space-x-4">
                        <FaSearch className="text-2xl text-neutral-dark group-hover:text-primary transition-colors duration-300" />
                        <span className="text-neutral-dark group-hover:text-primary transition-colors duration-300">
                            Search for graduate programs
                        </span>
                    </div>
                </Link>
            </div>

            {/* Popular Categories Section */}
            <div className="text-center">
                <h3 className="text-lg font-bold text-neutral-dark mb-4">GradTrack Categories</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            to={category.link}
                            className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="text-2xl text-primary mb-2">{category.icon}</span>
                            <span className="text-sm font-medium text-secondary">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApplicationSearch;