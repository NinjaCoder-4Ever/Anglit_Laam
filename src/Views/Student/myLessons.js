import React, { useCallback, useContext } from "react";
import firebase from '../../Config/fire';
import {AuthContext} from "../../Actions/auth";
import {withRouter, Redirect} from 'react-router-dom';



const MyLessonsPage = ({ history }) => {

    const handleLogout = () => {
            try {
                 firebase
                    .auth()
                    .signOut()
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
export default withRouter (MyLessonsPage);