import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import ResourceManager, { ColumnDef } from '@/components/ResourceManager';
import Link from 'next/link';

export default async function Page() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('whitelist_email_addresses')
    .select('*')
    .order('id', { ascending: true });

  if (error) return <div>Error loading data</div>;

  const columns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'number', editable: false },
    { key: 'email', label: 'Email', type: 'text', required: true },
    { key: 'created_datetime_utc', label: 'Created At', type: 'datetime', editable: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>
        <ResourceManager
          tableName="whitelist_email_addresses"
          title="Whitelist Emails"
          columns={columns}
          initialData={data || []}
        />
      </div>
    </div>
  );
}
