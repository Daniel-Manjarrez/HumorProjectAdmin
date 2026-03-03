import { requireAdmin } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import SearchFilter from '@/components/SearchFilter';
import Pagination from '@/components/Pagination';

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireAdmin();
  const supabase = await createClient();
  const params = await searchParams;

  const search = params.search;
  const sort = params.sort || 'newest';
  const role = params.role;
  const page = parseInt(params.page || '1');
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('profiles').select('*', { count: 'exact' });

  // Search
  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  // Filter
  if (role === 'superadmin') {
    query = query.eq('is_superadmin', true);
  } else if (role === 'user') {
    query = query.eq('is_superadmin', false);
  }

  // Sort
  if (sort === 'oldest') {
    query = query.order('created_datetime_utc', { ascending: true });
  } else if (sort === 'email_asc') {
    query = query.order('email', { ascending: true });
  } else if (sort === 'email_desc') {
    query = query.order('email', { ascending: false });
  } else {
    // Default: newest
    query = query.order('created_datetime_utc', { ascending: false });
  }

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

        <SearchFilter
          placeholder="Search by email..."
          sortOptions={[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'oldest' },
            { label: 'Email (A-Z)', value: 'email_asc' },
            { label: 'Email (Z-A)', value: 'email_desc' },
          ]}
          filters={[
            {
              key: 'role',
              label: 'Role',
              options: [
                { label: 'Superadmin', value: 'superadmin' },
                { label: 'User', value: 'user' },
              ]
            }
          ]}
        />

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
