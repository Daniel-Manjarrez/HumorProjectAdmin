import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';

export default async function HumorFlavorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: flavor, error } = await supabase
    .from('humor_flavors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !flavor) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/humor-flavors" label="Back to Humor Flavors" />
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Humor Flavor Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {flavor.id}</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Slug</label>
              <p className="mt-1 text-lg text-gray-900 font-mono bg-gray-50 p-2 rounded">{flavor.slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-lg text-gray-900">{flavor.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(flavor.created_datetime_utc).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Raw Data</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(flavor, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
