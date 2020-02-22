import React, {useCallback} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import firebase from '../Config/fire';
import { withRouter } from 'react-router-dom';
import Copyright from "../Common/Copyright";
import {setNewStudent} from "../Actions/firestore_functions_student.js";
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from "../Components/Loader/Loader";



const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
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
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const SignUp = ({ history }) => {
    const classes = useStyles();
    const [category, setCategory] = React.useState('');
    const [alert, setAlert] = React.useState(null);

    const handleChange = event => {
        setCategory(event.target.value);
    };

    const handleSignUp = useCallback(async () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        let firstName = document.getElementById('firstName').value;
        let lastName = document.getElementById('lastName').value;
        let phone = document.getElementById('phone').value;
        let englishType = document.getElementById('englishType').innerText.toLowerCase();
        //try {
        await firebase
            .auth()
            .createUserWithEmailAndPassword(email, password);
        await setNewStudent(firebase.auth().currentUser.uid,
            email, firstName, lastName, phone, englishType);
        history.push("/Student/homePage");
        //} catch (error) {
        //    console.log("the error: " + error);
            //   history.push("/Student/homePage");
        //}
    }, [history]);


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                {alert}
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <form id="signupForm" className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="fname"
                                name="firstName"
                                variant="outlined"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="lname"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="phone"
                                label="Phone Number"
                                name="phone"
                                autoComplete="phone"
                                placeholder="Phone"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                placeholder="Email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="verify_email"
                                label="Verify Email Address"
                                name="verify email"
                                autoComplete="verify email"
                                placeholder="Verify_Email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                placeholder="Password"
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <InputLabel id="demo-controlled-open-select-label">English Type:</InputLabel>
                            <Select
                                value = {category}
                                label="English Type"
                                required
                                fullWidth
                                id="englishType"
                                onChange={handleChange}
                            >
                                <MenuItem value="" disabled>
                                    <em>select a value</em>
                                </MenuItem>

                                <MenuItem default={true} value={"kids"}>Kids</MenuItem>
                                <MenuItem value={"adults"}>Adults</MenuItem>
                                <MenuItem value={"business"}>Business</MenuItem>
                                <MenuItem value={"spoken"}>Spoken</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                </form>
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={handleSignUp}
                >
                    Sign Up
                </Button>
                <Grid container justify="flex-end">
                    <Grid item>
                        <Link href="./login" variant="body2">
                            Already have an account? Sign in
                        </Link>
                    </Grid>
                </Grid>
            </div>
            <Box mt={5}>
                <Copyright />
            </Box>
        </Container>
    );
};

export default withRouter(SignUp);