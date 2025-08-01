import React, { useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { languages } from "../data/languages";
import { TEXT } from "../data/text";
import { businessTypes } from "../data/businessType";
import "../../style/style.css";

const centerDefault = { lat: 32.0853, lng: 34.7818 };
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const libraries: "places"[] = ["places"];

function getDistanceFromLatLng(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const GoogleMapSearch: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const [mapCenter, setMapCenter] = useState(centerDefault);
  const [address, setAddress] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [lang, setLang] = useState("");
  const [radius, setRadius] = useState(3000);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const t = TEXT[lang as keyof typeof TEXT] || TEXT.en;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700) setToolbarOpen(true);
      else setToolbarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const location = results[0].geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
        if (mapRef.current) {
          mapRef.current.panTo(location);
        }
      } else {
        alert(t.noResults);
      }
    });
  };

  const handleFindMe = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (mapRef.current) {
          mapRef.current.panTo({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      },
      () => alert("Unable to fetch your location")
    );
  };

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !type) return;
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: mapCenter,
      radius,
      type: type as any,
      language: lang || "en",
    };
    service.nearbySearch(request, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results
      ) {
        const withDistance = results.map((p) => ({
          ...p,
          _distance: getDistanceFromLatLng(
            mapCenter.lat,
            mapCenter.lng,
            p.geometry?.location?.lat?.() ?? 0,
            p.geometry?.location?.lng?.() ?? 0
          ),
        }));
        withDistance.sort((a, b) => a._distance - b._distance);
        setPlaces(withDistance);
        setSelectedIndex(0);
      } else {
        setPlaces([]);
        setSelectedIndex(0);
      }
    });
  }, [isLoaded, mapCenter, type, radius, lang]);

  useEffect(() => {
    if (places.length > 0 && mapRef.current) {
      const place = places[selectedIndex];
      if (place) {
        mapRef.current.panTo({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  }, [selectedIndex, places]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Google Map…</div>;

  const selectedPlace = places[selectedIndex];
  const distanceToSelected =
    selectedPlace && mapCenter
      ? Math.round(
          getDistanceFromLatLng(
            mapCenter.lat,
            mapCenter.lng,
            selectedPlace.geometry.location.lat(),
            selectedPlace.geometry.location.lng()
          )
        )
      : null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Burger button for small screens */}
      <button
        className="burger-btn"
        aria-label={toolbarOpen ? t.close : "Show controls"}
        onClick={() => setToolbarOpen((v) => !v)}
      >
        {toolbarOpen ? "✖" : "☰"}
      </button>
      {/* Responsive Overlay Controls */}
      <form
        className={`overlay-controls${toolbarOpen ? " open" : ""}`}
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="">{t.selectLanguage}</option>
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{t.selectType}</option>
          {businessTypes.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <button type="submit">{t.search}</button>
        <button type="button" onClick={handleFindMe}>
          {t.findMe}
        </button>
        <div className="radius-control">
          <label htmlFor="radius">{t.radius}:</label>
          <input
            type="range"
            min={500}
            max={15000}
            step={500}
            value={radius}
            id="radius"
            onChange={(e) => setRadius(Number(e.target.value))}
          />
          <span>
            {radius} {t.meters}
          </span>
        </div>
      </form>
      {/* Business Navigation Bar */}
      {places.length > 0 && (
        <div className="business-nav-bar">
          <button
            onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
            disabled={selectedIndex === 0}
            aria-label={t.prev}
          >
            {t.prev}
          </button>
          <div>
            <b>{selectedPlace?.name}</b>
            <br />
            {distanceToSelected !== null && (
              <span>
                {t.distance}: {distanceToSelected} {t.meters}
              </span>
            )}
          </div>
          <button
            onClick={() =>
              setSelectedIndex((i) => Math.min(places.length - 1, i + 1))
            }
            disabled={selectedIndex === places.length - 1}
            aria-label={t.next}
          >
            {t.next}
          </button>
        </div>
      )}
      <GoogleMap
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        center={
          selectedPlace
            ? {
                lat: selectedPlace.geometry.location.lat(),
                lng: selectedPlace.geometry.location.lng(),
              }
            : mapCenter
        }
        zoom={14}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        <Marker
          position={mapCenter}
          icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
        />
        {places.map((place, idx) => (
          <Marker
            key={place.place_id}
            position={{
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }}
            title={place.name}
            icon={{
              url:
                idx === selectedIndex
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapSearch;
