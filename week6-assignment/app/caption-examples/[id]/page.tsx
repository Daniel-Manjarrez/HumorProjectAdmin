import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

export default async function CaptionExampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: example, error } = await supabase
    .from('caption_examples')
    .select(`
      *,
      images (
        url
      )
    `)
    .eq('id', id)
    .single();

  if (error || !example) {
    notFound();
  }

  // Handle nested relations
  const imageUrl = Array.isArray(example.images)
    ? example.images[0]?.url
    : (example.images as any)?.url;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/caption-examples" label="Back to Examples" />
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Caption Example Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {example.id}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Preview (Optional) */}
              {example.image_id && (
                <div className="w-full md:w-1/3">
                  <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 min-h-[200px]">
                    {imageUrl ? (
                      <Link href={`/images/${example.image_id}`} className="block w-full h-full relative group">
                        <img src={imageUrl} alt="Example Context" className="w-full h-auto object-contain max-h-[300px]" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white/90 px-3 py-1 rounded text-sm font-medium">View Image</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <span className="text-sm">No image available</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <Link href={`/images/${example.image_id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      View Image Details
                    </Link>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className={`w-full ${example.image_id ? 'md:w-2/3' : ''} space-y-6`}>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Image Description</label>
                  <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md">{example.image_description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Caption</label>
                  <p className="mt-1 text-xl font-serif text-gray-900 italic bg-gray-50 p-4 rounded-md border-l-4 border-blue-500">
                    "{example.caption}"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Explanation</label>
                  <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md">{example.explanation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Priority</label>
                    <p className="mt-1 text-lg text-gray-900">{example.priority}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                    <p className="mt-1 text-lg text-gray-900">
                      {new Date(example.created_datetime_utc).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Raw Data</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(example, null, 2)}
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
