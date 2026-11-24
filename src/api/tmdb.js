const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_API_TOKEN;
const TTL = 5 * 60 * 1000;

export const IMAGE_BASE = "https://image.tmdb.org/t/p";
export const img = (path, size = "w500") => (path ? `${IMAGE_BASE}/${size}${path}` : null);

const cache = new Map();
const inflight = new Map();

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  if (!url.searchParams.has("language")) url.searchParams.set("language", "en-US");
  return url.toString();
}

/** Read a cached response synchronously (used to avoid loading flashes). */
export function peek(path, params) {
  if (!path) return undefined;
  const hit = cache.get(buildUrl(path, params));
  return hit && Date.now() - hit.at < TTL ? hit.data : undefined;
}

export async function tmdb(path, params = {}, { force = false } = {}) {
  if (!TOKEN) {
    throw new Error("TMDB token missing. Add VITE_API_TOKEN to your .env file and restart the dev server.");
  }
  const url = buildUrl(path, params);

  if (!force) {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.at < TTL) return hit.data;
    if (inflight.has(url)) return inflight.get(url);
  }

  const request = fetch(url, {
    headers: { accept: "application/json", Authorization: `Bearer ${TOKEN}` },
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body.status_message || `Request failed (${res.status})`);
        error.status = res.status;
        throw error;
      }
      return res.json();
    })
    .then((data) => {
      cache.set(url, { data, at: Date.now() });
      return data;
    })
    .finally(() => inflight.delete(url));

  inflight.set(url, request);
  return request;
}

/** Make sure every result knows what it is (discover/popular endpoints omit media_type). */
export function tagType(results = [], type) {
  return results.map((item) => (item.media_type ? item : { ...item, media_type: type }));
}

const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const CATEGORY_LABELS = {
  trending: "Trending",
  popular: "Popular",
  top_rated: "Top rated",
  upcoming: "Upcoming",
  people: "Popular cast",
};

/** Returns [path, params] for a homepage / browse category. */
export function categoryRequest(category, type = "movie", windowRange = "day") {
  switch (category) {
    case "trending":
      return [`/trending/${type}/${windowRange}`, {}];
    case "popular":
      return [`/${type}/popular`, {}];
    case "top_rated":
      return [`/${type}/top_rated`, {}];
    case "upcoming":
      return type === "movie"
        ? [
            "/discover/movie",
            {
              include_adult: false,
              sort_by: "popularity.desc",
              with_release_type: "2|3",
              "primary_release_date.gte": isoDay(0),
              "primary_release_date.lte": isoDay(180),
            },
          ]
        : [
            "/discover/tv",
            {
              include_adult: false,
              sort_by: "popularity.desc",
              "first_air_date.gte": isoDay(0),
              "first_air_date.lte": isoDay(180),
            },
          ];
    case "people":
      return ["/person/popular", {}];
    default:
      return [`/${type}/popular`, {}];
  }
}
