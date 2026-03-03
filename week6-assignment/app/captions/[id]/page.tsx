import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CaptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: caption, error } = await supabase
    .from('captions')
    .select(`
      *,
      images (
        url
      ),
      profiles (
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error || !caption) {
    notFound();
  }

  // Handle image URL (array or object)
  const imageUrl = Array.isArray(caption.images)
    ? caption.images[0]?.url
    : (caption.images as any)?.url;

  // Handle profile email
  const userEmail = Array.isArray(caption.profiles)
    ? caption.profiles[0]?.email
    : (caption.profiles as any)?.email;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/captions" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Captions
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Caption Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{caption.id}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 min-h-[300px]">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Context" className="w-full h-auto object-contain max-h-[500px]" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>No image available</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Content</label>
                  <p className="mt-1 text-xl font-serif text-gray-900 italic">
                    "{caption.content}"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(caption.created_datetime_utc).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Author</label>
                  <p className="mt-1 text-lg text-blue-600">
                    <Link href={`/users/${caption.profile_id}`}>
                      {userEmail || caption.profile_id}
                    </Link>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Likes</label>
                  <div className="mt-1 flex items-center text-pink-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold">{caption.like_count}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Raw Data</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(caption, null, 2)}
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
