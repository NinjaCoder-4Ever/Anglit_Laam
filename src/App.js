import React from 'react';
import './App.css';
import { Route, Switch, Redirect} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import Cookies from 'js-cookie';

/* Auth and Routs */
import { AuthProvider } from "./Actions/auth";
import PrivateRouteStudent from "./Actions/privateRouteStudent";
import PrivateRouteTeacher from "./Actions/privateRouteTeacher";
import PrivateRouteAdmin from "./Actions/privateRouteAdmin";

/* Pages imports */
import logIn from './Views/loginPage';
import signUp from './Views/signUpPage';
import StudentHomePage from "./Views/Student/student";
import TeacherHomePage from "./Views/Teacher/teacher";
import AdminHomePage from "./Views/Admin/admin";




import "assets/scss/material-dashboard-pro-react.scss?v=1.8.0";


const App = () => {

    console.log('App Func' + window.$userType);
    window.$userType = Cookies.get('userType') != undefined ? (Cookies.get('userType')) : ('/login');

    return (
        <AuthProvider>
            <BrowserRouter>
                <Switch>
                    {/* Student Routes */}
                    <PrivateRouteStudent exact path='/Student/homePage' component = {StudentHomePage}/>
                    <PrivateRouteStudent exact path='/Student/setNewLesson' component = {StudentHomePage}/>
                    <PrivateRouteStudent exact path="/Student/myFeedback" component = {StudentHomePage}/>
                    <PrivateRouteStudent exact path='/student/mySubscriptions' component = {StudentHomePage}/>
                    <PrivateRouteStudent exact path='/Student/myProfile' component = {StudentHomePage}/>
                    <PrivateRouteStudent exact path='/Student/contactUs' component = {StudentHomePage}/>
                    <PrivateRouteStudent exact path='/Student' component = {StudentHomePage}/>

                    {/* Teacher Routes */}
                    <PrivateRouteTeacher exact path='/Teacher/homePage' component = {TeacherHomePage}/>
                    <PrivateRouteTeacher exact path='/Teacher/myStudents' component = {TeacherHomePage}/>
                    <PrivateRouteTeacher exact path='/Teacher/feedbackToFill' component = {TeacherHomePage}/>
                    <PrivateRouteTeacher exact path='/Teacher/contactUs' component = {TeacherHomePage}/>
                    <PrivateRouteTeacher exact path='/Teacher' component = {TeacherHomePage}/>

                    {/* Admin Routes */}
                    <PrivateRouteAdmin exact path='/Admin/teachers' component = {AdminHomePage}/>
                    <PrivateRouteAdmin exact path='/Admin/students' component = {AdminHomePage}/>
                    <PrivateRouteAdmin exact path='/Admin/teacherCalendar' component = {AdminHomePage}/>
                    <PrivateRouteAdmin exact path='/Admin' component = {AdminHomePage}/>


                    {/* General Routing */}

                    <Route exact path='/login' component = {logIn}/>
                    <Route exact path='/signUp' component = {signUp}/>
                    <Redirect exact path='' to = {window.$userType} />
                    <Redirect path='/' to = {window.$userType} />


                </Switch>
            </BrowserRouter>
        </AuthProvider>
    )



}

export default App;
