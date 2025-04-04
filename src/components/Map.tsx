'use client';

import { useEffect, useState } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = {
    lat: 52.3676,
    lng: 4.9041  // Amsterdam center
};

interface MapProps {
    markers?: Array<{
        position: google.maps.LatLngLiteral;
        title: string;
    }>;
    onMapClick?: (e: google.maps.MapMouseEvent) => void;
}

export default function Map({ markers = [], onMapClick }: MapProps) {
    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={11}
            onClick={onMapClick}
        >
            {markers.map((marker, index) => (
                <MarkerF
                    key={index}
                    position={marker.position}
                    title={marker.title}
                />
            ))}
        </GoogleMap>
    );
}
