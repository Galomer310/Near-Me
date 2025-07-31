import React, { useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

// Supported languages (expand as needed)
const languages = [
  { label: "English", value: "en" },
  { label: "עברית", value: "he" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Deutsch", value: "de" },
  // add more if you like
];

// Simple translation dictionary
const TEXT = {
  en: {
    searchPlaceholder: "Enter address or city...",
    selectType: "What are you looking for?",
    selectLanguage: "Language",
    search: "Search",
    findMe: "Find Me",
    radius: "Radius",
    meters: "meters",
    noResults: "No results found",
  },
  he: {
    searchPlaceholder: "הכנס כתובת או עיר...",
    selectType: "מה אתה מחפש?",
    selectLanguage: "שפה",
    search: "חפש",
    findMe: "מצא אותי",
    radius: "רדיוס",
    meters: "מטרים",
    noResults: "לא נמצאו תוצאות",
  },
  es: {
    searchPlaceholder: "Ingrese dirección o ciudad...",
    selectType: "¿Qué buscas?",
    selectLanguage: "Idioma",
    search: "Buscar",
    findMe: "Encuéntrame",
    radius: "Radio",
    meters: "metros",
    noResults: "No se encontraron resultados",
  },
  fr: {
    searchPlaceholder: "Entrez une adresse ou une ville...",
    selectType: "Que cherchez-vous ?",
    selectLanguage: "Langue",
    search: "Rechercher",
    findMe: "Me localiser",
    radius: "Rayon",
    meters: "mètres",
    noResults: "Aucun résultat trouvé",
  },
  de: {
    searchPlaceholder: "Adresse oder Stadt eingeben...",
    selectType: "Was suchen Sie?",
    selectLanguage: "Sprache",
    search: "Suchen",
    findMe: "Finde mich",
    radius: "Radius",
    meters: "Meter",
    noResults: "Keine Ergebnisse gefunden",
  },
};

const businessTypes = [
  { label: "Gas Station", value: "gas_station" },
  { label: "Spa", value: "spa" },
  { label: "Grocery Store", value: "grocery_or_supermarket" },
  { label: "Supermarket", value: "supermarket" },
  { label: "Convenience Store", value: "convenience_store" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Doctor", value: "doctor" },
  { label: "Hospital", value: "hospital" },
  { label: "Dentist", value: "dentist" },
  { label: "Veterinary Care", value: "veterinary_care" },
  { label: "Bank", value: "bank" },
  { label: "ATM", value: "atm" },
  { label: "Post Office", value: "post_office" },
  { label: "Clothing Store", value: "clothing_store" },
  { label: "Shoe Store", value: "shoe_store" },
  { label: "Jewelry Store", value: "jewelry_store" },
  { label: "Book Store", value: "book_store" },
  { label: "Electronics Store", value: "electronics_store" },
  { label: "Hardware Store", value: "hardware_store" },
  { label: "Furniture Store", value: "furniture_store" },
  { label: "Pet Store", value: "pet_store" },
  { label: "Car Dealer", value: "car_dealer" },
  { label: "Car Wash", value: "car_wash" },
  { label: "Laundry", value: "laundry" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Cafe", value: "cafe" },
  { label: "Bakery", value: "bakery" },
  { label: "Bar", value: "bar" },
  { label: "Fast Food", value: "meal_takeaway" },
  { label: "Pizza", value: "meal_delivery" },
  { label: "Hotel", value: "hotel" },
  { label: "Motel", value: "lodging" },
  { label: "Gym", value: "gym" },
  { label: "Park", value: "park" },
  { label: "Shopping Mall", value: "shopping_mall" },
  { label: "Beauty Salon", value: "beauty_salon" },
  { label: "Hair Care", value: "hair_care" },
  { label: "Barber Shop", value: "hair_care" },
  { label: "Airport", value: "airport" },
  { label: "Parking", value: "parking" },
  { label: "Bus Station", value: "bus_station" },
  { label: "Subway Station", value: "subway_station" },
  { label: "Taxi Stand", value: "taxi_stand" },
  { label: "Movie Theater", value: "movie_theater" },
  { label: "Museum", value: "museum" },
  { label: "Art Gallery", value: "art_gallery" },
  { label: "Library", value: "library" },
  { label: "School", value: "school" },
  { label: "University", value: "university" },
];

const centerDefault = { lat: 32.0853, lng: 34.7818 }; // Tel Aviv default

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const libraries: "places"[] = ["places"];

const GoogleMapSearch: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const [mapCenter, setMapCenter] = useState(centerDefault);
  const [address, setAddress] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [type, setType] = useState(""); // Empty default
  const [lang, setLang] = useState(""); // Empty default
  const [radius, setRadius] = useState(3000);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Change all text based on language (default: English)
  const t = TEXT[lang as keyof typeof TEXT] || TEXT.en;

  // Handle address search
  const handleSearch = async (e: React.FormEvent) => {
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

  // Find Me: Use geolocation to set map center
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

  // Handle place search when mapCenter/type/radius changes
  React.useEffect(() => {
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
        setPlaces(results);
      } else {
        setPlaces([]);
      }
    });
  }, [isLoaded, mapCenter, type, radius, lang]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Google Map…</div>;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Overlay Controls */}
      <form
        onSubmit={handleSearch}
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "row",
          gap: 8,
          background: "rgba(255,255,255,0.93)",
          borderRadius: 12,
          padding: 8,
          boxShadow: "0 2px 16px 0 rgba(0,0,0,0.09)",
          alignItems: "center",
          minWidth: 300,
          maxWidth: "90vw",
        }}
      >
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 16,
            outline: "none",
          }}
        />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 16,
            background: "white",
            outline: "none",
          }}
        >
          <option value="">{t.selectLanguage}</option>
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 16,
            background: "white",
            outline: "none",
          }}
        >
          <option value="">{t.selectType}</option>
          {businessTypes.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            background: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t.search}
        </button>
        <button
          type="button"
          onClick={handleFindMe}
          style={{
            padding: "8px 14px",
            background: "#34A853",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t.findMe}
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: 8,
          }}
        >
          <label htmlFor="radius" style={{ fontSize: 14 }}>
            {t.radius}:
          </label>
          <input
            type="range"
            min={500}
            max={15000}
            step={500}
            value={radius}
            id="radius"
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ accentColor: "#4285F4" }}
          />
          <span style={{ fontSize: 13 }}>
            {radius} {t.meters}
          </span>
        </div>
      </form>

      <GoogleMap
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        center={mapCenter}
        zoom={14}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        <Marker
          position={mapCenter}
          icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
        />
        {places.map((place) => (
          <Marker
            key={place.place_id}
            position={{
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }}
            title={place.name}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapSearch;
