import React from 'react';
import app from '../Config/fire';


const userHomePage = () =>{
    return (
        <>
            <h1>Home</h1>
            <button on click={() => app.auth().signOut()}>Sign out </button>
        </>
    );
};
export default userHomePage;
