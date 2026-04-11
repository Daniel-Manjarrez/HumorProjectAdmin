import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';

export default async function PromptChainDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: chain, error } = await supabase
    .from('llm_prompt_chains')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !chain) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto relative pt-8">
        <div className="absolute -top-8 right-0 flex items-center gap-4 z-10">
          <ThemeToggle />
          <SignOutButton />
        </div>
        <div className="mb-8">
          <BackButton fallbackUrl="/prompt-chains" label="Back to Prompt Chains" />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Chain Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">ID: {chain.id}</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Caption Request ID</label>
              <div className="mt-1">
                <Link
                  href={`/caption-requests/${chain.caption_request_id}`}
                  className="text-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  {chain.caption_request_id}
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {new Date(chain.created_datetime_utc).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Raw Data</h3>
              <pre className="bg-gray-900 text-gray-100 dark:bg-gray-950 dark:text-gray-300 p-4 rounded-lg overflow-x-auto text-sm transition-colors">
                {JSON.stringify(chain, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
