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
    { key: 'id', label: 'ID', type: 'number', editable: false },
    { key: 'humor_flavor_id', label: 'Flavor ID', type: 'number', required: true },
    { key: 'caption_count', label: 'Caption Count', type: 'number', required: true },
    { key: 'created_datetime_utc', label: 'Created At', type: 'datetime', editable: false },
  ];

  const { data, totalPages, hasNextPage, page } = await fetchResource(supabase, 'humor_flavor_mix', params, columns);

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
          tableName="humor_flavor_mix"
          title="Humor Flavor Mix"
          columns={columns}
          initialData={data || []}
          basePath="/humor-mix"
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}
