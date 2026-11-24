import { useCallback, useEffect, useRef, useState } from "react";
import { peek, tmdb } from "../api/tmdb";

/** Fetch one TMDB resource. Cached + de-duplicated by the client; stale responses are ignored. */
export function useTmdb(path, params = {}, enabled = true) {
  const paramsKey = JSON.stringify(params);
  const key = enabled && path ? `${path}?${paramsKey}` : null;
  const [state, setState] = useState({ key: null, data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!key) return undefined;
    let alive = true;
    tmdb(path, JSON.parse(paramsKey), { force: tick > 0 })
      .then((data) => alive && setState({ key, data, error: null }))
      .catch((error) => alive && setState({ key, data: null, error }));
    return () => {
      alive = false;
    };
  }, [key, path, paramsKey, tick]);

  const current = state.key === key ? state : null;
  const cached = key ? peek(path, JSON.parse(paramsKey)) : undefined;
  const data = current?.data ?? cached ?? null;
  const error = current?.error ?? null;

  const refetch = useCallback(() => {
    setState({ key: null, data: null, error: null });
    setTick((n) => n + 1);
  }, []);

  return { data, error, loading: Boolean(key) && !data && !error, refetch };
}

/** Paginated list with append-on-demand (infinite scroll / "load more"). */
export function usePaged(path, params = {}, enabled = true) {
  const paramsKey = JSON.stringify(params);
  const key = enabled && path ? `${path}?${paramsKey}` : null;
  const [state, setState] = useState({ key: null, items: [], page: 0, total: 1, error: null, busy: false });
  const busy = useRef(false);

  useEffect(() => {
    if (!key) return undefined;
    let alive = true;
    busy.current = true;
    tmdb(path, { ...JSON.parse(paramsKey), page: 1 })
      .then((res) =>
        alive &&
        setState({
          key,
          items: res.results || [],
          page: 1,
          total: Math.min(res.total_pages || 1, 500),
          error: null,
          busy: false,
        }),
      )
      .catch((error) => alive && setState({ key, items: [], page: 0, total: 1, error, busy: false }))
      .finally(() => {
        busy.current = false;
      });
    return () => {
      alive = false;
    };
  }, [key, path, paramsKey]);

  const fresh = state.key === key;
  const loadMore = useCallback(async () => {
    if (!fresh || busy.current || state.page >= state.total) return;
    busy.current = true;
    setState((s) => ({ ...s, busy: true }));
    try {
      const res = await tmdb(path, { ...JSON.parse(paramsKey), page: state.page + 1 });
      setState((s) => {
        if (s.key !== key) return s;
        const seen = new Set(s.items.map((i) => `${i.media_type || ""}${i.id}`));
        const extra = (res.results || []).filter((i) => !seen.has(`${i.media_type || ""}${i.id}`));
        return { ...s, items: [...s.items, ...extra], page: s.page + 1, busy: false };
      });
    } catch (error) {
      setState((s) => ({ ...s, error, busy: false }));
    } finally {
      busy.current = false;
    }
  }, [fresh, key, path, paramsKey, state.page, state.total]);

  return {
    items: fresh ? state.items : [],
    loading: Boolean(key) && !fresh,
    loadingMore: fresh && state.busy,
    error: fresh ? state.error : null,
    hasMore: fresh && state.page < state.total && !state.error,
    loadMore,
  };
}
