import './profile.css';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { BiSolidRightArrow } from 'react-icons/bi';

import { auth, app } from '../FirebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import TextField from '@mui/material/TextField';
import { alpha, styled } from '@mui/material/styles';
import { red } from '@mui/material/colors';


import { IconButton } from '@mui/material';


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
 * Profile component:
 * This component displays the profile of a user. It displays the user's avatar, name, bio,
 * favorite movies, and watchlist. It also displays the number of films that the user has logged,
 * the number of reviews that the user has written, and the number of friends that the user has.
 */

function Profile() {
    // Pair programming: Pride & Amer.
    let user = window.location.href.split('/')[4];
    let name, bio, avatar, filmsWatched, reviews, friends;
    let followButton, editButton, signOutButton;

    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [banner, setBanner] = useState('');
    const [json, setJSON] = useState({});
    const [authJson, setAuthJSON] = useState({});
    const [authUser, setAuthUser] = useState(null);

    const [inputUsername, setInputUsername] = useState('');
    const [inputName, setInputName] = useState('');
    const [inputBio, setInputBio] = useState('');
    const [inputAvatar, setInputAvatar] = useState(null);
    const [avatarURL, setAvatarURL] = useState('default-avatar-url');

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1000,
        bgcolor: '#1c1c1c',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    let avatarRef;

    // Get profile avatar.
    if (authJson !== null && authJson.usernames !== undefined) {
        for (let i = 0; i < authJson.usernames.length; i++) {
            if (authJson.usernames[i].username === user) {
                const storage = getStorage();
                avatarRef = ref(storage, `avatars/${authJson.usernames[i].uid}`);
                getDownloadURL(avatarRef)
                    .then((url) => {
                        setAvatarURL(url);
                    }).catch((err)=> {
                        console.log(err)
                    });
            }
        }
    }

    // Handle avatar change.
    const handleAvatarChange = (e) => {
        console.log('Handling avatar change...');
        const file = e.target.files[0];
        
        if (file) {
            const uploadTask = uploadBytes(avatarRef, file);
    
            uploadTask
                .then((snapshot) => {
                    // console.log('Upload successful!', snapshot);
                    return getDownloadURL(avatarRef);
                })
                .then((downloadURL) => {
                    // console.log('Download URL:', downloadURL);
                    setAvatarURL(downloadURL);
                })
                .catch((error) => {
                    // console.error("Error uploading avatar:", error);
                });
        }
    };
    
    const promises = [];
    const watchlistPromises = [];

    // Get members JSON.
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

    // Get authentications JSON.
    useEffect(() => {
        const getAuthJSON = async () => {
            const ref = collection(getFirestore(app), 'authentications');
        
            // await setDoc(doc(getFirestore(app), "members", "member"), json);
        
            const querySnapshot = await getDocs(collection(getFirestore(app), "authentications"));
            querySnapshot.forEach((doc) => {
                if (doc.data().test === undefined) {
                    setAuthJSON(doc.data());
                }
            });
        }
        getAuthJSON();
    }, {});

    // See whether the user is logged in and which user is logged in.
    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
          if (user) {
            setAuthUser(user);
          } else {
            setAuthUser(null);
          }
        });
    
        return () => {
          listen();
        };
    }, []);

    // If the user is the same as the profile's user, then we will display the buttons
    // accordingly.
    if (authJson !== null && authUser !== null && authJson[authUser.email] !== undefined) {
        if (authJson[authUser.email].username !== user) {
            editButton = <div></div>;
            if (json[authJson[authUser.email].username] !== undefined && json[authJson[authUser.email].username].friends.includes(user)) {
                followButton = <button className='follow-button' onClick={() => {
                    json[authJson[authUser.email].username].friends.splice(json[authJson[authUser.email].username].friends.indexOf(user), 1);
                    const set = async () => {
                        await setDoc(doc(getFirestore(app), "members", "member"), json);
                    }
                    async function update() {
                        await set();
                        window.location.reload();
                    }
                    update();
                }}>Unfollow</button>;
            } else {
                followButton = <button className='follow-button' onClick={() => {
                    if (json[authJson[authUser.email].username].friends.includes(user)) {
                        alert('You are already friends with this user.');
                    } else {
                        json[authJson[authUser.email].username].friends.push(user);
                        const set = async () => {
                            await setDoc(doc(getFirestore(app), "members", "member"), json);
                        }
                        async function update() {
                            await set();
                            window.location.reload();
                        }
                        update();
                    }
                }}>Follow</button>;
            }
        } else {
            followButton = <div></div>;

            signOut = <div className="profile-sign-out"><button className="signout-button" onClick={() => redirect(`/signout`)}>Sign out</button></div>

            editButton = <div>
                <Button onClick={handleOpen}>Edit My Profile</Button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description">
                        
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            <h1>Edit My Profile</h1>
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            <h3>Username: {user}</h3>
                            <form>
                                <input
                                    className="names-textbox" 
                                    fullWidth label="Username" 
                                    placeholder="Username"
                                    onChange={(e) => setInputUsername(e.target.value)}/>
                            </form>
                            <h3>Name: {name}</h3>
                            <form>
                                <input
                                    className="names-textbox" 
                                    fullWidth label="Name" 
                                    placeholder="Name"
                                    onChange={(e) => setInputName(e.target.value)}
                                    />
                            </form>
                            <h3>Bio:</h3>
                            <form>
                                <input
                                    className="bio-textbox" 
                                    fullWidth label="Bio" 
                                    placeholder="Bio"
                                    onChange={(e) => setInputBio(e.target.value)}/>
                            </form>

                            <h3>Avatar:</h3>
                            <input
                                className='choose-avatar-button'
                                accept="image/*"
                                id="contained-button-file"
                                type="file"
                                onChange={handleAvatarChange}
                            />

                                <center>
                                    <button className='submit-changes-button' onClick={() => {
                                        let redir = inputUsername;
                                        if (inputUsername === "") {
                                            redir = user;
                                            if (inputName !== "") {
                                                json[user].name = inputName;
                                            }
                                            if (inputBio !== "") {
                                                json[user].bio = inputBio;
                                            }
                                            if (inputAvatar !== null) {
                                                json[user].avatar = inputAvatar;
                                            }
                                        } else {
                                            Object.keys(json).forEach((key) => {
                                                if (json[key] !== undefined) {
                                                    if (json[key].friends !== undefined) {
                                                        if (json[key].friends.includes(user)) {
                                                            json[key].friends.splice(json[key].friends.indexOf(user), 1);
                                                            json[key].friends.push(inputUsername);
                                                        }
                                                    }
                                                }
                                            });
                                            json[inputUsername] = json[user];
                                            if (inputName !== "") {
                                                json[inputUsername].name = inputName;
                                            }
                                            if (inputBio !== "") {
                                                json[inputUsername].bio = inputBio;
                                            }
                                            if (inputAvatar !== null) {
                                                json[inputUsername].avatar = inputAvatar;
                                            }
                                            authJson[authUser.email].username = inputUsername;
                                            for (let i = 0; i < authJson.usernames.length; i++) {
                                                if (authJson.usernames[i].username === user) {
                                                    authJson.usernames[i].username = inputUsername;
                                                }
                                            }
                                        }
                                        if (inputUsername !== "") {
                                            delete json[user];
                                        }
                                        const set = async () => {
                                            await setDoc(doc(getFirestore(app), "members", "member"), json);
                                        }
                                        const setAuth = async () => {
                                            await setDoc(doc(getFirestore(app), "authentications", "auth"), authJson);
                                        }
                                        const setUser = async () => {
                                            await setDoc(doc(getFirestore(app), "users", authUser.uid), {username: inputUsername});
                                        }
                                        async function update() {
                                            await set();
                                            await setAuth();
                                            await setUser();
                                            redirect(`/profile/${inputUsername}`);
                                            window.location.reload();
                                        }
                                        update();
                                    }}>Submit</button>
                                </center>
                        </Typography>
                    </Box>
                </Modal>
            </div>
        }
    }

    // Set profile information.
    if (json[user] !== undefined) {
        name = json[user].name;
        bio = json[user].bio;

        avatar = json[user].avatar;

        filmsWatched = json[user].filmsWatched;
        reviews = json[user].reviews.length;

        let numFriends = 0;
        for (let i = 0; i < json[user].friends.length; i++) {
            if (json[user].friends[i] !== undefined && json[user].friends[i] !== '') {
                numFriends++;
            }
        }
        friends = numFriends;

        // Favorite movies.
        if (json[user].favoriteFilms.length > 0) {
            if (favorites.length < json[user].favoriteFilms.length) {
                for (let i = 0; i < json[user].favoriteFilms.length; i++) {
                    promises.push(fetch('https://api.themoviedb.org/3/movie/' + json[user].favoriteFilms[i].id + '?language=en-US', options).then(res => res.json()).then(json => json));
                }
                const res = [];
                const movs = [];
                
                Promise.all(promises).then(results => {
                    for (let i = 0; i < results.length; i++) {
                        let release = '';
                        let poster = 'https://image.tmdb.org/t/p/original' + results[i].poster_path;

                        if (results[i].release_date !== undefined) {
                            release = results[i].release_date.split('-')[0];
                        }
                        for (let j = 0; j < json[user].favoriteFilms.length; j++) {
                            if (json[user].favoriteFilms[j].id === results[i].id && json[user].favoriteFilms[j].poster !== undefined) {
                                poster = json[user].favoriteFilms[j].poster;
                            }
                        }
                        const map = {
                            title: results[i].original_title,
                            page_title: results[i].original_title.replaceAll(' ', '-').toLowerCase() + '-' + release,
                            poster: poster,
                            backdrop: 'https://image.tmdb.org/t/p/w1280' + results[i].backdrop_path
                        }
                        res.push(map);
                    }
                    const breakRandom = Math.floor(Math.random() * res.length);
                    for (let i = 0; i < res.length; i++) {
                        const movie = res[i];
            
                        if (movie === undefined) {
                            continue;
                        }
                        if (breakRandom === i && banner === '') {
                            setBanner('https://image.tmdb.org/t/p/w1280' + movie.backdrop);
                        }
                        movs.push(<Link to={`/movie/${movie.page_title}`}><img className='poster-sizing' src={movie.poster}></img></Link>);
                    }
                    setFavorites(movs);
                });
            }
        }

        // Watchlist.
        if (watchlist.length === 0 && json[user].watchlist.length > 0) {
            for (let i = 0; i < json[user].watchlist.length; i++) {
                watchlistPromises.push(fetch('https://api.themoviedb.org/3/movie/' + json[user].watchlist[i].id + '?language=en-US', options).then(res => res.json()).then(json => json));
            }
            const watchlistRes = [];
            const watchlistMovs = [];
            Promise.all(watchlistPromises).then(results => {
                for (let i = 0; i < results.length; i++) {
                    if (results[i] === undefined) {
                        continue;
                    }
                    if (results[i].original_title === undefined) {
                        continue;
                    }
                    let release = '';
                    let poster = 'https://image.tmdb.org/t/p/original' + results[i].poster_path;

                    if (results[i].release_date !== undefined) {
                        release = results[i].release_date.split('-')[0];
                    }
                    for (let j = 0; j < json[user].watchlist.length; j++) {
                        if (json[user].watchlist[j].id === results[i].id && json[user].watchlist[j].poster !== undefined) {
                            poster = json[user].watchlist[j].poster;
                        }
                    }
                    const map = {
                        title: results[i].original_title,
                        page_title: results[i].original_title.replaceAll(' ', '-').toLowerCase() + '-' + release,
                        poster: poster,
                        backdrop: 'https://image.tmdb.org/t/p/w1280' + results[i].backdrop_path
                    }
                    watchlistRes.push(map);
                }
                for (let i = 0; i < 5; i++) {
                    const movie = watchlistRes[i];
        
                    if (movie === undefined) {
                        continue;
                    }
                    watchlistMovs.push(<Link to={`/movie/${movie.page_title}`}><img className='poster-sizing' src={movie.poster}></img></Link>);
                }
                setWatchlist(watchlistMovs);
            });
        }
    }

    let navigate = useNavigate(); 
    const redirect = (p) => { 
        let path = p; 
        navigate(path);
    }

    // Render the profile page.
    return (
        <div className='profile-page-container'>
        <div className='profile-banner'>
            <div className="movie-banner-image" style={{backgroundImage: "url(" + banner + ")"}}></div>
        </div>
        <div className="profile-box">
            <div className='profile-tab'>
                <div className='logged-movies-tab'>
                    <center>
                    <h2><Link to={`/profile/${user}/logged`} className='watch-link'>FILMS</Link></h2>
                    <p style={{fontSize: '30px', color: 'grey'}}>{filmsWatched}</p>
                    </center>
                </div>
                <div className='friends-tab'>
                    <center>
                    <h2><Link className='watch-link' onClick={() => {
                        redirect(`/profile/${user}/following`)
                        window.location.reload();
                    }}>FOLLOWING</Link></h2>
                    <p style={{fontSize: '30px', color: 'grey'}}>{friends}</p>
                    </center>
                </div>
                <div className='reviews-tab'>
                    <center>
                    <h2><Link className='watch-link' onClick={() => {
                        redirect(`/profile/${user}/reviews`)
                        window.location.reload();
                    }}>REVIEWS</Link></h2>
                    <p style={{fontSize: '30px', color: 'grey'}}>{reviews}</p>
                    </center>
                </div>
                {/* <h2><Link className='watch-link' to = {`/profile/${user}/logged`}>FRIENDS</Link></h2>
                <h2><Link className='watch-link' to = {`/profile/${user}/logged`}>REVIEWS</Link></h2> */}


            </div>
            <p>⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯</p>

            <div className="user-tab">
                <h1>{user}</h1>

                {/* <div className='follow-button'> */}
                        {followButton}
                {/* </div> */}
            </div> 

            {editButton}

            <img className='profile-picture' src={avatarURL} alt="Profile Avatar"></img>
                <div className='profile-name'>
                    <h1>{name}</h1>
                </div>
            <div className='profile-description'>
                <p>{bio}</p>
            </div>
            {signOut}
            <div className='profile-favorite-movies-title'><h3>Favorite Movies</h3></div>
            <div className='profile-favorite-movies'>
                    <ol>{favorites}</ol>
            </div>
            <div className='watchlist-title'>
                <h3><Link className='watchlist-link' to={`/profile/${user}/watchlist`}>Watchlist</Link></h3>
            </div>
            <div className='watchlist-movies'>
                <ol>{watchlist}</ol>
            </div>
        </div>
    </div>
    )
}
export default Profile;