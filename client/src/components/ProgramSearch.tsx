import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSpinner, FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface ProgramSearchResult {
    _id: string;
    university: string;
    department: string;
    funding: string;
    greWaiver: string;
    ieltsWaiver: string;
    appFeeWaiver: string;
    requiredDocs: string[];
    appLink: string;
}

const ProgramSearch: React.FC = () => {
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [results, setResults] = useState<ProgramSearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (searchQuery.length < 3) {
            setError('Please enter at least 3 characters to search.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get<ProgramSearchResult[]>(
                `${API_URL}/programs/search?query=${searchQuery}`
            );
            setResults(response.data);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to fetch programs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToInterested = async (program: ProgramSearchResult) => {
        if (!currentUser) {
            alert('You must be logged in to add a program.');
            return;
        }

        try {
            await axios.post(`${API_URL}/applications`, {
                userId: currentUser.uid,
                schoolName: program.university,
                programName: program.department,
                status: 'Interested',
                funding: program.funding,
                greWaiver: program.greWaiver,
                ieltsWaiver: program.ieltsWaiver,
                appFeeWaiver: program.appFeeWaiver,
                requiredDocs: program.requiredDocs,
                appLink: program.appLink,
            });
            alert(`Successfully added ${program.department} at ${program.university} to your dashboard!`);
        } catch (err) {
            console.error('Failed to add program:', err);
            alert('Failed to add program to your dashboard. It might already exist or an error occurred.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 py-24">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Find Programs 🎓</h1>
                <Link to="/dashboard">
                    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Back to Dashboard
                    </button>
                </Link>
            </header>

            <form onSubmit={handleSearch} className="mb-8 flex space-x-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Chemistry Rice, Computer Science MIT"
                    className="flex-grow p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading || searchQuery.length < 3}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                </button>
            </form>

            {loading && <p className="text-center text-gray-500">Searching...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {results.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    University
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Funding
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GRE Waiver
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IELTS Waiver
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    App Fee Waiver
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Required Docs
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {results.map((program) => (
                                <tr key={program._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.university}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.funding}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.greWaiver}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.ieltsWaiver}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.appFeeWaiver}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{program.requiredDocs.join(', ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleAddToInterested(program)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <FaPlus className="mr-2" />
                                            Add
                                        </button>
                                        <a
                                            href={program.appLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Apply
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && !error && results.length === 0 && (
                <p className="col-span-full text-center text-gray-500 italic">Start your search to find programs.</p>
            )}
        </div>
    );
};

export default ProgramSearch;