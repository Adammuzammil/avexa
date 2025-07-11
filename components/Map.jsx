"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const Map = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    // Disable telemetry
    mapboxgl.prewarm();

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [74.7454, 13.3318],
      zoom: 9,
      // Disable telemetry collection
      trackResize: false,
      collectResourceTiming: false,
    });

    // new mapboxgl.Marker({
    //   color: "black",
    //   rotation: 45,
    //   anchor: "bottom",
    // })
    //   .setLngLat([74.7454, 13.3318])
    //   //   .setOffset([0, -30])
    //   //   .setDraggable(true)
    //   .addTo(mapRef.current);

    mapRef.current.on("load", () => {
      const popup = new mapboxgl.Popup()
        .setLngLat([74.7454, 13.3318])
        .setHTML(
          `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">📍 Bangalore</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Welcome to the Silicon Valley of India!
            </p>
            <button onclick="console.log('Button clicked!')" 
                    style="margin-top: 10px; padding: 5px 10px; background: #007cbf; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Learn More
            </button>
          </div>
        `
        )
        .addTo(mapRef.current);
    });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div
      style={{ width: "100%", height: "400px" }}
      ref={mapContainerRef}
      className="map-container"
    />
  );
};

export default Map;
