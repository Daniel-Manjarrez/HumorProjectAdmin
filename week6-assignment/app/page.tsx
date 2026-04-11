import { requireAdmin } from '@/utils/auth';
import Link from 'next/link';
import CardShuffle from '@/components/CardShuffle';
import { getStats } from '@/app/stats/actions';
import SignOutButton from '@/components/SignOutButton';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Dashboard() {
  const user = await requireAdmin();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto relative pt-8">
        <div className="absolute -top-8 right-0 flex items-center gap-4 z-10">
          <ThemeToggle />
          <SignOutButton />
        </div>

        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">
              Welcome back, {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Core Management */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">Core</h3>
            <Link href="/users" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-blue-700 dark:text-blue-400 font-medium">
              Manage Users
            </Link>
            <Link href="/images" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-green-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-green-700 dark:text-green-400 font-medium">
              Manage Images
            </Link>
            <Link href="/captions" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-purple-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-purple-700 dark:text-purple-400 font-medium">
              Manage Captions
            </Link>
          </div>

          {/* Configuration */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">Config</h3>
            <Link href="/humor-mix" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Humor Mix
            </Link>
            <Link href="/terms" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Terms
            </Link>
            <Link href="/caption-examples" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Caption Examples
            </Link>
            <Link href="/humor-flavors" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Humor Flavors
            </Link>
            <Link href="/humor-flavor-steps" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Flavor Steps
            </Link>
          </div>

          {/* LLM Settings */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">LLM</h3>
            <Link href="/llm-models" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Models
            </Link>
            <Link href="/llm-providers" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Providers
            </Link>
            <Link href="/llm-responses" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              LLM Responses
            </Link>
            <Link href="/prompt-chains" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Prompt Chains
            </Link>
          </div>

          {/* Auth & System */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm">System</h3>
            <Link href="/signup-domains" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Signup Domains
            </Link>
            <Link href="/whitelist-emails" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Whitelist Emails
            </Link>
            <Link href="/caption-requests" className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Caption Requests
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Statistics</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Select a card to view detailed statistics.
          </p>
          <CardShuffle stats={stats as any} />
        </div>

      </div>
    </div>
  );
}
