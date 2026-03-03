'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

// Custom debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
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
}

type Column = {
  key: string;
  label: string;
  type: 'text' | 'boolean' | 'date' | 'number';
};

type Props = {
  columns: Column[];
};

export default function AdvancedFilter({ columns }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'created_datetime_utc');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');

  const [filterBy, setFilterBy] = useState(searchParams.get('filter_by') || columns[0].key);
  const [filterValue, setFilterValue] = useState(searchParams.get('filter_value') || '');

  const debouncedFilterValue = useDebounceValue(filterValue, 500);

  // Helper to update URL
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  // Handle Sort Change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    updateUrl({ sort_by: newSortBy });
  };

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    updateUrl({ sort_order: newOrder });
  };

  // Handle Filter Column Change
  const handleFilterByChange = (newFilterBy: string) => {
    setFilterBy(newFilterBy);
    setFilterValue(''); // Reset value
    updateUrl({
      filter_by: newFilterBy,
      filter_value: null,
      page: '1' // Reset page
    });
  };

  // Handle Filter Value Change (Debounced)
  useEffect(() => {
    // Only update if the value actually changed from what's in the URL
    const currentUrlValue = searchParams.get('filter_value') || '';

    if (debouncedFilterValue !== currentUrlValue) {
      const params = new URLSearchParams(searchParams.toString());

      if (debouncedFilterValue) {
        params.set('filter_by', filterBy);
        params.set('filter_value', debouncedFilterValue);
      } else {
        params.delete('filter_by');
        params.delete('filter_value');
      }

      params.set('page', '1'); // Reset page on filter change
      router.replace(`?${params.toString()}`);
    }
  }, [debouncedFilterValue, filterBy, router, searchParams]);

  const currentFilterColumn = columns.find(c => c.key === filterBy);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Filter Section */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter By</label>
          <div className="flex gap-2">
            <div className="relative w-1/3">
              <select
                className="block w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                value={filterBy}
                onChange={(e) => handleFilterByChange(e.target.value)}
              >
                {columns.map((col) => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="relative flex-1">
              {currentFilterColumn?.type === 'boolean' ? (
                <select
                  className="block w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">True / Yes</option>
                  <option value="false">False / No</option>
                </select>
              ) : (
                <input
                  type={currentFilterColumn?.type === 'number' ? 'number' : 'text'}
                  className="block w-full pl-3 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Search ${currentFilterColumn?.label}...`}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sort Section */}
        <div className="flex-1 md:flex-none md:w-1/3 space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort By</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                className="block w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {columns.map((col) => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <button
              onClick={handleSortOrderChange}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors min-w-[100px]"
            >
              {sortOrder === 'asc' ? (
                <>
                  <span className="mr-2 text-sm font-medium">Asc</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                </>
              ) : (
                <>
                  <span className="mr-2 text-sm font-medium">Desc</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
