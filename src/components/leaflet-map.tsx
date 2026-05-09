"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// This component uses raw Leaflet to ensure maximum control over map initialization
// and cleanup, which prevents the "Map container is already initialized" error
// that often occurs with react-leaflet in React 18 Strict Mode and Next.js HMR.
export default function LeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Ensure we don't initialize the map twice on the same element
    if (mapInstanceRef.current) return;

    // Additional safety check: Leaflet attaches a _leaflet_id to the container.
    // If it exists, it means a previous instance wasn't cleaned up correctly.
    if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [40.865, -73.827], // Bronx, NY coordinates
        zoom: 14,
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: false, // Prevent accidental zooming while scrolling the page
      });

      // Dark Mode CartoDB Map Tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      // Location Marker
      L.circleMarker([40.865, -73.827], {
        color: "#a8e6fd",
        fillColor: "#a8e6fd",
        fillOpacity: 0.7,
        radius: 8
      }).addTo(map);

      mapInstanceRef.current = map;
    } catch (error) {
      console.error("Error initializing Leaflet map:", error);
    }

    // Explicit cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className="leaflet-map-container"
      style={{ 
        height: "100%", 
        width: "100%", 
        backgroundColor: "#0b0f10",
        zIndex: 1
      }} 
    />
  );
}
