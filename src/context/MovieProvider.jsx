import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import { Moviecontext } from "./movieContext";
import { titleOf, typeOf } from "../utils/format";

const KEEP = [
  "id", "title", "name", "poster_path", "backdrop_path", "release_date", "first_air_date",
  "vote_average", "vote_count", "overview", "genre_ids", "original_language", "profile_path",
  "known_for_department", "popularity",
];

// Same document id scheme as before (`movie_123` / `tv_123`) so existing watchlists keep working.
const docIdFor = (type, id) => `${type}_${id}`;

function toDoc(item, type) {
  const out = { media_type: type };
  KEEP.forEach((key) => {
    if (item[key] !== undefined && item[key] !== null) out[key] = item[key];
  });
  if (!out.genre_ids && Array.isArray(item.genres)) out.genre_ids = item.genres.map((g) => g.id);
  if (out.overview && out.overview.length > 320) out.overview = `${out.overview.slice(0, 317)}...`;
  out.addedAt = Date.now();
  return out;
}

export default function MovieProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [Watchlist, setWatchlist] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      }),
    [],
  );

  useEffect(() => {
    if (!user) return undefined;
    const colRef = collection(db, "watchlists", user.uid, "movies-shows");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => {
          const data = d.data();
          return { ...data, media_type: typeOf(data), docId: d.id };
        });
        items.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
        setWatchlist(items);
      },
      () => toast.error("Couldn't load your watchlist. Check your connection and refresh."),
    );
  }, [user]);

  // Clear the list as soon as someone signs out (derived, not an effect).
  const list = useMemo(() => (user ? Watchlist : []), [user, Watchlist]);

  const keys = useMemo(() => new Set(list.map((i) => docIdFor(i.media_type, i.id))), [list]);
  const ids = useMemo(() => new Set(list.map((i) => i.id)), [list]);

  const isInWatchlist = useCallback(
    (id, type) => (type ? keys.has(docIdFor(type, id)) : ids.has(id)),
    [keys, ids],
  );

  const Addtowatchlist = useCallback(async (item, typeHint) => {
    const current = auth.currentUser;
    if (!current) return;
    const type = typeOf(item, typeHint);
    await setDoc(doc(db, "watchlists", current.uid, "movies-shows", docIdFor(type, item.id)), toDoc(item, type));
  }, []);

  const removeFromWatchlist = useCallback(
    async (id, type) => {
      const current = auth.currentUser;
      if (!current) return;
      const found = list.find((i) => i.id === id && (!type || i.media_type === type));
      const docId = found?.docId || docIdFor(type || "movie", id);
      await deleteDoc(doc(db, "watchlists", current.uid, "movies-shows", docId));
    },
    [list],
  );

  /** One entry point for every bookmark button: handles login, add/remove and feedback. */
  const toggleWatchlist = useCallback(
    async (item, typeHint) => {
      const type = typeOf(item, typeHint);
      if (!auth.currentUser) {
        toast.info("Sign in to save titles to your watchlist.", { toastId: "login-needed" });
        navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, {
          state: { pendingMovie: { ...item, media_type: type } },
        });
        return;
      }
      try {
        if (keys.has(docIdFor(type, item.id))) {
          await removeFromWatchlist(item.id, type);
          toast(`Removed “${titleOf(item)}” from your watchlist`, { toastId: `rm-${type}-${item.id}` });
        } else {
          await Addtowatchlist(item, type);
          toast.success(`Saved “${titleOf(item)}” to your watchlist`, { toastId: `add-${type}-${item.id}` });
        }
      } catch (err) {
        console.error(err);
        toast.error("That didn't save. Please try again.");
      }
    },
    [keys, navigate, location.pathname, location.search, Addtowatchlist, removeFromWatchlist],
  );

  const handleLogout = useCallback(() => {
    signOut(auth)
      .then(() => toast.success("You're signed out."))
      .catch((error) => toast.error(error.message));
  }, []);

  const value = useMemo(
    () => ({
      user, loading, Watchlist: list, setWatchlist, Addtowatchlist, removeFromWatchlist,
      isInWatchlist, toggleWatchlist, handleLogout,
    }),
    [user, loading, list, Addtowatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist, handleLogout],
  );

  return <Moviecontext.Provider value={value}>{children}</Moviecontext.Provider>;
}
