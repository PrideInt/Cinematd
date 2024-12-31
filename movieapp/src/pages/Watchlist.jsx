import './watchlist.css';
import Avatar from '../assets/avatar.jpg';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { BiSolidRightArrow } from 'react-icons/bi';

import { app } from '../FirebaseConfig';
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

let todaysDate = new Date().toLocaleDateString().split('/');
todaysDate = [parseInt(todaysDate[0]), parseInt(todaysDate[1]), parseInt(todaysDate[2])];

// 'https://api.themoviedb.org/3/movie/movie_id?language=en-US'

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: import.meta.env.VITE_TMDB_AUTH
    }
};

/**
 * Watchlist component:
 * This component displays the films that a user has added to their watchlist. It displays the films in order of release date, and
 * displays the poster for the film, and links to the film's page.
 */

function Watchlist() {
    // Pair programming: Pride & Amer.
    let user = window.location.href.split('/')[4];

    const [movies, setMovies] = useState([]);
    const [json, setJSON] = useState({});

    const promises = [];

    // Get members JSON to get all the films that the user has added to their watchlist.
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

    // Get all the watchlist movie information.
    if (json[user] !== undefined) {
        for (let i = 0; i < json[user].watchlist.length; i++) {
            promises.push(fetch('https://api.themoviedb.org/3/movie/' + json[user].watchlist[i].id + '?language=en-US', options).then(res => res.json()).then(json => json));
        }
        const res = [];
        const movs = [];
        Promise.all(promises).then(results => {
            for (let i = 0; i < results.length; i++) {
                if (results[i] === undefined) {
                    continue;
                }
                if (results[i].original_title === undefined) {
                    continue;
                }
                let release = '';
                // let page_title = '';
                let poster = 'https://image.tmdb.org/t/p/original' + results[i].poster_path;

                if (results[i].release_date !== undefined) {
                    release = results[i].release_date.split('-')[0];
                }
                /*
                if (results[i].original_title !== undefined) {
                    page_title = results[i].original_title.replaceAll(' ', '-').toLowerCase() + '-' + release;
                }
                */
                for (let j = 0; j < json[user].watchlist.length; j++) {
                    if (json[user].watchlist[j].id === results[i].id && json[user].watchlist[j].poster !== undefined) {
                        poster = json[user].watchlist[j].poster;
                    }
                }
                const map = {
                    title: results[i].original_title,
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
    
                if (movie === undefined) {
                    continue;
                }
                movs.push(<Link to={`/movie/${movie.page_title}`}><img className='poster-sizing' src={movie.poster}></img></Link>);
            }
            setMovies(movs);
        });
    }
    
    // Render the watchlist page.
    return (
        <div className="watchlist-page-container">
            <div className="watchlist-box">
                <div className='title'>
                     <h1>{`${user}'s Watchlist`}</h1>
                </div>
                <div className='watchlist-posters'>
                    <ol>{movies}</ol>
                </div>

            </div>
        </div>

    )
}
export default Watchlist;
