import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import ResourceManager, { ColumnDef } from '@/components/ResourceManager';
import Link from 'next/link';
import { fetchResource } from '@/utils/query-helper';

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const columns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'number', editable: false },
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'llm_provider_id', label: 'Provider ID', type: 'number', required: true },
    { key: 'provider_model_id', label: 'Provider Model ID', type: 'text', required: true },
    { key: 'is_temperature_supported', label: 'Temp Supported', type: 'boolean' },
    { key: 'created_datetime_utc', label: 'Created At', type: 'datetime', editable: false },
  ];

  const { data, totalPages, hasNextPage, page } = await fetchResource(supabase, 'llm_models', params, columns);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>
        <ResourceManager
          tableName="llm_models"
          title="LLM Models"
          columns={columns}
          initialData={data || []}
          basePath="/llm-models"
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}
