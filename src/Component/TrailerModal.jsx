import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import { useTmdb } from "../hooks/useTmdb";
import { pickTrailer } from "../utils/format";
import { EmptyState } from "./States";

/**
 * Trailer player. Pass `videos` when you already have them (details page) or `type`+`id`
 * and the modal fetches them itself (hero, cards).
 */
export default function TrailerModal({ type, id, videos: provided, startKey, onClose }) {
  const fetched = useTmdb(`/${type}/${id}/videos`, { include_video_language: "en,null" }, !provided);
  const videos = (provided || fetched.data?.results || []).filter((v) => v.site === "YouTube");
  const [chosen, setChosen] = useState(startKey || null);
  const closeRef = useRef(null);

  const active = videos.find((v) => v.key === chosen) || pickTrailer(videos);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Trailer">
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close trailer">
          <FiX />
        </button>
        {fetched.loading && !provided ? (
          <div className="video-frame skeleton" />
        ) : active ? (
          <div className="video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${active.key}?autoplay=1&rel=0`}
              title={active.name}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <EmptyState title="No trailer available" message="TMDB doesn't have a video for this title yet." />
        )}
        {videos.length > 1 && (
          <div className="modal-playlist">
            {videos.slice(0, 8).map((v) => (
              <button key={v.key} className={v.key === active?.key ? "is-active" : ""} onClick={() => setChosen(v.key)}>
                <FaPlay /> <span>{v.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
