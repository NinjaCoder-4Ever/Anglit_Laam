import React from 'react';
import app from '../../Config/fire';


const myLessonsPage = () =>{
    return (
        <>
            <h1>my Lessons Page</h1>
            <button on click={() => app.auth().signOut()}>Sign out </button>
        </>
    );
};
export default myLessonsPage;