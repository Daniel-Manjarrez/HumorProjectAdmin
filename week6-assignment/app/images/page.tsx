import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import ImageManager from './ImageManager';
import AdvancedFilter from '@/components/AdvancedFilter';
import Pagination from '@/components/Pagination';

export default async function ImagesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const page = parseInt(params.page || '1');
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Advanced Filter Params
  const sortBy = params.sort_by || 'created_datetime_utc';
  const sortOrder = params.sort_order === 'asc';
  const filterBy = params.filter_by;
  const filterValue = params.filter_value;

  let query = supabase.from('images').select('*', { count: 'exact' });

  // Dynamic Filter
  if (filterBy && filterValue) {
    if (filterBy === 'is_public' || filterBy === 'is_common_use') {
      query = query.eq(filterBy, filterValue === 'true');
    } else if (filterBy === 'created_datetime_utc') {
      const dateVal = new Date(filterValue);
      if (!isNaN(dateVal.getTime())) {
         query = query.gte(filterBy, dateVal.toISOString());
      }
    } else if (filterBy === 'profile_id' || filterBy === 'id') {
      // Exact match for IDs
      query = query.eq(filterBy, filterValue);
    } else {
      // Fallback text search
      query = query.ilike(filterBy, `%${filterValue}%`);
    }
  }

  // Dynamic Sort
  query = query.order(sortBy, { ascending: sortOrder });

  // Pagination
  query = query.range(from, to);

  const { data: images, count, error } = await query;

  if (error) {
    return <div>Error loading images</div>;
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;
  const hasNextPage = page < totalPages;

  const columns = [
    { key: 'id', label: 'ID', type: 'text' as const },
    { key: 'profile_id', label: 'Profile ID', type: 'text' as const },
    { key: 'is_public', label: 'Public', type: 'boolean' as const },
    { key: 'is_common_use', label: 'Common Use', type: 'boolean' as const },
    { key: 'created_datetime_utc', label: 'Created At', type: 'date' as const },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Images</h1>

        <AdvancedFilter columns={columns} />

        <ImageManager initialImages={images || []} />

        <Pagination page={page} totalPages={totalPages} hasNextPage={hasNextPage} />
      </div>
    </div>
  );
}
