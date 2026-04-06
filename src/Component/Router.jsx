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

function Router() {
  const [Watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  function Addtowatchlist(movieToAdd) {
    const exists = Watchlist.find((item) => item.id === movieToAdd.id);
    if (!exists) {
      setWatchlist([...Watchlist, movieToAdd]);
    }
  }
  function removeFromWatchlist(id) {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
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
                  urls={[urls.popularcast, urls.popularcast]}
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
          <Route path="/Watchlist" element={<WatchList />}></Route>
          <Route path="/movie/:id" element={<SingleMovie />} />
          <Route path="/tv/:id" element={<SingleMovie />} />
          <Route path="/person/:id" element={<SinglePerson />} />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={2000}
          theme="dark"
          closeButton={true}
        />{" "}
      </Moviecontext.Provider>
    </BrowserRouter>
  );
}

export default Router;
