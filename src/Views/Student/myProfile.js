import React from "react";
import firebase from '../../Config/fire';
import {withRouter} from 'react-router-dom';


// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";

// @material-ui/icons
import PermIdentity from "@material-ui/icons/PermIdentity";

// core components
import GridContainer from "Components/Grid/GridContainer.js";
import GridItem from "Components/Grid/GridItem.js";
import Button from "Components/CustomButtons/Button.js";
import CustomInput from "Components/CustomInput/CustomInput.js";
import Clearfix from "Components/Clearfix/Clearfix.js";
import Card from "Components/Card/Card.js";
import CardBody from "Components/Card/CardBody.js";
import CardHeader from "Components/Card/CardHeader.js";
import CardIcon from "Components/Card/CardIcon.js";
import CardAvatar from "Components/Card/CardAvatar.js";
import Loader from "Components/Loader/Loader.js";

import styles from "assets/jss/material-dashboard-pro-react/views/userProfileStyles.js";
import {getStudentByUID} from "Actions/firestore_functions_student";
import TextField from "@material-ui/core/TextField";


const useStyles = makeStyles(styles);

export default function MyProfile() {
    const classes = useStyles();
    const [studentData, setStudentData] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: '',
        teacher: {first_name: "", last_name: "", email: "", skype_username: ""},
        uid: ''
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getStudentByUID(firebase.auth().currentUser.uid).then((res) => {
            if (res != null) {
                setStudentData(res);
            }
            setLoading(false);
            console.log(res);
        });
    }, []);

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={8}>
                    <Card>
                        <CardHeader color="info" icon>
                            <CardIcon color="info">
                                <PermIdentity/>
                            </CardIcon>
                            <h4 className={classes.cardIconTitle}>
                                Edit Profile - <small>Complete your profile</small>
                            </h4>
                        </CardHeader>

                            {
                                loading === true ?
                                    <Loader width={'20%'}/> :
                                    <CardBody>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={5}>
                                                <CustomInput
                                                    labelText="Teacher name"
                                                    id="teacherName"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        disabled: true,
                                                        defaultValue: studentData.teacher.first_name + " " + studentData.teacher.last_name
                                                    }}
                                                />
                                            </GridItem>
                                            <GridItem xs={12} sm={12} md={3}>
                                                <CustomInput
                                                    labelText="Username"
                                                    id="username"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        disabled: true,
                                                        defaultValue: studentData.email
                                                    }}
                                                />
                                            </GridItem>
                                            <GridItem xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Credits left"
                                                    id="credits"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        disabled: true,
                                                        defaultValue: studentData.credits
                                                    }}
                                                />
                                            </GridItem>
                                        </GridContainer>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={6}>
                                                <CustomInput
                                                    labelText="First Name"
                                                    id="first-name"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{defaultValue: studentData.first_name}}
                                                />
                                            </GridItem>
                                            <GridItem xs={12} sm={12} md={6}>
                                                <CustomInput
                                                    labelText="Last Name"
                                                    id="last-name"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{defaultValue: studentData.last_name}}
                                                />
                                            </GridItem>
                                        </GridContainer>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Telephone"
                                                    id="tel"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        defaultValue: studentData.phone_number
                                                    }}
                                                />
                                            </GridItem>
                                            {/*<GridItem xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Skype ID"
                                                    id="skypeId"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        defaultValue: studentData.phone_number
                                                    }}
                                                />
                                            </GridItem>*/}
                                            <GridItem xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Subscription"
                                                    id="subscription"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        defaultValue: studentData.subscription
                                                    }}
                                                />
                                            </GridItem>
                                        </GridContainer>
                                        <Button color="info" className={classes.updateProfileButton}>
                                            Update Profile
                                        </Button>
                                        <Clearfix/>
                                    </CardBody>
                            }
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    );
}
