
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './pages/HomePage';
import Navbar from './Navbar';
// import UpcomingMovies from './pages/UpcomingMovies';
import MoviesPage from './pages/MoviesPage';
import Movie from './pages/Movie';
import Profile from './pages/Profile';
import FilmsWatched from './pages/FilmsWatched';
import Watchlist from './pages/Watchlist';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import AuthDetails from './pages/AuthDetails';
import MovieMap from './pages/MovieMap';
import MovieReviewPage from './pages/MovieReviewPage';
import FollowingPage from './pages/FollowingPage';
import IndividualReviewPage from './pages/IndividualReviewPage';
import ChatPage from './pages/ChatPage';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import MembersPage from './pages/MembersPage';
// import MovieCache from './util/MovieCache';

/**
 * We handle the routing of all pages here, as well as setting
 * up all page loading.
 */

function App() {
  // Pair programming: Pride & Amer.
  const { authUser } = useContext(AuthContext);

  /*
  MovieCache.populate();

  window.onunload = () => {
    window.localStorage.clear();
  }
  */

  return (
    
    <div className="App">

      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/films" element={<MoviesPage />} />
        <Route path="/profile/:name" element={<Profile />} />
        <Route path="/profile/:name/logged" element={<FilmsWatched />} />
        <Route path="/profile/:name/watchlist" element={<Watchlist />} />
        <Route path="/profile/:name/reviews" element={<MovieReviewPage />} />
        <Route path="/profile/:name/following" element={<FollowingPage />} />
        <Route path="/films/upcoming" element={<MoviesPage />} />
        <Route path="/films/:genre" element={<MoviesPage />} />
        <Route path="/films/:genre/:popularity" element={<MoviesPage />} />
        <Route path="/films/:genre/:popularity/:decade" element={<MoviesPage />} />
        <Route path="/review/:reviewId" element={<IndividualReviewPage />} />
        <Route path="/movie/:movieid" element={<Movie/>}/>
        <Route path="/moviemap" element={<MovieMap/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/signout" element={<AuthDetails/>}/>
        <Route path="/chat" element={<ChatPage/>}/>
        <Route path="/members" element={<MembersPage/>}/>
      </Routes>

      {/* <Home/> */}
      {/* <UpcomingMovies/> */}
      </div>

  );
}

export default App;