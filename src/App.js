import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from './Views/User/userHomePage';
import logIn from './Views/loginPage';
import signUp from './Views/signUpPage';
import { AuthProvider } from "./Actions/auth";
import PrivateRoute from "./Actions/privateRoute";
import myLessons from "./Views/User/myLessons";

const App = () => {
  return (
      <AuthProvider>
      <Router>
        <div>
          <PrivateRoute exact path='/' component = {Home}/>
            <Route exact path='/user/myLessons' component = {myLessons}/>
          <Route exact path='/login' component = {logIn}/>
          <Route exact path='/signUp' component = {signUp}/>
        </div>
      </Router>
      </AuthProvider>
  )
}

export default App;
