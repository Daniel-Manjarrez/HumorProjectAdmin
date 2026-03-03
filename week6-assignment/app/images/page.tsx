import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import ImageManager from './ImageManager';

export default async function ImagesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: images, error } = await supabase
    .from('images')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

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

        <ImageManager initialImages={images || []} />
      </div>
    </div>
  );
}
