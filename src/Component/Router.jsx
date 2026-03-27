import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../Pages/Login";
import Home from "../Home";
import SingleMovie from "../Pages/SingleMovie";
import { urls } from "../data";
import Header from "./Header";
import WatchList from "../Pages/Watchlist";
import Footer from "./Fotter";
import { createContext, useState } from "react";

export const Moviecontext = createContext(null);

function Router() {
  const [Watchlist, setWatchlist] = useState([]);

  function Addtowatchlist(movieToAdd) {
    const exists = Watchlist.find((item) => item.id === movieToAdd.id);
    if (!exists) {
      setWatchlist([...Watchlist, movieToAdd]);
    }
  }

  return (
    <BrowserRouter>
      <Moviecontext.Provider
        value={{ Watchlist, setWatchlist, Addtowatchlist }}
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
                  heading="Top Rated Movies"
                  btn1="Movies"
                  btn2="TV Shows"
                  urls={[urls.topRatedMovies, urls.topRatedTVShows]}
                />
              </>
            }
          />
          <Route path="/Login" element={<Login />}></Route>
          <Route path="/Watchlist" element={<WatchList />}></Route>

          <Route path="/movie/:id" element={<SingleMovie />} />
        </Routes>
        <Footer />
      </Moviecontext.Provider>
    </BrowserRouter>
  );
}

export default Router;
