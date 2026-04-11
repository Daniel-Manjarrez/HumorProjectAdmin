'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
};

export default function Pagination({ page, totalPages, hasNextPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`?${params.toString()}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageElements = [];

    // Jump back by 10
    if (page > 10) {
      pageElements.push(
        <button
          key="jump-back-10"
          onClick={() => handlePageChange(Math.max(1, page - 10))}
          className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors"
          title="Jump back 10 pages"
        >
          -10
        </button>
      );
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageElements.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageElements.push(
          <span key="ellipsis-start" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageElements.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 transition-colors
            ${i === page
              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
              : 'text-gray-900 hover:bg-gray-50'
            }`}
        >
          {i}
        </button>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageElements.push(
          <span key="ellipsis-end" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
            ...
          </span>
        );
      }
      pageElements.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    // Jump forward by 10
    if (page + 10 <= totalPages) {
      pageElements.push(
        <button
          key="jump-forward-10"
          onClick={() => handlePageChange(Math.min(totalPages, page + 10))}
          className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 transition-colors"
          title="Jump forward 10 pages"
        >
          +10
        </button>
      );
    }

    return <>{pageElements}</>;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm transition-colors">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNextPage}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showing page <span className="font-medium text-gray-900 dark:text-white">{page}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 transition-colors ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>

            {renderPageNumbers()}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNextPage}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 transition-colors ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
