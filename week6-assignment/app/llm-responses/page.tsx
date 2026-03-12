import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import ResourceManager, { ColumnDef } from '@/components/ResourceManager';
import Link from 'next/link';

export default async function Page() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('llm_model_responses')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

  if (error) return <div>Error loading data</div>;

  const columns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'text', editable: false },
    { key: 'llm_model_id', label: 'Model ID', type: 'number', editable: false },
    { key: 'llm_user_prompt', label: 'Prompt', type: 'textarea', editable: false },
    { key: 'llm_model_response', label: 'Response', type: 'textarea', editable: false },
    { key: 'processing_time_seconds', label: 'Time (s)', type: 'number', editable: false },
    { key: 'created_datetime_utc', label: 'Created At', type: 'datetime', editable: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>
        <ResourceManager
          tableName="llm_model_responses"
          title="LLM Responses"
          columns={columns}
          initialData={data || []}
        />
      </div>
    </div>
  );
}
