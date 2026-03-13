import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

export default async function LLMModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const { id } = await params;

  const { data: model, error } = await supabase
    .from('llm_models')
    .select(`
      *,
      llm_providers (
        name
      )
    `)
    .eq('id', id)
    .single();

  if (error || !model) {
    notFound();
  }

  // Handle nested relation
  const providerName = Array.isArray(model.llm_providers)
    ? model.llm_providers[0]?.name
    : (model.llm_providers as any)?.name;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <BackButton fallbackUrl="/llm-models" label="Back to Models" />
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">LLM Model Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {model.id}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-xl font-bold text-gray-900">{model.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Provider</label>
                <div className="mt-1">
                  <Link
                    href={`/llm-providers/${model.llm_provider_id}`}
                    className="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {providerName || `Provider ID: ${model.llm_provider_id}`}
                  </Link>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Provider Model ID</label>
                <p className="mt-1 text-lg text-gray-900 font-mono bg-gray-50 p-2 rounded inline-block">
                  {model.provider_model_id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Temperature Support</label>
                <div className="mt-1">
                  {model.is_temperature_supported ? (
                    <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                      Yes
                    </span>
                  ) : (
                    <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                      No
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(model.created_datetime_utc).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Raw Data</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(model, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
