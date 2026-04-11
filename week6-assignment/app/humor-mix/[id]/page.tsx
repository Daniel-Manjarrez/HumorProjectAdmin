import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';

export default async function HumorMixDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: mix, error } = await supabase
    .from('humor_flavor_mix')
    .select(`
      *,
      humor_flavors (
        slug,
        description
      )
    `)
    .eq('id', id)
    .single();

  if (error || !mix) {
    notFound();
  }

  // Handle nested relation
  const flavor = Array.isArray(mix.humor_flavors)
    ? mix.humor_flavors[0]
    : (mix.humor_flavors as any);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/humor-mix" label="Back to Humor Mix" />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Humor Mix Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">ID: {mix.id}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Flavor ID</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{mix.humor_flavor_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Caption Count</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white font-bold text-blue-600 dark:text-blue-400">{mix.caption_count}</p>
              </div>
            </div>

            {flavor && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Flavor Context</h3>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{flavor.slug}</p>
                <p className="text-gray-600 dark:text-gray-400">{flavor.description}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {new Date(mix.created_datetime_utc).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Raw Data</h3>
              <pre className="bg-gray-900 text-gray-100 dark:bg-gray-950 dark:text-gray-300 p-4 rounded-lg overflow-x-auto text-sm transition-colors">
                {JSON.stringify(mix, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
