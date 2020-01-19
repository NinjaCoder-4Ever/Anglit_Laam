
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import logo from "assets/img/LogoText.png";
import firebase from 'Config/fire';
import SweetAlert from "react-bootstrap-sweetalert";


// material-ui icons
import Assignment from "@material-ui/icons/Assignment";
import Close from "@material-ui/icons/Close";

// core components
import GridContainer from "Components/Grid/GridContainer.js";
import GridItem from "Components/Grid/GridItem.js";
import Table from "Components/Table/Table.js";
import Button from "Components/CustomButtons/Button.js";
import Card from "Components/Card/Card.js";
import CardBody from "Components/Card/CardBody.js";
import CardIcon from "Components/Card/CardIcon.js";
import CardHeader from "Components/Card/CardHeader.js";
import Grid from '@material-ui/core/Grid';

import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import {getTeacherByUID, cancelLesson} from "Actions/firestore_functions_teacher";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";

const useStyles = makeStyles(styles);

export default  function ExtendedTables() {
    const [checked, setChecked] = React.useState(0);
    const [alert, setAlert] = React.useState(null);
    const [TeacherData,setTeacherData] = React.useState({first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: '',
        teacher: {},
        uid: ''});

    React.useEffect(() => {

        getTeacherByUID(firebase.auth().currentUser.uid).then((res)=>{
            if(res != null){
                setTeacherData(res);
            }
            console.log(res);
        })
    },[]);


    const hideAlert = () => {
        setAlert(null);
    };


    const classes = useStyles();

    let lessons = [];

    return (
        <div>
            {alert}

            <GridContainer>
                <GridItem>
                    <Card style={{margin: 'auto'}}>
                        <img src={logo} alt="..." className={classes.logo} />
                    </Card>
                </GridItem>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info" icon>
                            <CardIcon color="info">
                                <Assignment />
                            </CardIcon>
                            <h4 className={classes.cardIconTitle}>Next Lessons</h4>
                        </CardHeader>
                        <CardBody>
                            <Table
                                tableHead={[
                                    "Date",
                                    "Student",
                                    "Duration",
                                ]}
                                tableData={
                                    lessons
                                }
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
            <form /*onSubmit={}*/ className={classes.form} noValidate>
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
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
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
            </form>
        </div>
    );
}
