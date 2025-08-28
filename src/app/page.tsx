"use client"

import { useEffect, useState, useCallback } from "react"

interface Advocate {
  id: number
  firstName: string
  lastName: string
  city: string
  degree: string
  specialties: string[]
  yearsOfExperience: number
  phoneNumber: number
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([])
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/advocates")
        const jsonResponse = await response.json()
        setAdvocates(jsonResponse.data)
        setFilteredAdvocates(jsonResponse.data)
      } catch (error) {
        console.error("Failed to fetch advocates:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAdvocates()
  }, [])

  const filterAdvocates = useCallback((searchValue: string) => {
    if (!searchValue.trim()) {
      setFilteredAdvocates(advocates)
      return
    }

    const searchWords = searchValue.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0)
    
    const filtered = advocates.filter((advocate) => {
      const searchableContent = [
        advocate?.firstName?.toLowerCase() || '',
        advocate?.lastName?.toLowerCase() || '',
        advocate?.city?.toLowerCase() || '',
        advocate?.degree?.toLowerCase() || '',
        ...(advocate?.specialties?.map(s => s?.toLowerCase()) || []),
        advocate?.yearsOfExperience?.toString() || '',
        advocate?.phoneNumber?.toString() || ''
      ].join(' ')
      
      return searchWords.every(word => searchableContent.includes(word))
    })

    setFilteredAdvocates(filtered)
  }, [advocates])

  const debouncedFilter = useCallback((() => {
    let timeoutId: NodeJS.Timeout
    return (searchValue: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => filterAdvocates(searchValue), 300)
    }
  })(), [filterAdvocates])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedFilter(value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setFilteredAdvocates(advocates)
  }


  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>
      
      <div className="mb-8 p-6 border border-gray-200 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Search Advocates</h2>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500" 
            placeholder="Search by name, city, degree, or specialty..."
            aria-label="Search advocates"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {filteredAdvocates.length !== advocates.length && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {filteredAdvocates.length} of {advocates.length} advocates
          </p>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading advocates...</span>
        </div>
      ) : filteredAdvocates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No advocates found</h3>
          <p className="text-gray-600">Try adjusting your search terms or clear the search to see all advocates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdvocates.map((advocate) => (
                <tr key={advocate.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{advocate.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{advocate.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{advocate.degree}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      {advocate.specialties.map((specialty, idx) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {advocate.yearsOfExperience} {advocate.yearsOfExperience === 1 ? 'year' : 'years'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <a href={`tel:${advocate.phoneNumber}`} className="text-blue-600 hover:text-blue-800 transition-colors duration-150">
                      {advocate.phoneNumber}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
