
import React from "react";
import {withRouter} from 'react-router-dom';
import GridContainer from "../../Components/Grid/GridContainer";
import GridItem from "../../Components/Grid/GridItem";
import Card from "../../Components/Card/Card";
import CardHeader from "../../Components/Card/CardHeader";
import CardIcon from "../../Components/Card/CardIcon";
import {ContactMailRounded, HelpOutline} from "@material-ui/icons";
import CardBody from "../../Components/Card/CardBody";
import Accordion from "../../Components/Accordion/Accordion";
import makeStyles from "@material-ui/core/styles/makeStyles";
import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";


const useStyles = makeStyles(styles);

const Home = ({ history }) => {
    const classes = useStyles();
    return (
        <div>
            <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={8}>
                    <br />
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <ContactMailRounded/>
                            </CardIcon>
                            <h4 className={classes.cardCategory}>
                                We'd Love to Hear From You
                            </h4>
                        </CardHeader>
                        <CardBody>
                            Contact us via mail: support@anglitlaam.com
                            <br />
                            <br />
                            You can also find us on <a href='https://www.facebook.com/anglitlaam'>Facebook</a>
                        </CardBody>
                    </Card>
                    <br/>
                    <br/>
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <HelpOutline/>
                            </CardIcon>
                            <h4 className={classes.cardCategory}>Here Are Some Frequently Asked Questions</h4>
                        </CardHeader>
                        <CardBody>
                            <Accordion
                                active={0}
                                collapses={[
                                    {
                                        title: "Who are you guys?",
                                        content: "We are Anglit Laam - the first low cost English school in Israel.\n" +
                                            "We are here To find you the best teachers so you can learn English any time," +
                                            "at any place and at the lowest cost possible"
                                    },
                                    {
                                        title: "Who are the teachers?",
                                        content: "They are professional English teachers from around the world."
                                    },
                                    {
                                        title: "How do the lessons operate?",
                                        content: "Through Skype! You must install Skype on your computer, tablet or smartphone.\n" +
                                            "At the lesson's scheduled time connect to Skype and await a call from your teacher\n" +
                                            "Be sure to equip a functioning mic (note you do not have to use a camera).\n" +
                                            "These are private one on one lessons"
                                    },
                                    {
                                        title: "When can I schedule a lesson?",
                                        content: "At any time your teacher is available! You can see possible times at the Set A New Lessons tab."
                                    },
                                    {
                                        title: "Can I cancel a lesson?",
                                        content: "Sure. Just make sure to do it at least 24 hours in advance to get your credits back."
                                    },
                                    {
                                        title: "Are there any pre-commitments?",
                                        content: "No! You can cancel your subscription at any time and get a refund for the credits you currently have.\n" +
                                            "Contact us via mail or Facebook to do so."
                                    },
                                    {
                                        title: "Can I start a lesson from my smartphone?",
                                        content: "Sure! Just make sure to install Skype in advance.\n" +
                                            "That being said we do recommend having the lesson on a big screen in a quite area."
                                    },
                                    {
                                        title: "How can I pay?",
                                        content: "You can pay via PayPal, credit card or a wire transfer.\n" +
                                            "Contact us for more info or go to https://www.anglitlaam.com."
                                    },
                                    {
                                        title: "Is my teacher permanent?",
                                        content: "Yes, we recommend keeping the same teacher as long as you are subscribed to our service.\n" +
                                            "This is because we want to give you the most personal treatment possible.\n" +
                                            "If you do want to change your teacher contact us via mail or Facebook.\n" +
                                            "Changing a teacher requires no additional cost."
                                    },
                                    {
                                        title: "How is it so cheap?",
                                        content: "Our goal is to give you the lowest costing quality lessons possible!\n" +
                                            "We don't have any fancy offices nor publicity costs. We are only looking for the best teachers" +
                                            " to suite our student's needs!"
                                    },
                                ]}
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    )
};

export default withRouter(Home);