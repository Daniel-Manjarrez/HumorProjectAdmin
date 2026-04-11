import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto relative pt-8">
        <div className="absolute -top-8 right-0 flex items-center gap-4 z-10">
          <ThemeToggle />
          <SignOutButton />
        </div>
        <div className="mb-8">
          <BackButton fallbackUrl="/images" label="Back to Images" />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Image Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{image.id}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-colors">
                  {image.url ? (
                    <img src={image.url} alt="Detail" className="w-full h-auto object-contain max-h-[500px]" />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">No URL</div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {new Date(image.created_datetime_utc).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${image.is_public ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="text-gray-700 dark:text-gray-300">{image.is_public ? 'Public' : 'Private'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${image.is_common_use ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="text-gray-700 dark:text-gray-300">{image.is_common_use ? 'Common Use' : 'Restricted Use'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Profile ID</label>
                  <p className="mt-1 text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded transition-colors">
                    {image.profile_id}
                  </p>
                </div>

                <div className="pt-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Raw Data</h3>
                  <pre className="bg-gray-900 text-gray-100 dark:bg-gray-950 dark:text-gray-300 p-4 rounded-lg overflow-x-auto text-xs transition-colors">
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
