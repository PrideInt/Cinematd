import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import './memberspage.css'
import Avatar from '../assets/avatar.jpg';

import { app } from "../FirebaseConfig";

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * MembersPage component:
 * This component handles the members page. It handles the displaying of the users that are registered on the app.
 */


function MembersPage() {
    // Pride
    const [members, setMembers] = useState([]);

    // Get authentications JSON. We need ALL the registered members' user information so that
    // we can update and link to their profile pages.
    useEffect(() => {
        const getAuthJSON = async () => {
            // await setDoc(doc(getFirestore(app), "members", "member"), json);
        
            const querySnapshot = await getDocs(collection(getFirestore(app), "authentications"));
            querySnapshot.forEach((doc) => {
                const authJson = doc.data();

                const membersList = [];
                const promises = [];

                for (let i = 0; i < authJson.usernames.length; i++) {
                    const member = authJson.usernames[i];

                    const storage = getStorage();
                    const avatarRef = ref(storage, `avatars/${member.uid}`);
                    
                    promises.push(getDownloadURL(avatarRef).then((url) => {
                        membersList.push(
                            <div className="member-acc-block">
                                <Link to={`/profile/${member.username}`}><img className="member-avatars" src={url}></img></Link>
                                <div className="member-user">
                                    <Link className='username-link' to={`/profile/${member.username}`}><h2>{member.username}</h2></Link>
                                </div>
                            </div>)
                    }).catch((err)=> {}));
                }
                Promise.all(promises).then(() => {
                    setMembers(membersList);
                });
            });
        }
        getAuthJSON();
    }, {});

    // Render the members page.
    return (
        <div className="member-page-container">
            <div className="member-section">
                <div className="title"><h1>Members</h1></div>
                    <div className="member-acc">
                        <ol>{members}</ol>
                    </div>
                </div>
        </div>
    );
}
export default MembersPage;