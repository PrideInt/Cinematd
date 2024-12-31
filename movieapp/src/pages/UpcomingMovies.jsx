

// import React, {useState, useEffect} from 'react'
// import '../App.css';
// import MovieImage from '../assets/emptypic.jpg';
// import MoviePoster from '../assets/movieposter.jpg';
// import Movie from '../pages/Movie';

// import { BiSolidRightArrow } from 'react-icons/bi';

// import MovieQueue from '../util/MovieQueue';
// import { Link } from 'react-router-dom';

// const auth = process.env;
// let todaysDate = new Date().toLocaleDateString().split('/');
// todaysDate = [parseInt(todaysDate[0]), parseInt(todaysDate[1]), parseInt(todaysDate[2])];

// const options = {
//     method: 'GET',
//     headers: {
//       accept: 'application/json',
//       Authorization: 
//     }
// };

// const UpcomingMovies = () => {
//     const queue = new MovieQueue();
//     const results = [];

//     const [firstResults, setFirstResults] = useState([])
//     const [secondResults, setSecondResults] = useState([])
//     const [thirdResults, setThirdResults] = useState([])

//     useEffect(() => {
//         fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&primary_release_date.gte=' + todaysDate[2] + '-' + todaysDate[0] + '-' + todaysDate[1] + '&sort_by=popularity.desc', options)
//             .then(res => res.json())
//             .then(json => setFirstResults(json.results))
//     }, []);

//     useEffect(() => {
//         fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=2&primary_release_date.gte=' + todaysDate[2] + '-' + todaysDate[0] + '-' + todaysDate[1] + '&sort_by=popularity.desc', options)
//             .then(res => res.json())
//             .then(json => setSecondResults(json.results))
//     }, []);

//     useEffect(() => {
//         fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=4&primary_release_date.gte=' + todaysDate[2] + '-' + todaysDate[0] + '-' + todaysDate[1] + '&sort_by=popularity.desc', options)
//             .then(res => res.json())
//             .then(json => setThirdResults(json.results))
//     }, []);

//     // The rest

//     firstResults.forEach(res => results.push(res));
//     secondResults.forEach(res => results.push(res));
//     thirdResults.forEach(res => results.push(res));

//     for (let i = 0; i < results.length; i++) {
//         const result = results[i];
//         const releaseDate = result.release_date.split('-');

//         if ((parseInt(releaseDate[0]) === 2024 && parseInt(releaseDate[1]) > todaysDate[0] - 6) || parseInt(releaseDate[0]) > 2024) {
//             continue;
//         }
//         const lowercase = result.original_title.replaceAll(' ', '-').toLowerCase() + '-' + releaseDate[0];

//         const map = {
//             title: result.original_title,
//             page_title: lowercase,
//             description: result.overview,
//             release: result.release_date,
//             poster: 'https://image.tmdb.org/t/p/original' + result.poster_path,
//             backdrop: result.backdrop_path,
//             popularity: result.popularity
//         };
//         queue.enqueue(map);
//     }
//     // queue.sort();

//     return (
//         <div className="UpcomingMovies-section-container">
//             <div className="UpcomingMovies-text-section-container">
//                 <center>
//                 Upcoming Movies <BiSolidRightArrow />
//                 </center>
//                 </div>
//                 <div className="UpcomingMovies-images">
//                     <Link to={`/movie/${queue.get(0) == null ? '' : queue.get(0).page_title}`}>
//                         <img className='MovieImage-size' src={queue.get(0) == null ? '' : queue.get(0).poster} alt=''></img>
//                     </Link>

//                     <Link to={`/movie/${queue.get(1) == null ? '' : queue.get(1).page_title}`}>
//                         <img className='MovieImage-size'src={queue.get(1) == null ? '' : queue.get(1).poster} alt=''></img>
//                     </Link>

//                     <Link to={`/movie/${queue.get(2) == null ? '' : queue.get(2).page_title}`}>
//                         <img className='MovieImage-size'src={queue.get(2) == null ? '' : queue.get(2).poster} alt=''></img>
//                     </Link>

//                     <Link to={`/movie/${queue.get(3) == null ? '' : queue.get(3).page_title}`}>
//                         <img className='MovieImage-size'src={queue.get(3) == null ? '' : queue.get(3).poster} alt=''></img>
//                     </Link>

//                     <Link to={`/movie/${queue.get(4) == null ? '' : queue.get(4).page_title}`}>
//                         <img className='MovieImage-size'src={queue.get(4) == null ? '' : queue.get(4).poster} alt=''></img>
//                     </Link>

//             </div>
//         </div>    
//     );
// }

// export default UpcomingMovies