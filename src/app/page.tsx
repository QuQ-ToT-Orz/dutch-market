'use client';

import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          Discover Local Markets in the Netherlands
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          Find the best local markets, their schedules, and get recommendations from other visitors.
        </p>

        {!user ? (
          <div className="text-center mt-8 bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">
              Sign in to add markets and share your recommendations!
            </p>
            <p className="text-sm text-gray-500">
              Join our community to discover and share the best local markets across the Netherlands.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Add a Market</h2>
              <p className="text-gray-600 mb-4">
                Know a great market? Share it with the community!
              </p>
              <Link href="/markets/new" className="text-blue-500 hover:text-blue-600">
                Add Market →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Browse Markets</h2>
              <p className="text-gray-600 mb-4">
                Discover markets in your area and read recommendations.
              </p>
              <Link href="/markets" className="text-blue-500 hover:text-blue-600">
                Browse Markets →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
