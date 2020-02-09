import React from "react";
import firebase from '../../Config/fire';

// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";

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
import Loader from "Components/Loader/Loader.js";

import styles from "assets/jss/material-dashboard-pro-react/views/userProfileStyles.js";
import {getStudentByUID, updateStudentContactInfo} from "Actions/firestore_functions_student";
import SweetAlert from "react-bootstrap-sweetalert";

const useStyles = makeStyles(styles);

export default function MyProfile() {
    const classes = useStyles();
    const [alert, setAlert] = React.useState(null);
    const [subscriptionText, setSubscriptionText] = React.useState(null);
    const [studentData, setStudentData] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: {lessons_num: 0, recurring: true},
        skype_username: '',
        teacher: {first_name: "", last_name: "", email: "", skype_username: ""},
        uid: ''
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getStudentByUID(firebase.auth().currentUser.uid).then((res) => {
            if (res != null) {
                setStudentData(res);
                setSubscriptionText(
                    res.subscription.lessons_num.toString() +
                (res.subscription.recurring ?
                    " weekly lessons subscription" :
                    " lessons package")
                )
            }
            setLoading(false);
            console.log(res);
        });
    }, []);

    const submitChange =() => {
        updateStudentContactInfo(
            document.getElementById("username").value,
            document.getElementById("tel").value,
            document.getElementById("skypeId").value);
        success();
    };

    const hideAlert = () => {
        setAlert(null)
    };

    const success = (line) => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Updated!"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Your details have been updated.
            </SweetAlert>
        );
    };

    return (
        <div>
            {alert}
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
                                            <GridItem xs={12} sm={12} md={4}>
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
                                            <GridItem xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Subscription"
                                                    id="subscription"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        disabled: true,
                                                        defaultValue: subscriptionText
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
                                                    inputProps={{
                                                        disabled: true,
                                                        defaultValue: studentData.first_name
                                                    }}
                                                />
                                            </GridItem>
                                            <GridItem xs={12} sm={12} md={6}>
                                                <CustomInput
                                                    labelText="Last Name"
                                                    id="last-name"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        disabled: true,
                                                        defaultValue: studentData.last_name
                                                    }}
                                                />
                                            </GridItem>
                                        </GridContainer>
                                        <GridContainer>
                                            <GridItem xs={12} sm={12} md={4}>
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
                                            <GridItem xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Skype ID"
                                                    id="skypeId"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        defaultValue: studentData.skype_username
                                                    }}
                                                />
                                            </GridItem>
                                        </GridContainer>
                                        <Button color="info" className={classes.updateProfileButton}
                                                onClick={() => submitChange()}>
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
