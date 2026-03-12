import { requireAdmin } from '@/utils/auth';
import Link from 'next/link';
import CardShuffle from '@/components/CardShuffle';
import { getStats } from '@/app/stats/actions';
import SignOutButton from '@/components/SignOutButton';

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
          <SignOutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Core Management */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">Core</h3>
            <Link href="/users" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all border border-gray-200 text-blue-700 font-medium">
              Manage Users
            </Link>
            <Link href="/images" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-green-50 transition-all border border-gray-200 text-green-700 font-medium">
              Manage Images
            </Link>
            <Link href="/captions" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-purple-50 transition-all border border-gray-200 text-purple-700 font-medium">
              Manage Captions
            </Link>
          </div>

          {/* Configuration */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">Config</h3>
            <Link href="/humor-mix" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Humor Mix
            </Link>
            <Link href="/terms" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Terms
            </Link>
            <Link href="/caption-examples" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Caption Examples
            </Link>
            <Link href="/humor-flavors" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Humor Flavors
            </Link>
            <Link href="/humor-flavor-steps" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Flavor Steps
            </Link>
          </div>

          {/* LLM Settings */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">LLM</h3>
            <Link href="/llm-models" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Models
            </Link>
            <Link href="/llm-providers" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Providers
            </Link>
            <Link href="/llm-responses" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              LLM Responses
            </Link>
            <Link href="/prompt-chains" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Prompt Chains
            </Link>
          </div>

          {/* Auth & System */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">System</h3>
            <Link href="/signup-domains" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Signup Domains
            </Link>
            <Link href="/whitelist-emails" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Whitelist Emails
            </Link>
            <Link href="/caption-requests" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900">
              Caption Requests
            </Link>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistics</h2>
          <p className="text-gray-600 mb-8">
            Select a card to view detailed statistics.
          </p>
          <CardShuffle stats={stats as any} />
        </div>

      </div>
    </div>
  );
}
