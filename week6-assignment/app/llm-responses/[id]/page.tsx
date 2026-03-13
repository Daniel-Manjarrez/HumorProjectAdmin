import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

export default async function LLMResponseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: response, error } = await supabase
    .from('llm_model_responses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !response) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/llm-responses" label="Back to Responses" />
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">LLM Response Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {response.id}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Model ID</label>
                <div className="mt-1">
                  <Link
                    href={`/llm-models/${response.llm_model_id}`}
                    className="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {response.llm_model_id}
                  </Link>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Processing Time</label>
                <p className="mt-1 text-lg text-gray-900">{response.processing_time_seconds} seconds</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(response.created_datetime_utc).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Prompt</label>
                <pre className="mt-1 bg-gray-50 p-4 rounded-md text-sm text-gray-800 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                  {response.llm_user_prompt}
                </pre>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Response</label>
                <pre className="mt-1 bg-gray-50 p-4 rounded-md text-sm text-gray-800 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                  {response.llm_model_response}
                </pre>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Raw Data</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
