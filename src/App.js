import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import logIn from './Views/loginPage';
import signUp from './Views/signUpPage';
import { AuthProvider } from "./Actions/auth";
import PrivateRoute from "./Actions/privateRoute";

/* Student imports */
import StudentHomePage from "./Views/Student/student";

import "./Layouts/scss/material-dashboard-pro-react.scss?v=1.8.0";


const App = () => {
  return (
      <AuthProvider>
      <Router>
        <Switch>

            {/* Student Routes */}
            <Route exact path='/Student' component = {StudentHomePage}/>
            <Route exact path='/Student/homePage' component = {StudentHomePage}/>
            <Route exact path='/student/mySubscription' component = {StudentHomePage}/>
            <Route exact path='/Student/myLessons' component = {StudentHomePage}/>
            <Route exact path='/Student/myProfile' component = {StudentHomePage}/>
            <Route exact path='/Student/contactUs' component = {StudentHomePage}/>

            {/* General Routing */}
            <Route exact path='/login' component = {logIn}/>
            <Route exact path='/signUp' component = {signUp}/>
            <PrivateRoute exact path='/' component = {StudentHomePage}/>
        </Switch>
      </Router>
      </AuthProvider>
  )
}

export default App;
