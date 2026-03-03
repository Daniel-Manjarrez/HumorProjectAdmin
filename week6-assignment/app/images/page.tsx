import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images?.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {image.url ? (
                  <img src={image.url} alt="Uploaded" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400">No URL</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 truncate">ID: {image.id}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(image.created_datetime_utc).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
