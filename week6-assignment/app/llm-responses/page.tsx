import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import ResourceManager, { ColumnDef } from '@/components/ResourceManager';
import Link from 'next/link';
import { fetchResource } from '@/utils/query-helper';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';
import { ArrowLeft } from 'lucide-react';

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const columns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'text', editable: false },
    { key: 'llm_model_id', label: 'Model ID', type: 'number', editable: false },
    { key: 'llm_user_prompt', label: 'Prompt', type: 'textarea', editable: false },
    { key: 'llm_model_response', label: 'Response', type: 'textarea', editable: false },
    { key: 'processing_time_seconds', label: 'Time (s)', type: 'number', editable: false },
    { key: 'created_datetime_utc', label: 'Created At', type: 'datetime', editable: false },
  ];

  const { data, totalPages, hasNextPage, page } = await fetchResource(supabase, 'llm_model_responses', params, columns);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto relative pt-8">
        <div className="absolute -top-8 right-0 flex items-center gap-4 z-10">
          <ThemeToggle />
          <SignOutButton />
        </div>
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
        <ResourceManager
          tableName="llm_model_responses"
          title="LLM Responses"
          columns={columns}
          initialData={data || []}
          basePath="/llm-responses"
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}