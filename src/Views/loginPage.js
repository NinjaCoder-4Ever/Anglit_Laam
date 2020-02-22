import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles } from '@material-ui/core/styles';
import {withRouter, Redirect} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import React, { useCallback, useContext } from "react";
import firebase from '../Config/fire';
import { AuthContext } from "../Actions/auth";
import Copyright from "../Common/Copyright";
import {getUserData} from "../Actions/firestore_functions_general";
import Cookies from 'js-cookie';

import backgroundPic from '../assets/img/AnglitLaam.jpg'


const useStyles = makeStyles(theme => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: `url(${backgroundPic})`,
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));


const LoginSide = ({ history }) => {

    const classes = useStyles();

    const handleLogin = useCallback(async event => {
        event.preventDefault();
        const { email, password } = event.target.elements;
        try {
            await firebase
                .auth()
                .signInWithEmailAndPassword(email.value, password.value);

            const userType = await getUserData(email.value).then(function (data) {
                return data.collection
            });

            if (userType === "students") {
                Cookies.set('userType','students', {expires: 1});
                history.push("/Student/homePage");
            } else if (userType === "teachers") {
                Cookies.set('userType','teachers', {expires: 1});
                history.push("/Teacher/homePage");
            } else if (userType === "admins"){
                Cookies.set('userType','admins', {expires: 1});
                history.push("/Admin/teachers");
            } else {
                throw new Error("An error has occurred, unknown user");
            }

        } catch (error) {
            alert(error);
        }
        },
        [history]
    );

    const handleForgotPassword = (event) => {

        /* call prompt() with custom message to get user input from alert-like dialog */
        const enteredName = prompt('Please enter the email address you wish to reset')
        if (enteredName) {
            try {
                firebase.auth().sendPasswordResetEmail(enteredName);
                alert('Please check your email for further instructions')
            } catch (error) {
                alert(error);
            }
        }
    }

    const { currentUser } = useContext(AuthContext);

    if (currentUser) {
        return <Redirect to="/" />;
    }

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Anglit Laam - Login
                    </Typography>
                    <form onSubmit={handleLogin} className={classes.form} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            placeholder="Email"
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Login
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link onClick={handleForgotPassword} variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="./signUp" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>
    );
}

export default withRouter(LoginSide);