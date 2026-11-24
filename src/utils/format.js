export function typeOf(item, fallback = "movie") {
  if (!item) return fallback;
  if (item.media_type && item.media_type !== "all") return item.media_type;
  if (item.known_for_department) return "person";
  if (item.first_air_date !== undefined || (item.name && !item.title)) return "tv";
  return fallback;
}

export const titleOf = (item) => item?.title || item?.name || "Untitled";
export const dateOf = (item) => item?.release_date || item?.first_air_date || "";
export const yearOf = (item) => dateOf(item).slice(0, 4);
export const linkFor = (item, fallback) => `/${typeOf(item, fallback)}/${item.id}`;

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatRuntime(minutes) {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

export function formatMoney(value) {
  if (!value) return "Not reported";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export const percent = (vote) => Math.round((vote || 0) * 10);

export function ageFrom(birthday, deathday) {
  if (!birthday) return null;
  const end = deathday ? new Date(deathday) : new Date();
  const born = new Date(birthday);
  let age = end.getFullYear() - born.getFullYear();
  const m = end.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < born.getDate())) age -= 1;
  return age;
}

export function regionName(code) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export function pickTrailer(videos = []) {
  const yt = videos.filter((v) => v.site === "YouTube");
  return (
    yt.find((v) => v.type === "Trailer" && v.official) ||
    yt.find((v) => v.type === "Trailer") ||
    yt.find((v) => v.type === "Teaser") ||
    yt[0] ||
    null
  );
}
