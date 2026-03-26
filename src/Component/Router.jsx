import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../Pages/Login";
import Home from "../Home";
import SingleMovie from "../Pages/SingleMovie";
import { urls } from "../data";
import Header from "./Header";
import Watchlist from "../Pages/Watchlist";
import Footer from "./Fotter";


function Router() {
  return (
    <BrowserRouter>
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
        <Route path="/Watchlist" element={<Watchlist />}></Route>

        <Route path="/movie/:id" element={<SingleMovie />} />
      </Routes>
    <Footer/>
    </BrowserRouter>
  );
}

export default Router;
