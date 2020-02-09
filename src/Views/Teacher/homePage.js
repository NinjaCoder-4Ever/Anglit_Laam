import React, {useEffect} from "react";
import firebase from 'Config/fire';

// react components used to create a calendar with events on it
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
// dependency plugin for react-big-calendar
import moment from "moment";
// react component used to create alerts
import SweetAlert from "react-bootstrap-sweetalert";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";



// core components
import GridContainer from "../../Components/Grid/GridContainer";
import GridItem from "../../Components/Grid/GridItem";
import Card from "../../Components/Card/Card.js";
import CardBody from "../../Components/Card/CardBody.js";

import stylesPopup from "assets/jss/material-dashboard-pro-react/modalStyle.js";
import styles from "assets/jss/material-dashboard-pro-react/components/buttonStyle.js";

import {getTeacherByUID, setLessonStarted, setLessonNoShow, unmarkLessonStatus, getWeekLessonByDateTeacher} from "Actions/firestore_functions_teacher"
import Button from "../../Components/CustomButtons/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/icons/Close";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";
import CardHeader from "../../Components/Card/CardHeader";
import CardIcon from "../../Components/Card/CardIcon";
import {CalendarToday} from "@material-ui/icons";
import Loader from "Components/Loader/Loader.js";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {saveFeedback, setFeedbackForLesson} from "../../Actions/firestore_functions_teacher";

const localizer = momentLocalizer(moment);

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);
const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


export default function Calendar({history}) {
    const classes = useStyles();
    const classesPopup = useStylesPopup();
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [teacherData, setTeacherData] = React.useState({email:"", lessons_this_week: "",
        first_name: "", last_name: ""});
    const [selectedEvent, setSelectedEvent] = React.useState({
        lesson_id:"",
        student_mail: "",
        student_name: "",
        start: "",
        duration: "",
        feedback_given: false,
        started: false,
        no_show: false
    });
    const [feedbackStatus, setFeedbackStatus] = React.useState("");

    const [modal, setModal] = React.useState(false);
    const [modal2, setModal2] = React.useState(false);
    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });

    React.useEffect(() => {
        let newEvents = [];
        getTeacherByUID(firebase.auth().currentUser.uid).then(teacherInfo => {
            setTeacherData(teacherInfo);
            let currentWeekLessons = teacherInfo.lessons_this_week;
            let dayIndex;
            // load this week.
            let i;
            let thisSunday = new Date();
            thisSunday.setDate(thisSunday.getDate() - thisSunday.getDay());
            let twoWeeksBackSunday = new Date(thisSunday).setDate(thisSunday.getDate() - 14);
            for (i = 0; i<=5; i++) {
                // load Next three weeks
                let weeksSunday = new Date(twoWeeksBackSunday);
                weeksSunday = weeksSunday.setDate(weeksSunday.getDate() + (i * 7));
                weeksSunday = new Date(weeksSunday).setHours(0,0, 0);
                let weeksSaturday = new Date(weeksSunday);
                weeksSaturday.setDate(weeksSaturday.getDate() + 6);
                getWeekLessonByDateTeacher(teacherInfo.email, weeksSunday, weeksSaturday).then(week_lessons => {
                    let dayIndex;
                    for (dayIndex in week_lessons) {
                        let lesson_data = week_lessons[dayIndex];
                        let startTime = new Date(lesson_data.date_utc.full_date_string);
                        let endTime = new Date(startTime);
                        endTime.setTime(startTime.getTime() + lesson_data.duration * 60000);
                        let slotInfo = {
                            title: lesson_data.student_name,
                            start: startTime,
                            end: endTime,
                            duration: lesson_data.duration,
                            student_mail: lesson_data.student_mail,
                            student_name: lesson_data.student_name,
                            started: lesson_data.started,
                            no_show: lesson_data.no_show,
                            lesson_id: lesson_data.lesson_id,
                            feedback_given: lesson_data.feedback_given
                        };
                        newEvents.push(slotInfo);
                    }
                    setEvents(newEvents);
                });
            }
            setLoading(false);
        });
    }, []);

    const selectEvent = event => {
        setSelectedEvent(event);
        wasFeedbackGiven(event);
        setModal(true);
    };

    const setLessonToStarted = () => {
        let start_time = new Date(selectedEvent.start);
        setLessonStarted(selectedEvent.lesson_id, teacherData.email, selectedEvent.student_mail, start_time);
        selectedEvent.started = true;
        selectedEvent.no_show = false;
        setModal(false);
        startedAlert();
    };
    const setLessonToNoShow = () => {
        let start_time = new Date(selectedEvent.start);
        setLessonNoShow(selectedEvent.lesson_id, teacherData.email, selectedEvent.student_mail, start_time);
        selectedEvent.no_show = true;
        selectedEvent.started = false;
        setModal(false);
        noShowAlert();
    };

    const unmarkLesson = () => {
        let start_time = new Date(selectedEvent.start);
        unmarkLessonStatus(selectedEvent.lesson_id, teacherData.email, selectedEvent.student_mail, start_time);
        selectedEvent.no_show = false;
        selectedEvent.started = false;
        setModal(false);
        unmarkAlert();
    };

    const submitFeedback =() => {
        var formInfo = document.getElementById("feedbackForm");
        let student_mail = selectedEvent.student_mail;
        let teacher_mail = teacherData.email;
        let lesson_id = selectedEvent.lesson_id;
        let feedback = {
            grammar_corrections: formInfo.elements["grammar_corrections"].value,
            pronunciation_corrections: formInfo.elements["pronunciation_corrections"].value,
            vocabulary: formInfo.elements["vocabulary"].value,
            home_work: formInfo.elements["home_work"].value,
        };
        setFeedbackForLesson(feedback, lesson_id, teacher_mail, student_mail);
        formInfo.reset();
        selectedEvent.feedback_given = true;
        setModal2(false);
        confirmMessage()
    };

    const closeModal = () => {
        document.getElementById("feedbackForm").reset();
        setModal2(false)
    };

    const saveTempFeedback = () => {
        var formInfo = document.getElementById("feedbackForm");
        let teacher_mail = teacherData.email;
        let lesson_id = selectedEvent.lesson_id;
        let feedback = {
            grammar_corrections: formInfo.elements["grammar_corrections"].value,
            pronunciation_corrections: formInfo.elements["pronunciation_corrections"].value,
            vocabulary: formInfo.elements["vocabulary"].value,
            home_work: formInfo.elements["home_work"].value,
        };
        saveFeedback(feedback, lesson_id, teacher_mail);
        formInfo.reset();
        setModal2(false)
    };

    const confirmMessage = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Lesson Feedback Submitted!"
                onConfirm={() => setAlert(null)}
                confirmBtnCssClass={classes.button + " " + classes.success}
                confirmBtnText="OK!"
            >
            </SweetAlert>
        );
    };
    const warningWithConfirmMessage = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Are you sure you want to submit the feedback?"
                onConfirm={() => submitFeedback()}
                onCancel={() => setAlert(null)}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText="Yes, Submit"
                cancelBtnText="No wait..."
                showCancel
            >
                Once submitted no additional changes in the feedback are possible!
            </SweetAlert>
        );
    };

    const wasFeedbackGiven =(event) => {
        if (event.feedback_given && event.started){
            setFeedbackStatus("Yes! Good Job!");
        }
        if (!event.feedback_given && event.no_show){
            setFeedbackStatus("No Need - Lesson did not happen.");
        }
        if (!event.feedback_given && event.started){
            setFeedbackStatus("No - Please enter feedback!")
        }
        if (!event.feedback_given && !event.no_show && !event.started){
            setFeedbackStatus("No Need - Lesson has not started yet.");
        }
    };

    const openFeedbackModal = () => {
        setAlert(null);
        setModal2(true);
    };

    const startedAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Lesson Started!"
                onCancel={() => setAlert(null)}
                onConfirm={() => openFeedbackModal()}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText="Yes"
                cancelBtnText="No"
                showCancel
            >
                Do you want to open a feedback for the lesson?
            </SweetAlert>
        );
    };

    const noShowAlert = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Ohh The Student Did Not Show..."
                onConfirm={() => setAlert(null)}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            />
        );
    };

    const unmarkAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Lesson Status Reset"
                onConfirm={() => setAlert(null)}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            />
        );
    };

    const addNewEvent = (title, slotInfo) => {
        var newEvents = events;
        newEvents.push({
            title: title,
            start: slotInfo.start,
            end: slotInfo.end,
            duration: slotInfo.duration,
            student_mail: slotInfo.student_mail,
            student_name: slotInfo.student_name,
            started: slotInfo.started,
            no_show: slotInfo.no_show,
            lesson_id: slotInfo.lesson_id,
            feedback_given: slotInfo.feedback_given
        });
        setAlert(null);
        setEvents(newEvents);
    };
    const hideAlert = () => {
        setAlert(null);
    };
    const eventColors = event => {
        var backgroundColor = "event-";
        event.color
            ? (backgroundColor = backgroundColor + event.color)
            : (backgroundColor = backgroundColor + "default");
        return {
            className: backgroundColor
        };
    };
    return (
        <div>
            {alert}
            <GridContainer justify="center">
                <GridItem xs={5} sm={5} lg={5} md={5}>
                    <Card pricing className={classes.textCenter}>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <CalendarToday/>
                            </CardIcon>
                            <h3  className={classes.cardCategory}>
                                My Schedule
                            </h3>
                        </CardHeader>
                        <CardBody pricing>

                            {
                                loading === true ?
                                    <Loader width={'20%'}/>:
                                    <h3 className={`${classes.cardTitle}`}
                                        style={{fontSize: "20px", fontWeight: "bold",}}>
                                        A Look at {teacherData.first_name} {teacherData.last_name}'s Week
                                    </h3>
                            }
                        </CardBody>
                    </Card>
                </GridItem>
                {
                    loading === false &&
                    <GridItem xs={12} sm={12} md={10}>
                        <Card>
                            <CardBody calendar>
                                <BigCalendar
                                    selectable={false}
                                    localizer={localizer}
                                    events={events}
                                    defaultView="week"
                                    scrollToTime={new Date(1970, 1, 1, 6)}
                                    defaultDate={new Date()}
                                    onSelectEvent={event => selectEvent(event)}
                                    //onSelectSlot={slotInfo => addNewEventAlert(slotInfo)}
                                    eventPropGetter={eventColors}
                                    views={["day", 'week']}
                                    timeslots={2}
                                    min={new Date(2019, 12, 0, 9, 0, 0)}
                                    max={new Date(2030, 12, 0, 23, 0, 0)}
                                />
                            </CardBody>
                        </Card>
                    </GridItem>
                }
            </GridContainer>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={modal}
                transition={Transition}
                keepMounted
                onClose={() => closeModal()}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => setModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Lesson info:</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Student Mail: {selectedEvent.student_mail}</h5>
                    <h5>Student Name: {selectedEvent.student_name}</h5>
                    <h5>Date: {selectedEvent.start.toString().slice(0,15)}</h5>
                    <h5>Time: {selectedEvent.start.toString().slice(16,21)}</h5>
                    <h5>Duration: {selectedEvent.duration.toString()}</h5>
                    <h5>Feedback Given? {feedbackStatus}</h5>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <Button  disabled={selectedEvent.started || selectedEvent.feedback_given}
                             onClick={() => setLessonToStarted()} color="success">Lesson Started</Button>
                    <Button disabled={selectedEvent.no_show || selectedEvent.feedback_given}
                            onClick={() => setLessonToNoShow()} color="danger">Student Absent</Button>
                    <Button disabled={!selectedEvent.no_show && !selectedEvent.started || selectedEvent.feedback_given}
                            onClick={() => unmarkLesson()} color="default">Unmark</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center
                }}
                open={modal2}
                transition={Transition}
                keepMounted
                onClose={() => closeModal()}
                aria-labelledby="modal-slide-title"
                aria-describedby="modal-slide-description"
                maxWidth={"90%"}
            >
                <DialogTitle
                    id="classic-modal-slide-title"
                    disableTypography
                    className={classesPopup.modalHeader}
                >
                    <Button
                        justIcon
                        className={classesPopup.modalCloseButton}
                        key="close"
                        aria-label="Close"
                        color="transparent"
                        onClick={() => setModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Submit Feedback</h3>
                </DialogTitle>
                <DialogContent>
                    <form id="feedbackForm" className={classes.form} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    readOnly
                                    autoComplete="student_name"
                                    name="student_name"
                                    variant="outlined"
                                    fullWidth
                                    id="student_name"
                                    label="Student"
                                    value={selectedEvent.student_name}
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    readOnly
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lesson_date"
                                    label="Date"
                                    value={new Date(selectedEvent.start).toString()}
                                    name="lesson_date"
                                    autoComplete="lesson_date"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Grammar Corrections</h5>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="grammar_corrections"
                                    label="Grammar corrections that happened during the lesson."
                                    name="Grammar Corrections"
                                    multiline={5}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Pronunciation Corrections</h5>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="pronunciation_corrections"
                                    label="Pronunciation corrections from the lesson."
                                    name="Pronunciation Corrections"
                                    multiline={5}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Vocabulary</h5>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="vocabulary"
                                    label="New vocabulary that the student learned in the lesson."
                                    name="Vocabulary"
                                    multiline={5}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Home Work</h5>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="home_work"
                                    label="Home work for the student."
                                    name="Home Work"
                                    multiline={5}
                                />
                            </Grid>
                        </Grid>
                        <Grid>
                            <br/>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer>
                        <GridItem>
                            <Button onClick={() => warningWithConfirmMessage()} color="info">
                                Submit Feedback
                            </Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => saveTempFeedback()} color="rose">
                                Save Feedback
                            </Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => closeModal()} color="default">
                                Close
                            </Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>
        </div>
    );
}
