import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

export default async function CaptionRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: request, error } = await supabase
    .from('caption_requests')
    .select(`
      *,
      profiles!profile_id (
        email
      ),
      images!image_id (
        url
      )
    `)
    .eq('id', id)
    .single();

  if (error || !request) {
    if (error) console.error("Error fetching caption request detail:", error);
    notFound();
  }

  // Handle nested relations
  const userEmail = Array.isArray(request.profiles)
    ? request.profiles[0]?.email
    : (request.profiles as any)?.email;

  const imageUrl = Array.isArray(request.images)
    ? request.images[0]?.url
    : (request.images as any)?.url;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/caption-requests" label="Back to Requests" />
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Caption Request Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {request.id}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Preview */}
              <div className="w-full md:w-1/2">
                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 min-h-[300px]">
                  {imageUrl ? (
                    <Link href={`/images/${request.image_id}`} className="block w-full h-full relative group">
                      <img src={imageUrl} alt="Request Context" className="w-full h-auto object-contain max-h-[500px]" />
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
              </div>

              {/* Details */}
              <div className="w-full md:w-1/2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Requested By</label>
                  <p className="mt-1 text-lg text-blue-600">
                    <Link href={`/users/${request.profile_id}`}>
                      {userEmail || request.profile_id}
                    </Link>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Image ID</label>
                  <p className="mt-1 text-lg text-blue-600 font-mono text-sm">
                    <Link href={`/images/${request.image_id}`}>
                      {request.image_id}
                    </Link>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(request.created_datetime_utc).toLocaleString()}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Raw Data</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(request, null, 2)}
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