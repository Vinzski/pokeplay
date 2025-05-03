"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"

function SearchBar({ placeholder, value, onChange }) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  const clearSearch = () => {
    setLocalValue("")
    onChange("")
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="input pl-10 w-full"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
      />
      {localValue && (
        <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={clearSearch}>
          <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-white" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
