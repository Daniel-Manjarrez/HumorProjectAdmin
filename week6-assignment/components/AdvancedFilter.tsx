'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

type Column = {
  key: string;
  label: string;
  type: 'text' | 'boolean' | 'date' | 'number';
};

type Props = {
  columns: Column[];
};

type ActiveFilter = {
  id: string; // unique id for React key
  key: string;
  value: string;
};

export default function AdvancedFilter({ columns }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize Sort State
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'created_datetime_utc');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');

  // Initialize Filters State
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  // Load filters from URL on mount
  useEffect(() => {
    const newFilters: ActiveFilter[] = [];
    let idCounter = 0;

    // Iterate through all search params
    searchParams.forEach((value, key) => {
      // If the key matches a column definition, it's a filter
      if (columns.some(col => col.key === key)) {
        newFilters.push({
          id: `init-${idCounter++}`,
          key,
          value
        });
      }
    });

    // Only update if different to avoid loops, but since this runs on mount/searchParams change,
    // we need to be careful. Actually, we should just sync state to URL, not vice versa constantly.
    // But for initial load, we need this.
    // To avoid infinite loops, we'll just set it once or check length.
    // For simplicity in this assignment, we'll trust the URL as the source of truth.

    // However, to make the UI responsive, we keep local state.
    // Let's just set it if it's empty (initial load).
    if (filters.length === 0 && newFilters.length > 0) {
      setFilters(newFilters);
    }
  }, [columns, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to update URL
  const updateUrl = useCallback((newFilters: ActiveFilter[], newSortBy: string, newSortOrder: string) => {
    const params = new URLSearchParams();

    // Add Sort
    params.set('sort_by', newSortBy);
    params.set('sort_order', newSortOrder);

    // Add Filters
    newFilters.forEach(filter => {
      if (filter.value) {
        params.set(filter.key, filter.value);
      }
    });

    // Reset page
    params.set('page', '1');

    router.replace(`?${params.toString()}`);
  }, [router]);

  // Handlers
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    updateUrl(filters, newSortBy, sortOrder);
  };

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    updateUrl(filters, sortBy, newOrder);
  };

  const addFilter = () => {
    // Find the first unused column, or just default to the first one
    const usedKeys = new Set(filters.map(f => f.key));
    const nextColumn = columns.find(c => !usedKeys.has(c.key)) || columns[0];

    const newFilters = [
      ...filters,
      { id: `new-${Date.now()}`, key: nextColumn.key, value: '' }
    ];
    setFilters(newFilters);
    // We don't update URL yet, wait for value input
  };

  const removeFilter = (id: string) => {
    const newFilters = filters.filter(f => f.id !== id);
    setFilters(newFilters);
    updateUrl(newFilters, sortBy, sortOrder);
  };

  const updateFilter = (id: string, field: 'key' | 'value', newValue: string) => {
    const newFilters = filters.map(f => {
      if (f.id === id) {
        if (field === 'key') {
          return { ...f, key: newValue, value: '' }; // Reset value if key changes
        }
        return { ...f, [field]: newValue };
      }
      return f;
    });
    setFilters(newFilters);

    // Debounce URL update for value changes
    if (field === 'value') {
      const timeoutId = setTimeout(() => {
        updateUrl(newFilters, sortBy, sortOrder);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      // Immediate update for key changes (though value is empty so it might remove the param)
      updateUrl(newFilters, sortBy, sortOrder);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 space-y-6 transition-colors">
      <div className="flex flex-col gap-6">

        {/* Sort Section */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Sort By</label>
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <select
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {columns.map((col) => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <button
              onClick={handleSortOrderChange}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition-colors min-w-[100px]"
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

        {/* Filters Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filters</label>
            <button
              onClick={addFilter}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add Filter
            </button>
          </div>

          {filters.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No active filters.</p>
          )}

          {filters.map((filter) => {
            const currentColumn = columns.find(c => c.key === filter.key);

            return (
              <div key={filter.id} className="flex gap-2 items-center animate-fadeIn">
                <div className="relative w-1/3 md:w-1/4">
                  <select
                    className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
                    value={filter.key}
                    onChange={(e) => updateFilter(filter.id, 'key', e.target.value)}
                  >
                    {columns.map((col) => (
                      <option key={col.key} value={col.key}>{col.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="relative flex-1">
                  {currentColumn?.type === 'boolean' ? (
                    <select
                      className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="true">True / Yes</option>
                      <option value="false">False / No</option>
                    </select>
                  ) : (
                    <input
                      type={currentColumn?.type === 'number' ? 'number' : 'text'}
                      className="block w-full pl-3 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder={`Filter by ${currentColumn?.label}...`}
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    />
                  )}
                </div>

                <button
                  onClick={() => removeFilter(filter.id)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Remove filter"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
