import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import ResourceManager, { ColumnDef } from '@/components/ResourceManager';
import Link from 'next/link';

export default async function Page() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('caption_requests')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

  if (error) return <div>Error loading data</div>;

  const columns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'number', editable: false },
    { key: 'profile_id', label: 'Profile ID', type: 'text', editable: false },
    { key: 'image_id', label: 'Image ID', type: 'text', editable: false },
    { key: 'created_datetime_utc', label: 'Created At', type: 'datetime', editable: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>
        <ResourceManager
          tableName="caption_requests"
          title="Caption Requests"
          columns={columns}
          initialData={data || []}
        />
      </div>
    </div>
  );
}
