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
    { key: 'image_description', label: 'Image Desc', type: 'textarea', required: true },
    { key: 'caption', label: 'Caption', type: 'textarea', required: true },
    { key: 'explanation', label: 'Explanation', type: 'textarea', required: true },
    { key: 'priority', label: 'Priority', type: 'number' },
    { key: 'image_id', label: 'Image ID', type: 'text' },
    { key: 'created_datetime_utc', label: 'Created At', type: 'datetime', editable: false },
  ];

  const { data, totalPages, hasNextPage, page } = await fetchResource(supabase, 'caption_examples', params, columns);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>
        <ResourceManager
          tableName="caption_examples"
          title="Caption Examples"
          columns={columns}
          initialData={data || []}
          basePath="/caption-examples"
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}
