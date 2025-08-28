'use client';

import { useCallback, useEffect, useState } from 'react';

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface APIResponse {
  data: Advocate[];
  pagination: Pagination;
  query?: string;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch function for both search and regular listing
  const fetchAdvocates = useCallback(
    async (query: string = '', page: number = 1) => {
      try {
        const loadingState = query ? setIsSearching : setIsLoading;
        loadingState(true);

        const endpoint = query
          ? `/api/advocates/search?q=${encodeURIComponent(
              query
            )}&page=${page}&limit=20`
          : `/api/advocates?page=${page}&limit=20`;

        // @todo consider adding a cache layer to the API response
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse: APIResponse = await response.json();

        // Ensure data is always an array to prevent runtime errors
        setAdvocates(Array.isArray(jsonResponse.data) ? jsonResponse.data : []);
        setPagination(jsonResponse.pagination);
        setCurrentPage(page);
      } catch (error) {
        console.error('Failed to fetch advocates:', error);
        setAdvocates([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    const trimmedSearch = searchInput.trim();
    if (!trimmedSearch) {
      // If search is empty and we're already showing all, do nothing
      if (searchTerm === '') {
        return;
      }
      // If we had a search term before, clear it and show all
      setSearchTerm('');
      fetchAdvocates('', 1);
      return;
    }
    setSearchTerm(trimmedSearch);
    fetchAdvocates(trimmedSearch, 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    fetchAdvocates('', 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      fetchAdvocates(searchTerm.trim(), newPage);
    }
  };

  return (
    <main className="pt-6 px-6 pb-[200px] max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>

      <div className="mb-8 p-6 border border-gray-200 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Search Advocates
          </h2>
          {pagination && (
            <p className="text-sm text-gray-600">
              {searchTerm ? (
                <>
                  Showing {advocates?.length || 0} of {pagination.total}{' '}
                  advocates for "{searchTerm}"
                </>
              ) : (
                <>
                  Showing page {pagination.page} of {pagination.totalPages}
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
              placeholder="Search by name, city, degree, or specialty..."
              aria-label="Search advocates"
              disabled={isLoading}
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Clear search"
                disabled={isLoading}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || isSearching}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12  h-[calc(100vh-300px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Loading advocates...</span>
        </div>
      ) : advocates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No advocates found
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Try adjusting your search terms or clear the search.'
              : 'No advocates available.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    First Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Last Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Degree
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Specialties
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {advocates.map((advocate) => (
                  <tr
                    key={advocate.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {advocate.firstName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {advocate.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {advocate.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {advocate.degree}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {advocate.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {advocate.yearsOfExperience}{' '}
                      {advocate.yearsOfExperience === 1 ? 'year' : 'years'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <a
                        href={`tel:${advocate.phoneNumber}`}
                        className="text-primary underline hover:text-primary/80 transition-colors duration-150"
                      >
                        {advocate.phoneNumber}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* @todo consider extracting this to a separate component */}
      {pagination &&
        pagination.totalPages > 1 &&
        !isLoading &&
        advocates.length > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-4 bg-white px-4 py-3 rounded-lg border border-gray-200">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev || isLoading || isSearching}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext || isLoading || isSearching}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
    </main>
  );
}
