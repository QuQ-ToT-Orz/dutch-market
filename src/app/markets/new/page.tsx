'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Map from '@/components/Map';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const marketCategories = [
    'Fresh Produce',
    'Street Food',
    'Flowers',
    'Clothing',
    'Antiques',
    'Crafts',
    'Fish',
    'Cheese',
    'Other'
];

// Dutch postal code regex pattern
const postalCodePattern = '^[1-9][0-9]{3} ?[A-Za-z]{2}$';

export default function NewMarket() {
    const router = useRouter();
    const { user } = useAuth();
    const [location, setLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        postalCode: '',
        city: '',
        operatingDays: [] as string[],
        startTime: '09:00',
        endTime: '17:00',
        categories: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        router.push('/');
        return null;
    }

    // Add debounce function
    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Add geocoding function
    const geocodeAddress = async (address: string, postalCode: string, city: string) => {
        if (!address || !postalCode || !city) return;

        try {
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({
                address: `${address}, ${postalCode}, ${city}, Netherlands`
            });

            if (response.results[0]) {
                const { lat, lng } = response.results[0].geometry.location;
                setLocation({ lat: lat(), lng: lng() });
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    };

    // Debounced version of geocodeAddress
    const debouncedGeocodeAddress = debounce(geocodeAddress, 1000);

    // Update form data handler
    const handleFormChange = (field: string, value: string) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);

        // Trigger geocoding when address fields change
        if (['address', 'postalCode', 'city'].includes(field)) {
            debouncedGeocodeAddress(
                newFormData.address,
                newFormData.postalCode,
                newFormData.city
            );
        }
    };

    const handleMapClick = async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setLocation(newLocation);

        // Try to get address from coordinates
        try {
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({ location: newLocation });

            if (response.results[0]) {
                const addressComponents = response.results[0].address_components;
                let streetNumber = '';
                let streetName = '';
                let postalCode = '';
                let city = '';

                for (const component of addressComponents) {
                    const types = component.types;
                    if (types.includes('street_number')) {
                        streetNumber = component.long_name;
                    }
                    if (types.includes('route')) {
                        streetName = component.long_name;
                    }
                    if (types.includes('postal_code')) {
                        postalCode = component.long_name;
                    }
                    if (types.includes('locality')) {
                        city = component.long_name;
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    address: `${streetName} ${streetNumber}`.trim(),
                    postalCode,
                    city
                }));
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    const validatePostalCode = (postalCode: string) => {
        const regex = new RegExp(postalCodePattern);
        return regex.test(postalCode);
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            operatingDays: prev.operatingDays.includes(day)
                ? prev.operatingDays.filter(d => d !== day)
                : [...prev.operatingDays, day]
        }));
    };

    const handleCategoryToggle = (category: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submission started');

        if (!location) {
            setError('Please select a location on the map');
            return;
        }

        if (!validatePostalCode(formData.postalCode)) {
            setError('Please enter a valid Dutch postal code (e.g., 1234 AB)');
            return;
        }

        if (formData.operatingDays.length === 0) {
            setError('Please select at least one operating day');
            return;
        }

        if (formData.categories.length === 0) {
            setError('Please select at least one category');
            return;
        }

        setLoading(true);
        setError('');

        const marketData = {
            ...formData,
            location,
            createdBy: user?.uid,
            createdAt: new Date().toISOString(),
            verified: false
        };

        console.log('Submitting market data:', marketData);

        try {
            const docRef = await addDoc(collection(db, 'markets'), marketData);
            console.log('Market added with ID:', docRef.id);
            router.push('/markets');
            router.refresh(); // Force a refresh of the markets page
        } catch (error) {
            console.error('Error adding market:', error);
            setError(error instanceof Error ? error.message : 'Error adding market. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Add New Market</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Market Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border rounded"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Street Address *</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleFormChange('address', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                    placeholder="Street name and number"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Postal Code *</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => handleFormChange('postalCode', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                    placeholder="1234 AB"
                                    pattern={postalCodePattern}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">City *</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleFormChange('city', e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Operating Days *</label>
                            <div className="flex flex-wrap gap-2">
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleDayToggle(day)}
                                        className={`px-4 py-2 rounded ${formData.operatingDays.includes(day)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Opening Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Closing Time</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Categories *</label>
                            <div className="flex flex-wrap gap-2">
                                {marketCategories.map(category => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => handleCategoryToggle(category)}
                                        className={`px-4 py-2 rounded ${formData.categories.includes(category)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Select Location *</label>
                            <p className="text-sm text-gray-500 mb-2">
                                Click on the map to set the market location and automatically fill address details
                            </p>
                            <div className="h-[400px] rounded-lg overflow-hidden">
                                <Map
                                    markers={location ? [{ position: location, title: formData.name }] : []}
                                    onMapClick={handleMapClick}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <span className="mr-2">Adding Market...</span>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                'Add Market'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
