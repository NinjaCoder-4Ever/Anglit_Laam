import React from 'react'
import {getStudentByMail} from "../../Actions/firestore_functions";

let userData = getStudentByMail('some@mail.com').then(function(data){
    return data
});

const Home = () => {
    return (
        <div>
            <div className="container">
                <h4 className="center">Contact us</h4>
                <p id = "demo">this is it: {userData.first_name}</p>
            </div>
        </div>
    )
};

export default Home