import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import './followingpage.css'
import Avatar from '../assets/avatar.jpg';

import { app } from "../FirebaseConfig";

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * FollowingPage component:
 * This component handles the following page. It handles the displaying of the users that the user is following.
 * It also handles the updating of the avatar for the user when searching for a specific user, as the default
 * avatar has not been set yet.
 */

function FollowingPage() {
    // Pair programming: Pride & Amer.
    let user = window.location.href.split('/')[4];
    const [json, setJSON] = useState({});
    const [friends, setFriends] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [authJson, setAuthJSON] = useState({});
    const [avatarURL, setAvatarURL] = useState('default-avatar-url');

    // Get members JSON
    useEffect(() => {
        const getJSON = async () => {
            const querySnapshot = await getDocs(collection(getFirestore(app), "members"));
            querySnapshot.forEach((doc) => {
                if (doc.data().test === undefined) {
                    setJSON(doc.data());
                }
            });
        }
        getJSON();
    }, {});

    // Get authentications JSON
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

    // State changes to update the avatar, username, and friends.
    // Updates the hook for friends, then it re-renders below at
    // the return statement.
    if (!updated) {
        if (json !== null) {
            const fr = [];
            const friendList = [];

            if (json[user] !== undefined) {
                for (let i = 0; i < json[user].friends.length; i++) {
                    if (json[user].friends[i] !== undefined && json[user].friends[i] !== '') {
                        if (!fr.includes(json[user].friends[i])) {
                            const following = json[user].friends[i];

                            const doAsync = async () => {
                                if (authJson !== null && authJson.usernames !== undefined) {
                                    for (let j = 0; j < authJson.usernames.length; j++) {
                                        if (authJson.usernames[j].username === following) {
                                            const storage = getStorage();
                                            const avatarRef = ref(storage, `avatars/${authJson.usernames[j].uid}`);
                                            
                                            await getDownloadURL(avatarRef)
                                                .then((url) => {
                                                    friendList.push(
                                                        <div className="following-acc-block">
                                                            <Link to={`/profile/${following}`}><img className="following-avatars" src={url}></img></Link>
                                                            <div className="following-user">
                                                                <Link className='username-link' to={`/profile/${following}`}><h2>{following}</h2></Link>
                                                            </div>
                                                        </div>)
                                                    fr.push(following);
                                                }).catch((err)=> {
                                                    console.log(err)
                                                });
                                        }
                                    }
                                }
                            }
                            const update = async () => {
                                await doAsync();
                                setUpdated(true);
                                setFriends(friendList);
                            }
                            update();
                        }
                    }
                }
            }
        }
    }

    return(
        <div className="following-page-container">
            <div className="following-section">
                <div className="title"><h1>Following</h1></div>
                    <div className="following-acc">
                        <ol>{friends}</ol>
                    </div>
                </div>
        </div>
    );
}
export default FollowingPage;