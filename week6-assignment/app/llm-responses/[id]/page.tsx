import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';

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

  // Try to parse the response if it looks like JSON
  let parsedResponse = null;
  let usage = null;
  let finishReason = null;

  try {
    if (response.llm_model_response && (response.llm_model_response.startsWith('{') || response.llm_model_response.startsWith('['))) {
      parsedResponse = JSON.parse(response.llm_model_response);

      // Common locations for usage stats (OpenAI/Anthropic style)
      usage = parsedResponse.usage || parsedResponse.token_usage;
      finishReason = parsedResponse.finish_reason || parsedResponse.choices?.[0]?.finish_reason;
    }
  } catch (e) {
    // Not valid JSON, ignore
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto relative pt-8">
        <div className="absolute -top-8 right-0 flex items-center gap-4 z-10">
          <ThemeToggle />
          <SignOutButton />
        </div>
        <div className="mb-8">
          <BackButton fallbackUrl="/llm-responses" label="Back to Responses" />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LLM Response Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">ID: {response.id}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Model ID</label>
                <div className="mt-1">
                  <Link
                    href={`/llm-models/${response.llm_model_id}`}
                    className="text-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {response.llm_model_id}
                  </Link>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Processing Time</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{response.processing_time_seconds} seconds</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">
                  {new Date(response.created_datetime_utc).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Extracted Metadata Section */}
            {(usage || finishReason) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-3">Response Metadata</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {usage && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-blue-600 dark:text-blue-500">Prompt Tokens</label>
                        <p className="text-blue-900 dark:text-blue-300 font-mono text-lg">{usage.prompt_tokens || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-600 dark:text-blue-500">Completion Tokens</label>
                        <p className="text-blue-900 dark:text-blue-300 font-mono text-lg">{usage.completion_tokens || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-600 dark:text-blue-500">Total Tokens</label>
                        <p className="text-blue-900 dark:text-blue-300 font-mono text-lg font-bold">{usage.total_tokens || '-'}</p>
                      </div>
                    </>
                  )}
                  {finishReason && (
                    <div>
                      <label className="block text-xs font-medium text-blue-600 dark:text-blue-500">Finish Reason</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 mt-1 transition-colors">
                        {finishReason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User Prompt</label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto transition-colors">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                    {response.llm_user_prompt}
                  </pre>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Model Output</label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto transition-colors">
                  {parsedResponse ? (
                    // If it was JSON, show pretty printed JSON or the 'text' field if available
                    <div className="space-y-4">
                      {parsedResponse.choices?.[0]?.message?.content && (
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Extracted Content</p>
                          <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-sans">
                            {parsedResponse.choices[0].message.content}
                          </pre>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Full Response Object</p>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                          {JSON.stringify(parsedResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                      {response.llm_model_response}
                    </pre>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Raw DB Record</h3>
              <pre className="bg-gray-900 text-gray-100 dark:bg-gray-950 dark:text-gray-300 p-4 rounded-lg overflow-x-auto text-sm transition-colors">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
