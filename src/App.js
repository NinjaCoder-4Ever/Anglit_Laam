import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import logIn from './Views/loginPage';
import signUp from './Views/signUpPage';
import { AuthProvider } from "./Actions/auth";
import PrivateRoute from "./Actions/privateRoute";
import PrivateRouteStudent from "./Actions/privateRouteStudent";
import PrivateRouteTeacher from "./Actions/privateRouteTeacher";

/* Student imports */
import StudentHomePage from "./Views/Student/student";
import TeacherHomePage from "./Views/Teacher/teacher";

import "assets/scss/material-dashboard-pro-react.scss?v=1.8.0";


const App = () => {
  return (
      <AuthProvider>
        <Router>
            <Switch>
                {/* Student Routes */}
                <PrivateRouteStudent exact path='/Student' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/homePage' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/student/mySubscription' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/myLessons' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/myProfile' component = {StudentHomePage}/>
                <PrivateRouteStudent exact path='/Student/contactUs' component = {StudentHomePage}/>

                {/* Teacher Routes */}
                <PrivateRouteTeacher exact path='/Teacher' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/homePage' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/mySchedule' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/myStudents' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/myFeedbacks' component = {TeacherHomePage}/>
                <PrivateRouteTeacher exact path='/Teacher/contactUs' component = {TeacherHomePage}/>

                {/* General Routing */}
                <Route exact path='/login' component = {logIn}/>
                <Route exact path='/signUp' component = {signUp}/>
                <Redirect from="/" to='/Student/homePage'/>

            </Switch>
        </Router>
      </AuthProvider>
  )
}

export default App;
