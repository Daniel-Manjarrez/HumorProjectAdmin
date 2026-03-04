import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import AdvancedFilter from '@/components/AdvancedFilter';
import Pagination from '@/components/Pagination';

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const page = parseInt(params.page || '1');
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Sort
  const sortBy = params.sort_by || 'created_datetime_utc';
  const sortOrder = params.sort_order === 'asc';

  let query = supabase.from('profiles').select('*', { count: 'exact' });

  // Dynamic Filters
  // We iterate through known columns to see if they exist in params
  const columns = [
    { key: 'email', label: 'Email', type: 'text' as const },
    { key: 'first_name', label: 'First Name', type: 'text' as const },
    { key: 'last_name', label: 'Last Name', type: 'text' as const },
    { key: 'is_superadmin', label: 'Superadmin', type: 'boolean' as const },
    { key: 'created_datetime_utc', label: 'Created At', type: 'date' as const },
  ];

  columns.forEach(col => {
    const value = params[col.key];
    if (value) {
      if (col.type === 'boolean') {
        query = query.eq(col.key, value === 'true');
      } else if (col.type === 'date') {
        query = query.ilike(col.key, `${value}%`);
      } else {
        query = query.ilike(col.key, `%${value}%`);
      }
    }
  });

  // Sort
  query = query.order(sortBy, { ascending: sortOrder });

  // Pagination
  query = query.range(from, to);

  const { data: users, count, error } = await query;

  if (error) {
    return <div>Error loading users</div>;
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;
  const hasNextPage = page < totalPages;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Users</h1>

        <AdvancedFilter columns={columns} />

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Superadmin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link href={`/users/${user.id}`}>
                      {user.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.last_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.is_superadmin ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_datetime_utc).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/users/${user.id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} hasNextPage={hasNextPage} />
      </div>
    </div>
  );
}
