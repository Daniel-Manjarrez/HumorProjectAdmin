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

  // Parse response
  let parsedCaptions: string[] = [];
  try {
    if (response.llm_model_response) {
      const parsed = JSON.parse(response.llm_model_response);
      if (Array.isArray(parsed)) {
        parsedCaptions = parsed;
      } else if (parsed.choices?.[0]?.message?.content) {
        // Handle provider format if not already unwrapped
        try {
          parsedCaptions = JSON.parse(parsed.choices[0].message.content);
        } catch {
          parsedCaptions = [parsed.choices[0].message.content];
        }
      }
    }
  } catch (e) {
    // raw string
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/llm-responses" label="Back to Responses" />
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">LLM Response Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {response.id}</p>
          </div>

          <div className="p-6 space-y-8">

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div>
                <label className="block text-xs font-medium text-blue-600 uppercase tracking-wider">Model</label>
                <Link href={`/llm-models/${response.llm_model_id}`} className="text-blue-900 font-mono font-bold hover:underline">
                  ID: {response.llm_model_id}
                </Link>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 uppercase tracking-wider">Temperature</label>
                <p className="text-blue-900 font-mono font-bold">{response.llm_temperature ?? 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 uppercase tracking-wider">Processing Time</label>
                <p className="text-blue-900 font-mono font-bold">{response.processing_time_seconds}s</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-600 uppercase tracking-wider">Created</label>
                <p className="text-blue-900 text-sm">{new Date(response.created_datetime_utc).toLocaleString()}</p>
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {response.caption_request_id && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <label className="block text-xs text-gray-500 uppercase">Caption Request</label>
                  <Link href={`/caption-requests/${response.caption_request_id}`} className="text-blue-600 hover:underline text-sm font-medium">
                    View Request #{response.caption_request_id}
                  </Link>
                </div>
              )}
              {response.llm_prompt_chain_id && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <label className="block text-xs text-gray-500 uppercase">Prompt Chain</label>
                  <Link href={`/prompt-chains/${response.llm_prompt_chain_id}`} className="text-blue-600 hover:underline text-sm font-medium">
                    View Chain #{response.llm_prompt_chain_id}
                  </Link>
                </div>
              )}
              {response.humor_flavor_id && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <label className="block text-xs text-gray-500 uppercase">Humor Flavor</label>
                  <Link href={`/humor-flavors/${response.humor_flavor_id}`} className="text-blue-600 hover:underline text-sm font-medium">
                    View Flavor #{response.humor_flavor_id}
                  </Link>
                </div>
              )}
            </div>

            {/* Generated Output */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Output</span>
                Generated Captions
              </h3>
              {parsedCaptions.length > 0 ? (
                <ul className="space-y-2">
                  {parsedCaptions.map((caption, idx) => (
                    <li key={idx} className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-900 font-medium">
                      "{caption}"
                    </li>
                  ))}
                </ul>
              ) : (
                <pre className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono whitespace-pre-wrap">
                  {response.llm_model_response}
                </pre>
              )}
            </div>

            {/* Prompts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">System Prompt</h3>
                <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto border border-gray-700 shadow-inner">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {response.llm_system_prompt || 'No system prompt'}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">User Prompt</h3>
                <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto border border-gray-700 shadow-inner">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {response.llm_user_prompt}
                  </pre>
                </div>
              </div>
            </div>

            {/* Raw JSON Toggle (Optional details) */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2 select-none">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View Full Raw Data
              </summary>
              <div className="mt-4">
                <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </details>

          </div>
        </div>
      </div>
    </div>
  );
}
