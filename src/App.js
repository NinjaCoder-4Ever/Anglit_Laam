import React, {Component} from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from './Home';
import logIn from './Components/Authentication/logInPage';
import signUp from './Components/Authentication/signUpPage';
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
