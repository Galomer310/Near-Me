import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

const MapboxMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lng: number; lat: number }>({
    lng: 34.7818,
    lat: 32.0853,
  }); // Default to Tel Aviv
  const [loadingAddr, setLoadingAddr] = useState(false);

  // Initialize the map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [coords.lng, coords.lat],
      zoom: 14,
    });
    marker.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map.current);
  }, []);

  // Update map and marker when coords change
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter([coords.lng, coords.lat]);
    if (marker.current) {
      marker.current.setLngLat([coords.lng, coords.lat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map.current);
    }
  }, [coords]);

  // Handle address search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    // Call Mapbox Geocoding API
    const resp = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await resp.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      setCoords({ lng, lat });
    } else {
      alert("Address not found!");
    }
  };

  // Handle generate address from geolocation
  const handleGenerateAddress = async () => {
    setLoadingAddr(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude, latitude } = pos.coords;
        // Reverse-geocode to address
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await resp.json();
        if (data.features && data.features.length > 0) {
          // Use the formatted place name (e.g., "123 Main St, City, Country")
          setAddress(data.features[0].place_name);
        } else {
          alert("Could not suggest your location as an address.");
        }
        setLoadingAddr(false);
      },
      (err) => {
        alert("Could not get your location.");
        setLoadingAddr(false);
      }
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          marginBottom: 12,
          gap: 8,
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter address or city..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ flex: 1, minWidth: 0, padding: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Search
        </button>
        <button
          type="button"
          onClick={handleGenerateAddress}
          style={{ padding: "8px 16px" }}
          disabled={loadingAddr}
        >
          {loadingAddr ? "Getting..." : "Generate Address"}
        </button>
      </form>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: 8,
          margin: "0 auto",
        }}
      />
    </div>
  );
};

export default MapboxMap;
