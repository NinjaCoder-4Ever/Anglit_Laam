import React, {Component} from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from './Views/userHomePage';
import logIn from './Views/logInPage';
import signUp from './Views/signUpPage';
import { AuthProvider } from "./Actions/auth";
import PrivateRoute from "./Actions/privateRoute";

const App = () => {
  return (
      <AuthProvider>
      <Router>
        <div>
          <PrivateRoute exact path='/' component = {Home}/>
          <Route exact path='/logIn' component = {logIn}/>
          <Route exact path='/signUp' component = {signUp}/>
        </div>
      </Router>
      </AuthProvider>
  )
}

export default App;
