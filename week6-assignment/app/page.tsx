import { requireAdmin } from '@/utils/auth';
import Link from 'next/link';
import CardShuffle from '@/components/CardShuffle';
import { getStats } from '@/app/stats/actions';

export default async function Dashboard() {
  const user = await requireAdmin();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-xl text-gray-500">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/users"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Manage Users
            </Link>
            <Link
              href="/images"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              Manage Images
            </Link>
            <Link
              href="/captions"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              Manage Captions
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistics</h2>
            <p className="text-gray-600 mb-8">
              Select a card to view detailed statistics.
            </p>
            <CardShuffle stats={stats as any} />
          </div>
        </div>

      </div>
    </div>
  );
}
