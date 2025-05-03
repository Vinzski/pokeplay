"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

function Pagination({ currentPage, totalPages, onPageChange, maxVisiblePages = 5 }) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  // Calculate range of pages to show
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  // Generate array of page numbers to display
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <nav className="flex justify-center items-center py-4">
      <ul className="flex items-center -space-x-px h-10">
        <li>
          <button
            className="flex items-center justify-center h-10 px-4 ml-0 text-gray-400 bg-gray-800 border border-gray-700 rounded-l-lg hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        </li>

        {startPage > 1 && (
          <>
            <li>
              <button
                className="flex items-center justify-center h-10 px-4 text-gray-400 bg-gray-800 border border-gray-700 hover:bg-gray-700"
                onClick={() => onPageChange(1)}
              >
                1
              </button>
            </li>
            {startPage > 2 && (
              <li>
                <span className="flex items-center justify-center h-10 px-4 text-gray-400 bg-gray-800 border border-gray-700">
                  ...
                </span>
              </li>
            )}
          </>
        )}

        {pages.map((page) => (
          <li key={page}>
            <button
              className={`flex items-center justify-center h-10 px-4 border border-gray-700 hover:bg-gray-700 ${
                currentPage === page
                  ? "text-white bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                  : "text-gray-400 bg-gray-800"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li>
                <span className="flex items-center justify-center h-10 px-4 text-gray-400 bg-gray-800 border border-gray-700">
                  ...
                </span>
              </li>
            )}
            <li>
              <button
                className="flex items-center justify-center h-10 px-4 text-gray-400 bg-gray-800 border border-gray-700 hover:bg-gray-700"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li>
          <button
            className="flex items-center justify-center h-10 px-4 text-gray-400 bg-gray-800 border border-gray-700 rounded-r-lg hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
