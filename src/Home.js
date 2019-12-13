import React from 'react';
import app from './fire';


const Home = () =>{
    return (
        <>
            <h1>Home</h1>
            <button on click={() => app.auth().signOut()}>Sign out </button>
        </>
    );
};
export default Home;
