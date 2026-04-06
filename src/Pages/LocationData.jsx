import { useState } from "react";

function LocationData() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theatres, setTheatres] = useState([]);
  const [loadingTheatre, setLoadingTheatre] = useState(false);

  const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

  async function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      reject();
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

          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}`
          );

          const data = await res.json();
          const components = data.results[0].components;

          const cityName =
            components.city || components.town || components.village;

          setCity(cityName);

          resolve({ lat, lng }); // 🔥 IMPORTANT
        } catch (err) {
          setError("Error fetching location");
          reject(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        reject(err);
      }
    );
  });
}
 async function getNearestTheatres(coords) {
  const lat = coords.lat;
  const lng = coords.lng;

  setLoadingTheatre(true);

  const query = `
  [out:json];
  (
    node["amenity"="cinema"](around:3000,${lat},${lng});
    way["amenity"="cinema"](around:3000,${lat},${lng});
    relation["amenity"="cinema"](around:3000,${lat},${lng});
  );
  out center;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    const data = await res.json();

    const cleaned = data.elements.map((el) => ({
      name: el.tags?.name || "No Name",
      lat: el.lat || el.center?.lat,
      lng: el.lon || el.center?.lon,
    }));

    setTheatres(cleaned);
  } catch (err) {
    console.log(err);
    setError("Theatre fetch failed 😓 Try again");
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
