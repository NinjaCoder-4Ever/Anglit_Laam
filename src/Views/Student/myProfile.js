import React from "react";
import firebase from '../../Config/fire';
import {withRouter} from 'react-router-dom';


// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
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

import styles from "assets/jss/material-dashboard-pro-react/views/userProfileStyles.js";


const useStyles = makeStyles(styles);

export default  function MyProfile() {
    const classes = useStyles();
    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={8}>
                    <Card>
                        <CardHeader color="info" icon>
                            <CardIcon color="info">
                                <PermIdentity />
                            </CardIcon>
                            <h4 className={classes.cardIconTitle}>
                                Edit Profile - <small>Complete your profile</small>
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={5}>
                                    <CustomInput
                                        labelText="Company (disabled)"
                                        id="company-disabled"
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                        inputProps={{
                                            disabled: true
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
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={4}>
                                    <CustomInput
                                        labelText="Email address"
                                        id="email-address"
                                        formControlProps={{
                                            fullWidth: true
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
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={6}>
                                    <CustomInput
                                        labelText="Last Name"
                                        id="last-name"
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                    />
                                </GridItem>
                            </GridContainer>
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={4}>
                                    <CustomInput
                                        labelText="City"
                                        id="city"
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={4}>
                                    <CustomInput
                                        labelText="Country"
                                        id="country"
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={4}>
                                    <CustomInput
                                        labelText="Postal Code"
                                        id="postal-code"
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                    />
                                </GridItem>
                            </GridContainer>
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={12}>
                                    <InputLabel style={{ color: "#AAAAAA" }}>About me</InputLabel>
                                    <CustomInput
                                        labelText="Lamborghini Mercy, Your chick she so thirsty, I'm in that two seat Lambo."
                                        id="about-me"
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                        inputProps={{
                                            multiline: true,
                                            rows: 5
                                        }}
                                    />
                                </GridItem>
                            </GridContainer>
                            <Button color="info" className={classes.updateProfileButton}>
                                Update Profile
                            </Button>
                            <Clearfix />
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    );
}
