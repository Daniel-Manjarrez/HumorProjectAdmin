import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import ImageManager from './ImageManager';
import SearchFilter from '@/components/SearchFilter';

export default async function ImagesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const sort = params.sort || 'newest';
  const visibility = params.visibility;
  const usage = params.usage;

  let query = supabase.from('images').select('*');

  // Filter
  if (visibility === 'public') {
    query = query.eq('is_public', true);
  } else if (visibility === 'private') {
    query = query.eq('is_public', false);
  }

  if (usage === 'common') {
    query = query.eq('is_common_use', true);
  } else if (usage === 'restricted') {
    query = query.eq('is_common_use', false);
  }

  // Sort
  if (sort === 'oldest') {
    query = query.order('created_datetime_utc', { ascending: true });
  } else {
    // Default: newest
    query = query.order('created_datetime_utc', { ascending: false });
  }

  const { data: images, error } = await query;

  if (error) {
    return <div>Error loading images</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Images</h1>

        <SearchFilter
          sortOptions={[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'oldest' },
          ]}
          filters={[
            {
              key: 'visibility',
              label: 'Visibility',
              options: [
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
              ]
            },
            {
              key: 'usage',
              label: 'Usage',
              options: [
                { label: 'Common Use', value: 'common' },
                { label: 'Restricted', value: 'restricted' },
              ]
            }
          ]}
        />

        <ImageManager initialImages={images || []} />
      </div>
    </div>
  );
}
