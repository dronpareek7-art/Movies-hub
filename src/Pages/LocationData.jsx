import { useState } from "react";

function LocationData() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theatres, setTheatres] = useState([]);
  const [loadingTheatre, setLoadingTheatre] = useState(false);

  const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

  async function reverseGeocode(lat, lng) {
    if (OPENCAGE_API_KEY) {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data || !data.results?.length || data.status?.code !== 200) {
        throw new Error(data.status?.message || "OpenCage reverse geocode failed");
      }
      const components = data.results[0].components;
      return (
        components.city ||
        components.town ||
        components.village ||
        components.hamlet ||
        components.suburb ||
        components.county ||
        components.municipality ||
        components.state ||
        components.region ||
        data.results[0].formatted ||
        ""
      );
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`;
    const res = await fetch(nominatimUrl, {
      headers: {
        "Accept-Language": "en",
      },
    });
    const data = await res.json();
    if (!data || !data.address) {
      throw new Error("Nominatim reverse geocode failed");
    }
    const address = data.address;
    return (
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.suburb ||
      address.county ||
      address.municipality ||
      address.state ||
      address.region ||
      data.display_name?.split(",")[0] ||
      ""
    );
  }

  async function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser.");
        reject(new Error("Geolocation not supported"));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            setLocation({ lat, lng });

            try {
              const cityName = await reverseGeocode(lat, lng);
              if (cityName) {
                setCity(cityName);
                setError(null);
              } else {
                setCity("");
                setError("Unable to determine city from coordinates.");
              }
            } catch (geocodeError) {
              setCity("");
              setError(geocodeError.message || "Unable to determine city.");
            }

            resolve({ lat, lng });
          } catch (err) {
            setError("Error fetching location data.");
            reject(err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setLoading(false);
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError("User denied the request for Geolocation.");
              break;
            case err.POSITION_UNAVAILABLE:
              setError("Location information is unavailable.");
              break;
            case err.TIMEOUT:
              setError("The request to get user location timed out.");
              break;
            default:
              setError("An unknown error occurred.");
              break;
          }
          reject(err);
        },
        {
          enableHighAccuracy: true, 
          timeout: 15000, // 10 seconds
          maximumAge: 300000, 
        }
      );
    });
  }
 async function getNearestTheatres(coords) {
  const lat = coords?.lat;
  const lng = coords?.lng;

  setLoadingTheatre(true);
  setError(null);

  const cityQuery = city && city.trim() ? city.replace(/"/g, "") : "";
  const areaQuery = cityQuery
    ? `
      [out:json][timeout:25];
      area["name"="${cityQuery}"]["boundary"="administrative"]["admin_level"~"[45678]"];
      (
        node["amenity"="cinema"](area);
        way["amenity"="cinema"](area);
        relation["amenity"="cinema"](area);
      );
      out center;
    `
    : null;

  const aroundQuery = lat != null && lng != null
    ? `
      [out:json][timeout:25];
      (
        node["amenity"="cinema"](around:20000,${lat},${lng});
        way["amenity"="cinema"](around:20000,${lat},${lng});
        relation["amenity"="cinema"](around:20000,${lat},${lng});
      );
      out center;
    `
    : null;

  if (!areaQuery && !aroundQuery) {
    setError("Cannot search theatres without location or city.");
    setLoadingTheatre(false);
    return;
  }

  const tryQuery = async (queryText) => {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: queryText,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return res.json();
  };

  try {
    let data = null;
    let usedArea = false;

    if (areaQuery) {
      data = await tryQuery(areaQuery);
      usedArea = true;
    }

    if ((!data?.elements?.length || data?.elements.length === 0) && aroundQuery) {
      data = await tryQuery(aroundQuery);
      usedArea = false;
    }

    const cleaned = (data?.elements || []).map((el) => ({
      name: el.tags?.name || "No Name",
      lat: el.lat || el.center?.lat,
      lng: el.lon || el.center?.lon,
    }));

    if (cleaned.length === 0 && usedArea) {
      setError(
        `No cinemas found for ${cityQuery}. Showing results by nearby location instead.`,
      );
    }

    setTheatres(cleaned);
  } catch (err) {
    console.error(err);
    setError("Theatre fetch failed 😓 Try again.");
    setTheatres([]);
  } finally {
    setLoadingTheatre(false);
  }
}
  return {
    location,
    city,
    error,
    loading,
    getLocation,
    getNearestTheatres,
    theatres,
    loadingTheatre,
  };
}

export default LocationData;
