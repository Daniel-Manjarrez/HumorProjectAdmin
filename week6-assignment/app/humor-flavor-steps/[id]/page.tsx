import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';

export default async function HumorFlavorStepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: step, error } = await supabase
    .from('humor_flavor_steps')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !step) {
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
          <BackButton fallbackUrl="/humor-flavor-steps" label="Back to Flavor Steps" />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Humor Flavor Step Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">ID: {step.id}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Flavor ID</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{step.humor_flavor_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Order</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{step.order_by}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Model ID</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{step.llm_model_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Temperature</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{step.llm_temperature ?? 'Default'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">System Prompt</label>
                <pre className="mt-1 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono transition-colors">
                  {step.llm_system_prompt}
                </pre>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">User Prompt</label>
                <pre className="mt-1 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono transition-colors">
                  {step.llm_user_prompt}
                </pre>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Raw Data</h3>
              <pre className="bg-gray-900 text-gray-100 dark:bg-gray-950 dark:text-gray-300 p-4 rounded-lg overflow-x-auto text-sm transition-colors">
                {JSON.stringify(step, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
