import { useContext, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { RiMovie2AiFill } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { img } from "../api/tmdb";
import { useTmdb } from "../hooks/useTmdb";
import { useDocumentTitle } from "../hooks/useMisc";
import { Moviecontext } from "../context/movieContext";
import "./Login.css";

const ERRORS = {
  "auth/invalid-credential": "That email and password don't match. Check them and try again.",
  "auth/wrong-password": "That email and password don't match. Check them and try again.",
  "auth/user-not-found": "We couldn't find an account with that email.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Choose a password with at least 6 characters.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Wait a moment, then try again.",
  "auth/network-request-failed": "Network problem. Check your connection and retry.",
};

export default function Login() {
  useDocumentTitle("Sign in");
  const { user, Addtowatchlist } = useContext(Moviecontext);
  const [signup, setSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useTmdb("/trending/movie/week");

  const next = params.get("next");
  const nextPath = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const pending = location.state?.pendingMovie || null;
  const posters = (data?.results || []).filter((m) => m.poster_path).slice(0, 12);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Already signed in (and not mid-submit): nothing to do here.
  if (user && !busy) return <Navigate to={nextPath} replace />;

  async function afterAuth(message) {
    if (pending) {
      try {
        await Addtowatchlist(pending, pending.media_type);
        toast.success(`${message} Saved “${pending.title || pending.name}” to your watchlist.`);
      } catch {
        toast.success(message);
      }
    } else {
      toast.success(message);
    }
    navigate(nextPath, { replace: true });
  }

  async function submit(e) {
    e.preventDefault();
    if (signup && form.password !== form.confirm) {
      toast.error("Your passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      if (signup) {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        if (form.name.trim()) await updateProfile(cred.user, { displayName: form.name.trim() });
        await afterAuth("Account created.");
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        await afterAuth("Welcome back.");
      }
    } catch (err) {
      toast.error(ERRORS[err.code] || err.message);
      setBusy(false);
    }
  }

  async function forgot() {
    if (!form.email) {
      toast.info("Enter your email above, then select “Forgot password”.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err) {
      toast.error(ERRORS[err.code] || err.message);
    }
  }

  return (
    <div className="auth">
      <div className="auth-wall" aria-hidden="true">
        {posters.map((m) => <img key={m.id} src={img(m.poster_path, "w342")} alt="" loading="lazy" />)}
      </div>
      <div className="auth-card">
        <Link to="/" className="logo"><RiMovie2AiFill /><span>Movie-Hub</span></Link>
        <h1>{signup ? "Create your account" : "Sign in"}</h1>
        <p className="auth-sub">
          {pending ? `Sign in to save “${pending.title || pending.name}”.` : "Save titles to your watchlist and review what you watch."}
        </p>

        <form onSubmit={submit}>
          {signup && (
            <label>Name
              <input type="text" value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" required />
            </label>
          )}
          <label>Email
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label>Password
            <span className="pw">
              <input type={show ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="At least 6 characters" autoComplete={signup ? "new-password" : "current-password"} minLength={6} required />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <FiEyeOff /> : <FiEye />}</button>
            </span>
          </label>
          {signup && (
            <label>Confirm password
              <input type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password" autoComplete="new-password" required />
            </label>
          )}
          {!signup && <button type="button" className="link-btn forgot" onClick={forgot}>Forgot password?</button>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {signup ? "Already have an account?" : "New to Movie-Hub?"}{" "}
          <button type="button" onClick={() => setSignup(!signup)}>{signup ? "Sign in" : "Create an account"}</button>
        </p>
      </div>
    </div>
  );
}
