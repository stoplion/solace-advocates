"use client"

import { useEffect, useState } from "react"

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

  useEffect(() => {
    console.log("fetching advocates...")
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data)
        setFilteredAdvocates(jsonResponse.data)
      })
    })
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalSearchTerm = e.target.value
    const searchTerm = originalSearchTerm.toLowerCase()

    const searchTermElement = document.getElementById("search-term")
    if (searchTermElement) {
      searchTermElement.innerHTML = originalSearchTerm
    }

    console.log("filtering advocates...")

    const filteredAdvocates = advocates.filter((advocate) => {
      // Split search term into individual words
      const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0)
      
      // Create a combined string of all searchable fields for this advocate
      const searchableContent = [
        advocate?.firstName?.toLowerCase() || '',
        advocate?.lastName?.toLowerCase() || '',
        advocate?.city?.toLowerCase() || '',
        advocate?.degree?.toLowerCase() || '',
        ...(advocate?.specialties?.map(s => s?.toLowerCase()) || []),
        advocate?.yearsOfExperience?.toString() || '',
        advocate?.phoneNumber?.toString() || ''
      ].join(' ')
      
      // Check if all search words are found in the combined searchable content
      return searchWords.every(word => searchableContent.includes(word))
    })

    console.log({ filteredAdvocates })
    setFilteredAdvocates(filteredAdvocates)
  }

  const onClick = () => {
    console.log(advocates)
    setFilteredAdvocates(advocates)
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Solace Advocates</h1>
      
      <div className="mb-6 p-4 border border-gray-300 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Search</h2>
        <div className="mb-2">
          <span className="text-sm text-gray-600">Searching for: </span>
          <span id="search-term" className="font-medium"></span>
        </div>
        <div className="flex gap-2">
          <input 
            className="px-3 py-2 border border-black text-base flex-1 max-w-md" 
            onChange={onChange}
            placeholder="Enter search term..."
          />
          <button 
            onClick={onClick}
            className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-sm"
          >
            Reset Search
          </button>
        </div>
      </div>
      
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-3 py-2 text-left font-semibold">First Name</th>
            <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Last Name</th>
            <th className="border border-gray-400 px-3 py-2 text-left font-semibold">City</th>
            <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Degree</th>
            <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Specialties</th>
            <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Years of Experience</th>
            <th className="border border-gray-400 px-3 py-2 text-left font-semibold">Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate, index) => {
            console.log({ advocate })
            return (
              <tr key={advocate.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-400 px-3 py-2">{advocate.firstName}</td>
                <td className="border border-gray-400 px-3 py-2">{advocate.lastName}</td>
                <td className="border border-gray-400 px-3 py-2">{advocate.city}</td>
                <td className="border border-gray-400 px-3 py-2">{advocate.degree}</td>
                <td className="border border-gray-400 px-3 py-2">
                  {advocate.specialties.map((s, index) => (
                    <div key={index} className="text-sm leading-relaxed">{s}</div>
                  ))}
                </td>
                <td className="border border-gray-400 px-3 py-2">{advocate.yearsOfExperience}</td>
                <td className="border border-gray-400 px-3 py-2">{advocate.phoneNumber}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
