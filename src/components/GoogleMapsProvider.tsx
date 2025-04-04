'use client';

import { createContext, useContext, ReactNode } from 'react';
import { LoadScript } from '@react-google-maps/api';

const GoogleMapsContext = createContext({});

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMapsContext.Provider value={{}}>
                {children}
            </GoogleMapsContext.Provider>
        </LoadScript>
    );
}
