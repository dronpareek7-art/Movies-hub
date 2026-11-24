import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MovieProvider from "../context/MovieProvider";
import Header from "./Header";
import Footer from "./Fotter";
import ScrollToTop from "./ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";
import AiActorPopup from "./AiActorPopup";
import { PageLoader } from "./States";
import Home from "../Home";

export { Moviecontext } from "../context/movieContext";

// Everything except the homepage is code-split so the first paint stays fast.
const Login = lazy(() => import("../Pages/Login"));
const SingleMovie = lazy(() => import("../Pages/SingleMovie"));
const SinglePerson = lazy(() => import("../Pages/Singleperson"));
const GenrePage = lazy(() => import("../Pages/GenrePage"));
const Browse = lazy(() => import("../Pages/Browse"));
const Search = lazy(() => import("../Pages/Search"));
const WatchList = lazy(() => import("../Pages/Watchlist"));
const Profile = lazy(() => import("../Pages/Profile"));
const NotFound = lazy(() => import("../Pages/NotFound"));

export default function Router() {
  return (
    <MovieProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <ScrollToTop />
      <AiActorPopup />
      <main id="main">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/browse/:category" element={<Browse />} />
            <Route path="/genre/:id" element={<GenrePage />} />
            <Route path="/movie/:id" element={<SingleMovie />} />
            <Route path="/tv/:id" element={<SingleMovie />} />
            <Route path="/person/:id" element={<SinglePerson />} />
            <Route path="/watchlist" element={<ProtectedRoute><WatchList /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer
        position="bottom-center"
        autoClose={2400}
        limit={3}
        theme="dark"
        hideProgressBar
        newestOnTop
        pauseOnFocusLoss={false}
        closeButton={false}
      />
    </MovieProvider>
  );
}
