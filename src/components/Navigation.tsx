'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
    const { user, signInWithGoogle, logout } = useAuth();

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-xl font-bold text-gray-800">
                            Dutch Markets
                        </Link>
                        {user && (
                            <>
                                <Link href="/markets/new" className="text-gray-600 hover:text-gray-900">
                                    Add Market
                                </Link>
                                <Link href="/markets" className="text-gray-600 hover:text-gray-900">
                                    Browse Markets
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={user.photoURL || '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-gray-700">{user.displayName}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
                            >
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
