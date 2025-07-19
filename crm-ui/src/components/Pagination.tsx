import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <nav className="flex justify-center mt-6">
            <ul className="inline-flex items-center space-x-1">
                <li>
                    <button
                        className="px-3 py-1 rounded-l bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>
                </li>
                {pages.map(page => (
                    <li key={page}>
                        <button
                            className={`px-3 py-1 ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded`}
                            onClick={() => onPageChange(page)}
                            disabled={page === currentPage}
                        >
                            {page}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        className="px-3 py-1 rounded-r bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination; 