import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import SearchFilter from '@/components/SearchFilter';

export default async function CaptionsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const search = params.search;
  const sort = params.sort || 'newest';

  let query = supabase.from('captions').select('*');

  // Search
  if (search) {
    query = query.ilike('content', `%${search}%`);
  }

  // Sort
  if (sort === 'oldest') {
    query = query.order('created_datetime_utc', { ascending: true });
  } else if (sort === 'likes_desc') {
    query = query.order('like_count', { ascending: false });
  } else if (sort === 'likes_asc') {
    query = query.order('like_count', { ascending: true });
  } else {
    // Default: newest
    query = query.order('created_datetime_utc', { ascending: false });
  }

  const { data: captions, error } = await query;

  if (error) {
    return <div>Error loading captions</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Captions</h1>

        <SearchFilter
          placeholder="Search captions..."
          sortOptions={[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'oldest' },
            { label: 'Most Liked', value: 'likes_desc' },
            { label: 'Least Liked', value: 'likes_asc' },
          ]}
        />

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {captions?.map((caption) => (
                <tr key={caption.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link href={`/captions/${caption.id}`} className="hover:text-blue-600">
                      {caption.content.length > 50 ? `${caption.content.substring(0, 50)}...` : caption.content}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                    <Link href={`/users/${caption.profile_id}`} className="hover:text-blue-600">
                      {caption.profile_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                    <Link href={`/images/${caption.image_id}`} className="hover:text-blue-600">
                      {caption.image_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(caption.created_datetime_utc).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/captions/${caption.id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
