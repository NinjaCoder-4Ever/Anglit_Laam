import React, {useContext} from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import logIn from './Views/loginPage';
import signUp from './Views/signUpPage';
import { AuthProvider } from "./Actions/auth";
import PrivateRoute from "./Actions/privateRoute";
import PrivateRouteStudent from "./Actions/privateRouteStudent";
import PrivateRouteTeacher from "./Actions/privateRouteTeacher";
import PrivateRouteAdmin from "./Actions/privateRouteAdmin";
import firebase from 'Config/fire';

/* Student imports */
import StudentHomePage from "./Views/Student/student";
import TeacherHomePage from "./Views/Teacher/teacher";
import AdminHomePage from "./Views/Admin/admin";

import "assets/scss/material-dashboard-pro-react.scss?v=1.8.0";


const App = () => {
    var user = firebase.auth().currentUser;
    console.log('global var user:')
    console.log(window.$userType);


    function redirectByUser () {
        if (window.$userType !== 'none') {
            if (window.$userType === 'students')
                return '/Student/homePage';
            if (window.$userType === 'teachers')
                return '/Teacher/homePage';
            if (window.$userType === 'admins')
                return '/Admin/teachers';
        }
        else
            return '/login';
    }


  return (
      <AuthProvider>
        <Router>
            <Switch>
                {/* Student Routes */}
                <PrivateRouteStudent exact path='/Student' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/homePage' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/setNewLesson' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path="/Student/myFeedback" component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/student/mySubscriptions' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/myProfile' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/contactUs' component = {StudentHomePage}/>

                {/* Teacher Routes */}
                <PrivateRouteTeacher exact path='/Teacher' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/homePage' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/myStudents' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/feedbackToFill' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/contactUs' component = {TeacherHomePage}/>

                {/* Admin Routes */}
                <PrivateRouteAdmin exact path='/Admin' component = {AdminHomePage}/>
                <PrivateRouteAdmin exact path='/Admin/teachers' component = {AdminHomePage}/>
                <PrivateRouteAdmin exact path='/Admin/students' component = {AdminHomePage}/>
                <PrivateRouteAdmin exact path='/Admin/teacherCalendar' component = {AdminHomePage}/>

                {/* General Routing */}
                <Route exact path='/' component = {logIn}/>
                <Route exact path='/login' component = {logIn}/>
                <Route exact path='/signUp' component = {signUp}/>
                <Redirect from="/" to= {redirectByUser()}/>

            </Switch>
        </Router>
      </AuthProvider>
  )
}

export default App;
