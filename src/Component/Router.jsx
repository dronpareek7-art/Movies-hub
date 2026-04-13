import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../Pages/Login";
import Home from "../Home";
import SingleMovie from "../Pages/SingleMovie";
import { urls } from "../data";
import Header from "./Header";
import WatchList from "../Pages/Watchlist";
import Footer from "./Fotter";
import { createContext, useEffect, useState } from "react";
import SinglePerson from "../Pages/Singleperson";
import NotFound from "../Pages/NotFound";
export const Moviecontext = createContext(null);
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ScrollToTop from "./ScrollToTop";
import GenrePage from "../Pages/GenrePage";
import Profile from "../Pages/Profile";
import ProtectedRoute from "./ProtectedRoute";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

function Router() {
  const [Watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    const colRef = collection(db, "watchlists", user.uid, "movies-shows");
    const unsub = onSnapshot(colRef, (snapshot) => {
      const movies = snapshot.docs.map((doc) => doc.data());
      setWatchlist(movies);
    });

    return () => unsub();
  }, [user]);

  async function Addtowatchlist(MovieToAdd) {
    const docId = `${MovieToAdd.media_type || (MovieToAdd.first_air_date ? "tv" : "movie")}_${MovieToAdd.id}`;
    const docRef = doc(db, "watchlists", user.uid, "movies-shows", docId);
    await setDoc(docRef, MovieToAdd);
  }

  async function removeFromWatchlist(IdToRemove) {
    const found = Watchlist.find((item) => item.id === IdToRemove);
    const docId = `${found.media_type || (found.first_air_date ? "tv" : "movie")}_${IdToRemove}`;
    const docRef = doc(db, "watchlists", user.uid, "movies-shows", docId);
    await deleteDoc(docRef);
  }
  const isInWatchlist = (id) => {
    return Watchlist.some((item) => item.id === id);
  };
  function handleLogout() {
    signOut(auth)
      .then(() => {
        alert("Logged out ✅");
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  return (
    <BrowserRouter>
      <Moviecontext.Provider
        value={{
          Watchlist,
          setWatchlist,
          Addtowatchlist,
          removeFromWatchlist,
          isInWatchlist,
          handleLogout,
          user,
        }}
      >
        <Header />
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Home
                  heading="Trending Movies"
                  btn1="Day"
                  btn2="Week"
                  urls={[urls.trendingByDay, urls.trendingByWeek]}
                />

                <Home
                  heading="Popular Movies"
                  btn1="Movies"
                  btn2="TV Shows"
                  urls={[urls.popularMovies, urls.popularTVShows]}
                />
                <Home
                  heading="Popular Actors"
                  btn1="Movies"
                  btn2="TV Shows"
                  urls={[urls.popularcast]}
                />

                <Home
                  heading="Top Rated Movies"
                  btn1="Movies"
                  btn2="TV Shows"
                  urls={[urls.topRatedMovies, urls.topRatedTVShows]}
                />
                <Home
                  heading="Up Coming Movies"
                  btn1="Movies"
                  btn2="TV Shows"
                  urls={[urls.upcomingMovies, urls.upcomingTVShows]}
                />
              </>
            }
          />
          <Route path="/Login" element={<Login />}></Route>
          <Route
            path="/Watchlist"
            element={
              <ProtectedRoute>
                <WatchList />
              </ProtectedRoute>
            }
          ></Route>
          <Route path="/movie/:id" element={<SingleMovie />} />
          <Route path="/tv/:id" element={<SingleMovie />} />
          <Route path="/person/:id" element={<SinglePerson />} />
          <Route path="/genre/:id" element={<GenrePage />} />
          <Route path="*" element={<NotFound />}></Route>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          ></Route>
        </Routes>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={1000}
          theme="dark"
          closeButton={true}
          pauseOnHover={false}
        />{" "}
      </Moviecontext.Provider>
    </BrowserRouter>
  );
}

export default Router;
