// src/components/ProgramList.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Program } from '../types/Program';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSpinner, FaSearch, FaFilter } from 'react-icons/fa';
import api from '../utils/api';

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ProgramList: React.FC = () => {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingStates, setAddingStates] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [fundingFilter, setFundingFilter] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchPrograms = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let url = '/programs';
      const params = new URLSearchParams();

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (fundingFilter) {
        params.append('funding', fundingFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      setPrograms(response.data);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, debouncedSearchQuery, fundingFilter]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleAddToInterested = async (program: Program) => {
    if (!currentUser) {
      alert('You must be logged in to add a program to your dashboard.');
      return;
    }

    setAddingStates(prev => ({ ...prev, [program.id]: true }));
    try {
      await api.post('/applications', {
        userId: currentUser.uid,
        schoolName: program.university,
        programName: program.department,
        status: 'Interested',
        professors: program.professors, 
        funding: program.funding,
        fundingAmount: program.fundingAmount,
        deadline: program.deadline,
        greWaiver: program.greWaiver,
        ieltsWaiver: program.ieltsWaiver,
        appFeeWaiver: program.appFeeWaiver,
        requiredDocs: program.requiredDocs,
        appLink: program.appLink,
      });
      alert(
        `✅ Successfully added ${program.department} at ${program.university} to your dashboard!`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to add program:', err);
      if (err.response && err.response.status === 409) {
        alert('This program has already been added to your dashboard.');
      } else {
        alert('Failed to add program to your dashboard. Please try again.');
      }
    } finally {
      setAddingStates(prev => ({ ...prev, [program.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 z-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400 select-none">
          Fetching programs for you...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 lg:p-12 text-gray-900 dark:text-gray-100">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
          Browse Programs
        </h1>
        <Link to="/dashboard" aria-label="Back to Dashboard">
          <button className="w-full md:w-auto bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
            Back to Dashboard
          </button>
        </Link>
      </header>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto items-center">
        <div className="relative flex-1 w-full">
          <FaSearch
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by university or department..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Search programs by university or department"
          />
        </div>

        <div className="relative w-full md:w-56">
          <FaFilter
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <select
            value={fundingFilter}
            onChange={(e) => setFundingFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all appearance-none bg-white dark:bg-gray-800 cursor-pointer text-base"
            aria-label="Filter programs by funding"
          >
            <option value="">Filter by Funding</option>
            <option value="fully funded">Fully Funded</option>
            <option value="not applicable">Not Applicable</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {programs.length > 0 ? (
          programs.map((program) => {
            const isAdding = addingStates[program.id];
            return (
              <article
                key={program.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
                aria-label={`Program ${program.department} at ${program.university}`}
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {program.department}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-4">
                    at {program.university}
                  </p>
                  <dl className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {program.professors && (
                      <div>
                        <dt className="font-semibold inline">Professors:</dt>{' '}
                        <dd className="inline">
                            <a href={program.professors} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Website
                            </a>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-semibold inline">Funding:</dt>{' '}
                      <dd className="inline capitalize">{program.funding}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline">Funding Amount:</dt>{' '}
                      <dd className="inline">{program.fundingAmount || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline">Deadline:</dt>{' '}
                      <dd className="inline">{program.deadline || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline">GRE Waiver:</dt>{' '}
                      <dd className="inline">{program.greWaiver || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline">App Fee Waiver:</dt>{' '}
                      <dd className="inline">{program.appFeeWaiver || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline">Required Docs:</dt>{' '}
                      <dd className="inline">
                        {Array.isArray(program.requiredDocs)
                          ? program.requiredDocs.join(', ') || 'N/A'
                          : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                  <button
                    onClick={() => handleAddToInterested(program)}
                    disabled={isAdding}
                    className={`w-full flex justify-center items-center gap-2 text-center text-gray-800 font-medium py-2 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 ${
                      isAdding 
                        ? 'bg-gray-400 cursor-wait opacity-70' 
                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100'
                    }`}
                    aria-label={`Add ${program.department} at ${program.university} to dashboard`}
                  >
                    {isAdding ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                    Add to Dashboard
                  </button>

                  {program.appLink && (
                    <a
                      href={program.appLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      aria-label={`Apply for ${program.department} at ${program.university}`}
                    >
                      Apply Here
                    </a>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg py-10 select-none">
            No programs found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgramList;