import React from "react";
import firebase from '../../Config/fire';
import {withRouter} from 'react-router-dom';

const Home = ({ history }) => {

    const handleLogout = () => {
        try {
            firebase.auth().signOut();
            window.$userType = 'none';
            history.push("/login");
        } catch (error) {
            alert(error);
        }
    }

    return (
        <div>
            <div className="container">
                <h2 className="center">My Lessons Page</h2>
                <button onClick={handleLogout} >Sign out </button>
            </div>
        </div>
    );
};

export default withRouter(Home);