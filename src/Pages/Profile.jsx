import { useContext, useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { Moviecontext } from "../context/movieContext";
import { useDocumentTitle } from "../hooks/useMisc";
import { typeOf } from "../utils/format";
import "./Profile.css";

const EMPTY = { name: "", dob: "", gender: "", phone: "", email: "" };
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function Profile() {
  useDocumentTitle("Your profile");
  const { user, Watchlist, handleLogout } = useContext(Moviecontext);
  const [form, setForm] = useState({ ...EMPTY, email: user?.email || "", name: user?.displayName || "" });
  const [editing, setEditing] = useState(true);
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const blobUrl = useRef(null);

  useEffect(() => {
    let alive = true;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (!alive) return;
        if (snap.exists()) {
          setForm((f) => ({ ...f, ...snap.data() }));
          setExists(true);
          setEditing(false);
        }
      })
      .catch(() => alive && toast.error("Couldn't load your profile."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, [user.uid]);

  const locked = exists && !editing;
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function pickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = URL.createObjectURL(file);
    setAvatar(blobUrl.current);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone number are required.");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), form, { merge: true });
      toast.success("Profile saved.");
      setEditing(false);
      setExists(true);
    } catch (err) {
      console.error(err);
      toast.error("We couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const movies = Watchlist.filter((i) => typeOf(i) === "movie").length;
  const shows = Watchlist.filter((i) => typeOf(i) === "tv").length;

  return (
    <div className="page profile">
      <aside className="profile-card">
        <div className="profile-avatar">
          <img src={avatar} alt="Profile" />
          <label className="avatar-edit" aria-label="Change profile photo">
            <FaCamera />
            <input type="file" accept="image/*" onChange={pickImage} hidden />
          </label>
        </div>
        <h1>{form.name || "Movie fan"}</h1>
        <p className="muted">{user.email}</p>
        <dl className="profile-stats">
          <div><dt>Movies saved</dt><dd>{movies}</dd></div>
          <div><dt>Shows saved</dt><dd>{shows}</dd></div>
        </dl>
        <Link className="btn btn-ghost btn-sm" to="/watchlist">Open watchlist</Link>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
      </aside>

      <form className="profile-form" onSubmit={save} aria-busy={loading}>
        <h2 className="section-title">Personal details</h2>
        <label>Name <span className="req">required</span>
          <input name="name" value={form.name} onChange={change} disabled={locked} placeholder="Your full name" autoComplete="name" />
        </label>
        <label>Date of birth
          <input type="date" name="dob" value={form.dob} onChange={change} disabled={locked} max={new Date().toISOString().slice(0, 10)} />
        </label>
        <fieldset disabled={locked}>
          <legend>Gender</legend>
          <div className="radio-row">
            {["Male", "Female"].map((g) => (
              <label key={g} className="radio"><input type="radio" name="gender" value={g} checked={form.gender === g} onChange={change} /> {g}</label>
            ))}
          </div>
        </fieldset>
        <label>Phone <span className="req">required</span>
          <input type="tel" name="phone" value={form.phone} onChange={change} disabled={locked} placeholder="+91 98765 43210" autoComplete="tel" />
        </label>
        <label>Contact email
          <input type="email" name="email" value={form.email} onChange={change} disabled={locked} placeholder="you@example.com" autoComplete="email" />
        </label>
        {locked ? (
          <button className="btn btn-primary" type="button" onClick={() => setEditing(true)}>Edit profile</button>
        ) : (
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            {exists && <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>Cancel</button>}
          </div>
        )}
      </form>
    </div>
  );
}
