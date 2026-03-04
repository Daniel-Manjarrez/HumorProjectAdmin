import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';

export default async function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: image, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !image) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/images" label="Back to Images" />
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Image Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{image.id}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                  {image.url ? (
                    <img src={image.url} alt="Detail" className="w-full h-auto object-contain max-h-[500px]" />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">No URL</div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(image.created_datetime_utc).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${image.is_public ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-gray-700">{image.is_public ? 'Public' : 'Private'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${image.is_common_use ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <span className="text-gray-700">{image.is_common_use ? 'Common Use' : 'Restricted Use'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Profile ID</label>
                  <p className="mt-1 text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                    {image.profile_id}
                  </p>
                </div>

                <div className="pt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Raw Data</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(image, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
