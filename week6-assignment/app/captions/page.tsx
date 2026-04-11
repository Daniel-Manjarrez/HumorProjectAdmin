import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import AdvancedFilter from '@/components/AdvancedFilter';
import Pagination from '@/components/Pagination';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';
import { ArrowLeft } from 'lucide-react';

export default async function CaptionsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const page = parseInt(params.page || '1');
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Sort
  const sortBy = params.sort_by || 'created_datetime_utc';
  const sortOrder = params.sort_order === 'asc';

  let query = supabase.from('captions').select('*', { count: 'exact' });

  // Dynamic Filters
  const columns = [
    { key: 'content', label: 'Content', type: 'text' as const },
    { key: 'like_count', label: 'Likes', type: 'number' as const },
    { key: 'profile_id', label: 'Profile ID', type: 'text' as const },
    { key: 'image_id', label: 'Image ID', type: 'text' as const },
    { key: 'created_datetime_utc', label: 'Created At', type: 'date' as const },
  ];

  columns.forEach(col => {
    const value = params[col.key];
    if (value) {
      if (col.type === 'number') {
        query = query.eq(col.key, parseInt(value));
      } else if (col.type === 'date') {
        const dateVal = new Date(value);
        if (!isNaN(dateVal.getTime())) {
           query = query.gte(col.key, dateVal.toISOString());
        }
      } else if (col.key === 'profile_id' || col.key === 'image_id') {
        query = query.eq(col.key, value);
      } else {
        query = query.ilike(col.key, `%${value}%`);
      }
    }
  });

  // Sort
  query = query.order(sortBy, { ascending: sortOrder });

  // Pagination
  query = query.range(from, to);

  const { data: captions, count, error } = await query;

  if (error) {
    return <div>Error loading captions</div>;
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;
  const hasNextPage = page < totalPages;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto relative pt-8">
        <div className="absolute -top-8 right-0 flex items-center gap-4 z-10">
          <ThemeToggle />
          <SignOutButton />
        </div>
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Captions</h1>

        <AdvancedFilter columns={columns} />

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Profile ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Image ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {captions?.map((caption) => (
                <tr key={caption.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <Link href={`/captions/${caption.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                      {caption.content.length > 50 ? `${caption.content.substring(0, 50)}...` : caption.content}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    <Link href={`/users/${caption.profile_id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                      {caption.profile_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    <Link href={`/images/${caption.image_id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                      {caption.image_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(caption.created_datetime_utc).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/captions/${caption.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} hasNextPage={hasNextPage} />
      </div>
    </div>
  );
}