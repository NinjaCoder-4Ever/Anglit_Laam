import React from 'react';
import app from '../../Config/fire';


const myLessonsPage = () =>{
    return (
        <div>
            <div className="container">
                <h2 className="center">My Lessons Page</h2>
                <button on click={() => app.auth().signOut()}>Sign out </button>
            </div>
        </div>
    );
};
export default myLessonsPage;