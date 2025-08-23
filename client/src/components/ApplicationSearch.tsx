import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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

            {/* Enticing Text Section */}
            <div className="text-center">
                <h3 className="text-lg font-bold text-neutral-dark mb-2">Explore Your Future.</h3>
                <p className="text-md text-neutral-dark/80 max-w-xl">
                    Find the perfect graduate program that aligns with your ambitions and career goals.
                </p>
                <div className="mt-4">
                    <Link
                        to="/programs"
                        className="py-2 px-6 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors duration-300"
                    >
                        Start Exploring
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ApplicationSearch;