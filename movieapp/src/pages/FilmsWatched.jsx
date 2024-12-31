import './filmswatched.css';
import Avatar from '../assets/avatar.jpg';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { app } from '../FirebaseConfig';
import { BiSolidRightArrow } from 'react-icons/bi';

import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

let todaysDate = new Date().toLocaleDateString().split('/');
todaysDate = [parseInt(todaysDate[0]), parseInt(todaysDate[1]), parseInt(todaysDate[2])];

// 'https://api.themoviedb.org/3/movie/movie_id?language=en-US'

/**
 * FilmsWatched component:
 * This component displays the films that a user has logged. It displays the films in order of release date, and
 * displays the rating that the user gave the film. It also displays the poster for the film, and links to the
 * film's page.
 */

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: import.meta.env.VITE_TMDB_AUTH
    }
};

function FilmsWatched () {
    // Pair programming: Pride & Amer.
    let user = window.location.href.split('/')[4];

    const [movies, setMovies] = useState([]);
    const [json, setJSON] = useState({});

    const promises = [];

    // Get members JSON to get all the films that the user has logged.
    // This JSON has that data.
    useEffect(() => {
        const getJSON = async () => {
            const ref = collection(getFirestore(app), 'members');
        
            // await setDoc(doc(getFirestore(app), "members", "member"), json);
        
            const querySnapshot = await getDocs(collection(getFirestore(app), "members"));
            querySnapshot.forEach((doc) => {
                if (doc.data().test === undefined) {
                    setJSON(doc.data());
                }
            });
        }
        getJSON();
    }, {});

    // Get films by storing them into Promises that will later be used to fetch data
    // asynchronously. Then, sort the films by release date, and display them.
    // Use of Promises is necessary to ensure that the data is fetched before it is
    // displayed. Use of states and hooks is necessary to ensure that the data is displayed
    // after it is fetched.
    if (json[user] !== undefined) {
        for (let i = 0; i < json[user].films.length; i++) {
            promises.push(fetch('https://api.themoviedb.org/3/movie/' + json[user].films[i].id + '?language=en-US', options).then(res => res.json()).then(json => json));
        }
        const res = [];
        const movs = [];
        Promise.all(promises).then(results => {
            for (let i = 0; i < results.length; i++) {
                let release = '';
                let poster = 'https://image.tmdb.org/t/p/original' + results[i].poster_path;
                let rating = 0;

                if (results[i].release_date !== undefined) {
                    release = results[i].release_date.split('-')[0];
                }
                for (let j = 0; j < json[user].films.length; j++) {
                    if (json[user].films[j].id === results[i].id) {
                        if (json[user].films[j].poster !== undefined) {
                            poster = json[user].films[j].poster;
                        }
                        rating = json[user].films[j].rating;
                    }
                }
                const map = {
                    title: results[i].original_title,
                    rating: rating,
                    release_date: results[i].release_date,
                    page_title: results[i].original_title.replaceAll(' ', '-').toLowerCase() + '-' + release,
                    poster: poster
                }
                res.push(map);
            }
            res.sort((a, b) => {
                const dateA = a.release_date.split('-'), dateB = b.release_date.split('-');

                if (parseInt(dateA[0]) < parseInt(dateB[0])) {
                    return 1;
                } else if (parseInt(dateA[0]) > parseInt(dateB[0])) {
                    return -1;
                } else {
                    if (parseInt(dateA[1]) < parseInt(dateB[1])) {
                        return 1;
                    } else if (parseInt(dateA[1]) > parseInt(dateB[1])) {
                        return -1;
                    } else {
                        if (parseInt(dateA[2]) < parseInt(dateB[2])) {
                            return 1;
                        } else if (parseInt(dateA[2]) > parseInt(dateB[2])) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                }
            });
            for (let i = 0; i < res.length; i++) {
                const movie = res[i];
                let rate = '☰';
    
                if (movie === undefined) {
                    continue;
                }
                if (movie.rating > 0) {
                    rate = '';
                    const rateString = '' + movie.rating;
                    const itr = parseInt(rateString.charAt(0));

                    for (let j = 0; j < itr; j++) {
                        rate += '★';
                    }
                    if (movie.rating % 1 !== 0) {
                        rate += '½';
                    }
                }
                movs.push(
                    <div className="film">
                        <div className="film-poster">
                            <Link to={`/movie/${movie.page_title}`}><img className='poster-sizing' src={movie.poster}></img></Link>
                        </div>
                        <div className="stars" style={{color: "#787878", marginLeft: "20px", fontSize: "20px"}}>
                            {rate}
                        </div>
                    </div>);
            }
            setMovies(movs);
        });
    }
    
    return (
        <div className="films-page-container">
            <div className="films-box">
                <div className='title'>
                     <h1>{`${user}'s Logged Films`}</h1>
                </div>
                <div className='films-posters'>
                    <ol className='films-list'>{movies}</ol>
                </div>

            </div>
        </div>

    )
}
export default FilmsWatched;
