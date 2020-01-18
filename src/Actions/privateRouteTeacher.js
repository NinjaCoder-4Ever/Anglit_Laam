import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./auth";
import {getUserDataByUid} from "./firestore_functions_general";

const PrivateRouteTeacher = ({ component: RouteComponent, ...rest }) => {
    const {currentUser} = useContext(AuthContext);

    const userType = async () => {
        let userData = await getUserDataByUid(currentUser.uid);
        if (userData.collection === 'teachers')
            return true;
        else
            return false;
    }

    return (
        <Route
            {...rest}
            render={routeProps =>
                !!currentUser ?
                    (userType() ? (<RouteComponent {...routeProps} />) : (<Redirect to={"/Teacher/homePage"} />))
                    :
                    (<Redirect to={"/login"} />)
            }
        />
    );
};


export default PrivateRouteTeacher