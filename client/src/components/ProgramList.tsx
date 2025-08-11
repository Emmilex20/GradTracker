import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Program } from '../types/Program';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSpinner, FaSearch, FaFilter } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;


const ProgramList: React.FC = () => {
    const { currentUser } = useAuth();
    const [allPrograms, setAllPrograms] = useState<Program[]>([]);
    const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false); // To manage the "Add" button state
    const [searchQuery, setSearchQuery] = useState('');
    const [fundingFilter, setFundingFilter] = useState(''); // New state for funding filter

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/programs`);
                setAllPrograms(response.data);
                setFilteredPrograms(response.data); // Initialize filtered programs with all programs
            } catch (error) {
                console.error('Failed to fetch programs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    // Effect to filter programs based on search query and funding filter
    useEffect(() => {
        let results = allPrograms;

        // Apply search filter
        if (searchQuery) {
            results = results.filter(program =>
                program.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
                program.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply funding filter
        if (fundingFilter) {
            results = results.filter(program =>
                program.funding.toLowerCase() === fundingFilter.toLowerCase()
            );
        }

        setFilteredPrograms(results);
    }, [searchQuery, fundingFilter, allPrograms]);

    // Function to add a program to the user's dashboard
    const handleAddToInterested = async (program: Program) => {
        if (!currentUser) {
            alert('You must be logged in to add a program to your dashboard.');
            return;
        }

        setIsAdding(true);
        try {
            await axios.post(`${API_URL}/api/applications`, {
                userId: currentUser.uid,
                schoolName: program.university,
                programName: program.department,
                status: 'Interested', // Set initial status
                funding: program.funding,
                fundingAmount: program.fundingAmount,
                deadline: program.deadline, // <-- Corrected field name
                greWaiver: program.greWaiver,
                ieltsWaiver: program.ieltsWaiver,
                appFeeWaiver: program.appFeeWaiver,
                requiredDocs: program.requiredDocs,
                appLink: program.appLink,
            });
            alert(`Successfully added ${program.department} at ${program.university} to your dashboard!`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Failed to add program:', err);
            // Provide a user-friendly error message, especially for duplicates
            if (err.response && err.response.status === 409) {
                alert('This program has already been added to your dashboard.');
            } else {
                alert('Failed to add program to your dashboard. Please try again.');
            }
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl text-gray-600">Loading programs...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12">
            <header className="flex flex-col md:flex-row justify-between py-20 pb-2 items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Browse Programs 🔎</h1>
                <Link to="/dashboard">
                    <button className="w-full md:w-auto bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                        Back to Dashboard
                    </button>
                </Link>
            </header>
            
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search Input */}
                <div className="relative flex-1">
                    <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by university or department..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
                
                {/* Filter Dropdown */}
                <div className="relative">
                    <FaFilter className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <select
                        value={fundingFilter}
                        onChange={(e) => setFundingFilter(e.target.value)}
                        className="w-full md:w-56 pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm appearance-none bg-white"
                    >
                        <option value="">Filter by Funding</option>
                        <option value="fully funded">Fully Funded</option>
                        <option value="not applicable">Not Applicable</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPrograms.length > 0 ? (
                    filteredPrograms.map((program) => (
                        <div 
                            key={program._id} 
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-1">Department: {program.department}</h2>
                                <p className="text-sm text-gray-600 font-bold mb-4">{program.university}</p>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <p><span className="font-semibold">Funding:</span> {program.funding}</p>
                                    <p><span className="font-semibold">Funding Amount:</span> {program.fundingAmount}</p>
                                    <p><span className="font-semibold">Deadline:</span> {program.deadline}</p> 
                                    <p><span className="font-semibold">GRE Waiver:</span> {program.greWaiver}</p>
                                    <p><span className="font-semibold">App Fee Waiver:</span> {program.appFeeWaiver}</p>
                                    <p><span className="font-semibold">Required Docs:</span> {program.requiredDocs.join(', ')}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                                <button
                                    onClick={() => handleAddToInterested(program)}
                                    disabled={isAdding} // Disable button while adding
                                    className="w-full text-center bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex justify-center items-center gap-2"
                                >
                                    {isAdding ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                                    Add to Dashboard
                                </button>
                                {program.appLink && (
                                    <a 
                                        href={program.appLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="w-full text-center bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Apply Here
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 text-lg py-10">No programs found matching your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default ProgramList;