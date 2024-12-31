import React, { useEffect, useState } from 'react';
import MovieQueue from '../util/MovieQueue';
import "./moviespagestyle.css";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

import { Link } from 'react-router-dom';
import Select from 'react-select';

// import MovieCache from '../util/MovieCache';

// Hoping that this does not get initialized for every user who opens this page.
// Cache should be in memory for the entire application globally.

// If not, then I need to find a way to make movie data accessible in memory for all
// users.

// ^ Edit: Scratch that. No longer want to do this. I'll come back to this another time.
// Probably when it should exist in cache only when on the Movies page. Otherwise, we
// have no use for it.
// const auth = process.env;

let todaysDate = new Date().toLocaleDateString().split('/');
todaysDate = [parseInt(todaysDate[0]), parseInt(todaysDate[1]), parseInt(todaysDate[2])];

const genres = [
    { name: 'action', id: 28}, 
    { name: 'adventure', id: 12 },
    { name: 'animation', id: 16 },
    { name: 'comedy', id: 35 },
    { name: 'crime', id: 80 },
    { name: 'documentary', id: 99 },
    { name: 'drama', id: 18 },
    { name: 'family', id: 10751 },
    { name: 'fantasy', id: 14 },
    { name: 'history', id: 36 },
    { name: 'horror', id: 27 },
    { name: 'music', id: 10402 },
    { name: 'mystery', id: 9648 },
    { name: 'romance', id: 10749 },
    { name: 'science-fiction', id: 878 },
    { name: 'tv-movie', id: 10770 },
    { name: 'thriller', id: 53 },
    { name: 'war', id: 10752 },
    { name: 'western', id: 37 }
]

const decades = [
    { decade: '2020s', start: '2020-01-01', end: '2029-12-31'}, 
    { decade: '2010s', start: '2010-01-01', end: '2019-12-31'}, 
    { decade: '2000s', start: '2000-01-01', end: '2009-12-31'}, 
    { decade: '1990s', start: '1990-01-01', end: '1999-12-31'}, 
    { decade: '1980s', start: '1980-01-01', end: '1989-12-31'}, 
    { decade: '1970s', start: '1970-01-01', end: '1979-12-31'}, 
    { decade: '1960s', start: '1960-01-01', end: '1969-12-31'}, 
    { decade: '1950s', start: '1950-01-01', end: '1959-12-31'}, 
    { decade: '1940s', start: '1940-01-01', end: '1949-12-31'}, 
    { decade: '1930s', start: '1930-01-01', end: '1939-12-31'}, 
    { decade: '1920s', start: '1920-01-01', end: '1929-12-31'}, 
    { decade: '1910s', start: '1910-01-01', end: '1919-12-31'}, 
    { decade: '1900s', start: '1900-01-01', end: '1909-12-31'}
]

const dropdownStyle = {
    backgroundColor: '#1c1c1c',
    color: '#ffffff',
    width: 'auto',
    // Add other styles as needed
};

const url = window.location.href.split('/');
let path = [];

for (let i = url.length - 1; i >= 0; --i) {
    path.push(url[i]);
    if (url[i] === 'films') {
        break;
    }
}

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: import.meta.env.VITE_TMDB_AUTH
    }
};

/**
 * This function filters what TMDB URL to get the data from based on current user's
 * URL (i.e., if their URL shows they are already in some kind of genre/decade, we will
 * filter it by that genre/decade. This is the precondition to be able to know what kind
 * of data we will need to get later).
 * 
 * @param {*} i: page number 
 * @returns URL to fetch data from.
 */
function link(i) {
    let includesDecade = false;
    let includesGenre = false;
    let decade = {};
    let genre = '';
    const popularityOrder = window.location.href.includes('popularity-asc') ? 'popularity.asc' : 'popularity.desc';

    for (let idx = 0; idx < decades.length; idx++) {
        decade = decades[idx];
        if (window.location.href.includes(decades[idx].decade)) {
            includesDecade = true;
            break;
        }
    }
    for (let idx = 0; idx < genres.length; idx++) {
        genre = genres[idx];
        if (window.location.href.includes(genres[idx].name)) {
            includesGenre = true;
            break;
        }
    }
    if (!includesGenre && includesDecade) {
        return 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=' + i + '&sort_by=' + popularityOrder + '&primary_release_date.gte=' + decade.start + '&primary_release_date.lte=' + decade.end;
    } else if (includesGenre && !includesDecade) {
        return 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=' + i + '&sort_by=' + popularityOrder + '&with_genres=' + genre.id;
    } else if (includesGenre && includesDecade) {
        return 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=' + i + '&sort_by=' + popularityOrder + '&with_genres=' + genre.id + '&primary_release_date.gte=' + decade.start + '&primary_release_date.lte=' + decade.end;
    }
    if (window.location.href.includes('upcoming')) {
        if (includesGenre) {
            return 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=' + i + '&primary_release_date.gte=' + todaysDate[2] + '-' + todaysDate[0] + '-' + todaysDate[1] + '&sort_by=' + popularityOrder + '&with_genres=' + genre.id;
        }
        return 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=' + i + '&primary_release_date.gte=' + todaysDate[2] + '-' + todaysDate[0] + '-' + todaysDate[1] + '&sort_by=' + popularityOrder;
    }
    if (window.location.href.includes('popularity-asc')) {
        return 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=' + i + '&sort_by=' + popularityOrder;
    }
    return 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=' + i;
}

/**
 * MoviesPage component:
 * This component handles the movies page. It handles the displaying of all movies based on
 * what the user's URL is. It also handles the filtering of movies based on genre, decade,
 * and popularity.
 */

function MoviesPage() {
    // Pair programming: Pride & Amer.

    // const [firstResults, setFirstResults] = useState([])
    // const [secondResults, setSecondResults] = useState([])
    // const [thirdResults, setThirdResults] = useState([])

    const promises = [];
    const [results, setResults] = useState([]);
    const [movies, setMovies] = useState([]);
    const [filters, setFilters] = useState([]);
    const [pOrder, setPopularityOrder] = useState([]);
    const [rOrder, setReleaseOrder] = useState([]);
    const [movieIndex, setMovieIndex] = useState(0);
    const [queryBox, setQueryBox] = useState(<div></div>);

    // Setting up filters and fetching data.
    useEffect(() => {
        // Setting genre filters here.
        let hasGenre = false;
        let genre = '';
        const genreFilters = [];

        for (let idx = 0; idx < genres.length; idx++) {
            if (window.location.href.includes(genres[idx].name)) {
                genre = genres[idx].name;
                hasGenre = true;
                break;
            }
        }
        if (hasGenre) {
            genreFilters.push(<option value={`${genre}`}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</option>);
        }
        genreFilters.push(<option value="">All</option>);
        for (let idx = 0; idx < genres.length; idx++) {
            if (genres[idx].name !== genre) {
                genreFilters.push(<option value={`${genres[idx].name.toLowerCase()}`}>{genres[idx].name.charAt(0).toUpperCase() + genres[idx].name.slice(1)}</option>);
            }
        }
        setFilters(genreFilters);

        // Setting popularity order filters here.
        let popularityFilters = [];

        if (window.location.href.includes('popularity-asc')) {
            popularityFilters.push(<option value="popularity-asc">Lowest to Highest</option>);
            popularityFilters.push(<option value="popularity-desc">Highest to Lowest</option>);
        } else {
            popularityFilters.push(<option value="popularity-desc">Highest to Lowest</option>);
            popularityFilters.push(<option value="popularity-asc">Lowest to Highest</option>);
        }
        setPopularityOrder(popularityFilters);

        // Setting release order filters here.
        if (!window.location.href.includes('upcoming')) {
            let hasDecade = false;
            let releaseFilters = [];
            let decade = '';

            for (let idx = 0; idx < decades.length; idx++) {
                if (window.location.href.includes(decades[idx].decade)) {
                    decade = decades[idx];
                    hasDecade = true;
                    break;
                }
            }
            if (hasDecade) {
                releaseFilters.push(<option value={`${decade.decade}`}>{decade.decade}</option>);
            }
            releaseFilters.push(<option value="">All</option>);
            for (let idx = 0; idx < decades.length; idx++) {
                if (decades[idx].decade !== decade.decade) {
                    releaseFilters.push(<option value={`${decades[idx].decade}`}>{decades[idx].decade}</option>);
                }
            }
            setReleaseOrder(releaseFilters);
        }

        // Data access fetches.
        // We get data from the first 50 pages here.
        for (let i = 1; i < 51; i++) {
            promises.push(fetch(link(i), options).then(res => res.json()).then(json => json.results));
        }
        // Get results of all the fetches and set that data.
        const res = [];
        Promise.all(promises).then(results => {
            for (let i = 0; i < results.length; i++) {
                for (let j = 0; j < results[i].length; j++) {
                    let release = '';
                    if (results[i][j].release_date !== undefined) {
                        release = results[i][j].release_date.split('-')[0];
                    }
                    const map = {
                        title: results[i][j].original_title,
                        page_title: results[i][j].original_title.replaceAll(' ', '-').toLowerCase() + '-' + release,
                        poster: 'https://image.tmdb.org/t/p/original' + results[i][j].poster_path,
                        id: results[i][j].id
                    }
                    res.push(map);
                }
            }
            for (let i = 0; i < 30; i++) {
                const movie = res[i];

                if (movie === undefined) {
                    continue;
                }
                movies.push(<Link to={`/movie/${movie.page_title}`}><img className='poster-sizing' src={movie.poster}></img></Link>);
            }
            setMovies(movies);
            setResults(res);
        });
    }, []);

    // When the user clicks the "Load more" button, we want to load more movies.
    if (movieIndex > 0) {
        for (let i = movieIndex; i < movieIndex + 30; i++) {
            const movie = results[i];

            if (movie === undefined) {
                continue;
            }
            movies.push(<Link to={`/movie/${movie.page_title}`}><img className='poster-sizing' src={movie.poster}></img></Link>);
        }
    }

    // Query function. This is for the search bar.
    // We want to query the TMDB API for movies that match the keywords for the
    // query and constantly update the query box with the results.
    const query = (value) => {
        let query = value;

        if (query !== "") {
            query = query.replaceAll(' ', '%20');
            const queryUrl = 'https://api.themoviedb.org/3/search/movie?query=' + query + '&include_adult=false&language=en-US&page=1';

            fetch(queryUrl, options)
                .then(res => res.json())
                .then(json => {
                    const queried = json.results;
                    const queriedMovies = [];
                    const count = 4;

                    for (let i = 0; i < queried.length; i++) {
                        const movie = queried[i];
                        let year = '';

                        if (movie.release_date !== undefined && movie.release_date !== "") {
                            year = '(' + movie.release_date.split('-')[0] + ')';
                        }
                        const map = {
                            title: movie.original_title,
                            year: year,
                            page_title: movie.original_title.replaceAll(' ', '-').toLowerCase() + '-' + movie.release_date.split('-')[0],
                            poster: 'https://image.tmdb.org/t/p/original' + movie.poster_path,
                            id: movie.id
                        }
                        if (i === count) {
                            break;
                        }
                        queriedMovies.push(map);
                    }
                    const queriedResults = [];

                    for (let i = 0; i < 30; i++) {
                        const movie = queriedMovies[i];

                        if (movie === undefined) {
                            continue;
                        }
                        queriedResults.push(<Link to={`/movie/${movie.page_title}`}>
                                <div className='queried-result'>
                                    <img className='queried-result-img' src={movie.poster}/>
                                    <p className='queried-result-title'>
                                        {`${movie.title} ${movie.year}`}
                                    </p>
                                </div>
                            </Link>);
                    }
                    setQueryBox(<div className="queried-container">
                            <div className='queried-box'>
                                <ol>
                                    {queriedResults}
                                </ol>
                            </div>
                        </div>);
                })
                .catch(err => console.log(err))
        } else {
            setQueryBox(<div></div>);
        }
    }

    // window.onunload = () => {
        // window.localStorage.clear();
    // }

    // Deprecated. Not going to use. Probably.
    /*
    let [cache, setCache] = useState([]);

    useEffect(() => {
        setCache(localStorage.getItem('cache') == null ? [] : JSON.parse(localStorage.getItem('cache')));
    }, []);

    let titles = '';

    cache.forEach(movie => titles += movie.title + '\n');

    console.log('TITLES: ' + titles);
    */
    let titles = 'Movies Page';

    // Honestly not going to mess with localStorage nonsense. 
    // I think it's way too unnecessarily complicated. 
    // Figuring out when to flush the memory is annoying. I don't
    // want to deal with that.

    /*
    MovieCache.populate();

    const keys = Object.keys(localStorage);

    keys.map(key => {
        var val = localStorage.getItem(key);
        var title = JSON.parse(val).title;

        titles += title + '\n';
    });
    window.onunload = () => {
        window.localStorage.clear();
    }
    */

    // Render the movies page.
    return (
        <div className="movies-page-container">
            <div className="movies-box">
                <div className="content-nav">
                    <h1>Films</h1>

                    <div className="filters">
                        <div class="search-box">
                            <input type="text" placeholder="  Search a film:" onChange={(e) => {
                                query(e.target.value);
                            }} onClick={
                                () => {
                                    console.log("ABORT");
                                }
                            }/><span></span>
                            
                        </div>
                        {queryBox}
                        
                        <label className='genre-order'>
                            Genre:
                            <select className='genre-dropdown' onChange={(e) => { 
                                if (e.target.value === '') {
                                    if (window.location.href.split('/').length > 4) {
                                        let idx = 4;
                                        if (window.location.href.includes('upcoming')) {
                                            idx = 5;
                                        }
                                        window.location.assign(window.location.href.replace(window.location.href.split('/')[idx], 'all'));
                                    } else {
                                        window.location.assign('/films');
                                    }
                                } else if (window.location.href.includes('popularity-desc') || window.location.href.includes('popularity-asc')) {
                                    let idx = 4;
                                    if (window.location.href.includes('upcoming')) {
                                        idx = 5;
                                    }
                                    window.location.assign(window.location.href.replace(window.location.href.split('/')[idx], e.target.value.toLowerCase()));
                                } else if (window.location.href.includes('upcoming') && !(window.location.href.includes('popularity-desc') || window.location.href.includes('popularity-asc'))) {
                                    window.location.assign(window.location.href + '/' + e.target.value.toLowerCase());
                                } else {
                                    window.location.assign('/films/' + e.target.value.toLowerCase());
                                }
                                }} style={dropdownStyle}>
                                {filters}
                                {/* Add more genre options */}
                            </select>
                        </label>
                        <label className='popularity-order'>
                            Popularity Order:
                            <select className='popularity-dropdown' onChange={(e) => {
                                if (window.location.href.includes('popularity-desc')) {
                                    window.location.assign(window.location.href.replace('popularity-desc', e.target.value));
                                } else if (window.location.href.includes('popularity-asc')) {
                                    window.location.assign(window.location.href.replace('popularity-asc', e.target.value));
                                } else {
                                    if (window.location.href.split('/').length === 4) {
                                        window.location.assign(window.location.href + '/all/' + e.target.value);
                                    } else {
                                        window.location.assign(window.location.href + '/' + e.target.value);
                                    }
                                }
                            }} style={dropdownStyle}>
                                {pOrder}
                            </select>
                        </label>
                        <label className='decade-order'>
                            Decade:
                            <select className='decade-dropdown' onChange={(e) => {
                                if (e.target.value === '') {
                                    let path = window.location.href.replace(window.location.href.split('/')[6], '');
                                    path = path.substring(0, path.length - 1);
                                    window.location.assign(path);
                                } else if (window.location.href.split('/').length === 7) {
                                    window.location.assign(window.location.href.replace(window.location.href.split('/')[6], e.target.value));
                                } else {
                                    if (window.location.href.split('/').length === 4) {
                                        window.location.assign(window.location.href + '/all/popularity-desc/' + e.target.value);
                                    } else if (window.location.href.split('/').length === 6) {
                                        window.location.assign(window.location.href + '/' + e.target.value);
                                    } else {
                                        window.location.assign(window.location.href + '/popularity-desc/' + e.target.value);
                                    }
                                }
                            }} style={dropdownStyle}>
                                {rOrder}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="movieposters">
                    <ol>{movies}</ol>
                </div>
                <div className="expand-button">
                    <button onClick={() => setMovieIndex(movieIndex + 30)} className="expand" role="button">
                        Load more
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MoviesPage;