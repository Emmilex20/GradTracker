// src/components/ProgramList.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Program } from '../types/Program';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSpinner, FaSearch, FaFilter } from 'react-icons/fa';
import api from '../utils/api';

// Simple debounce hook with generic types to fix implicit any error
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
  const [isAdding, setIsAdding] = useState(false);
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
    setIsAdding(true);
    try {
      await api.post('/applications', {
        userId: currentUser.uid,
        schoolName: program.university,
        programName: program.department,
        status: 'Interested',
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
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600 select-none">
        Loading programs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 py-20 pb-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-wide">
          Browse Programs 🔎
        </h1>
        <Link to="/dashboard" aria-label="Back to Dashboard">
          <button className="w-full md:w-auto bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
            Back to Dashboard
          </button>
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <FaSearch
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by university or department..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-base"
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
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all appearance-none bg-white cursor-pointer text-base"
            aria-label="Filter programs by funding"
          >
            <option value="">Filter by Funding</option>
            <option value="fully funded">Fully Funded</option>
            <option value="not applicable">Not Applicable</option>
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {programs.length > 0 ? (
          programs.map((program) => (
            <article
              key={program._id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between"
              aria-label={`Program ${program.department} at ${program.university}`}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Department: {program.department}
                </h2>
                <p className="text-sm text-gray-600 font-semibold mb-4">{program.university}</p>
                <dl className="space-y-2 text-sm text-gray-700">
                  <div>
                    <dt className="font-semibold inline">Funding:</dt>{' '}
                    <dd className="inline">{program.funding}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Funding Amount:</dt>{' '}
                    <dd className="inline">{program.fundingAmount}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Deadline:</dt>{' '}
                    <dd className="inline">{program.deadline}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">GRE Waiver:</dt>{' '}
                    <dd className="inline">{program.greWaiver}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">App Fee Waiver:</dt>{' '}
                    <dd className="inline">{program.appFeeWaiver}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Required Docs:</dt>{' '}
                    <dd className="inline">
                      {Array.isArray(program.requiredDocs)
                        ? program.requiredDocs.join(', ')
                        : 'No documents specified'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={() => handleAddToInterested(program)}
                  disabled={isAdding}
                  className={`w-full flex justify-center items-center gap-2 text-center bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 ${
                    isAdding ? 'cursor-wait opacity-70' : ''
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
                    className="w-full text-center bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                    aria-label={`Apply for ${program.department} at ${program.university}`}
                  >
                    Apply Here
                  </a>
                )}
              </div>
            </article>
          ))
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