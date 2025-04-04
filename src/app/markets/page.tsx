'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Map from '@/components/Map';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface Market {
    id: string;
    name: string;
    description: string;
    address: string;
    postalCode: string;
    city: string;
    location: {
        lat: number;
        lng: number;
    };
    operatingDays: string[];
    startTime: string;
    endTime: string;
    categories: string[];
    createdBy: string;
}

export default function Markets() {
    const router = useRouter();
    const { user } = useAuth();
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchMarkets();
    }, []);

    const fetchMarkets = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'markets'));
            const marketsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Market[];
            setMarkets(marketsData);
        } catch (error) {
            console.error('Error fetching markets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMarket = async (marketId: string) => {
        if (!confirm('Are you sure you want to delete this market?')) return;

        setDeleteLoading(marketId);
        try {
            await deleteDoc(doc(db, 'markets', marketId));
            setMarkets(markets.filter(market => market.id !== marketId));
        } catch (error) {
            console.error('Error deleting market:', error);
            alert('Error deleting market. Please try again.');
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Local Markets</h1>
                    {user && (
                        <button
                            onClick={() => router.push('/markets/new')}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Add New Market
                        </button>
                    )}
                </div>

                <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                    <Map
                        markers={markets.map(market => ({
                            position: market.location,
                            title: market.name
                        }))}
                    />
                </div>

                {loading ? (
                    <div className="text-center">Loading markets...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {markets.map(market => (
                            <div key={market.id} className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-2">{market.name}</h2>
                                <p className="text-gray-600 mb-4">{market.description}</p>

                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-700">Address:</h3>
                                    <p className="text-gray-600">{market.address}</p>
                                    <p className="text-gray-600">{market.postalCode}</p>
                                    <p className="text-gray-600">{market.city}</p>
                                </div>

                                <div className="mb-2">
                                    <h3 className="font-semibold text-gray-700">Operating Days:</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {market.operatingDays.map(day => (
                                            <span key={day} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <h3 className="font-semibold text-gray-700">Hours:</h3>
                                    <p className="text-gray-600">
                                        {market.startTime} - {market.endTime}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-700">Categories:</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {market.categories.map(category => (
                                            <span key={category} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {user && market.createdBy === user.uid && (
                                    <button
                                        onClick={() => handleDeleteMarket(market.id)}
                                        className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200 disabled:bg-red-300"
                                        disabled={deleteLoading === market.id}
                                    >
                                        {deleteLoading === market.id ? 'Deleting...' : 'Delete Market'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
