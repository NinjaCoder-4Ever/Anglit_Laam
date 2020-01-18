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
import Heading from "../../Components/Heading/Heading";
import GridContainer from "../../Components/Grid/GridContainer";
import GridItem from "../../Components/Grid/GridItem";
import Card from "../../Components/Card/Card.js";
import CardBody from "../../Components/Card/CardBody.js";

import stylesPopup from "assets/jss/material-dashboard-pro-react/modalStyle.js";
import styles from "assets/jss/material-dashboard-pro-react/components/buttonStyle.js";

import { events as calendarEvents } from "../../Variables/general.js";
import {getTeacherByUID, setLessonStarted, setLessonNoShow, getWeekLessonByDateTeacher} from "Actions/firestore_functions_teacher"
import Button from "../../Components/CustomButtons/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/icons/Close";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";

const localizer = momentLocalizer(moment);

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);
const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


export default function Calendar({history}) {
    const classes = useStyles();
    const classesPopup = useStylesPopup();
    const [events, setEvents] = React.useState([]);
    const [alert, setAlert] = React.useState(null);
    const [teacherData, setTeacherData] = React.useState({email:"", lessons_this_week: ""});
    const [selectedEvent, setSelectedEvent] = React.useState({start:"", duration:[]});

    const [modal, setModal] = React.useState(false);
    const [modal2, setModal2] = React.useState(false);
    const [modal3, setModal3] = React.useState(false);


    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });
    const [currentDay, setDsetCurrentDay] = React.useState(new Date());

    React.useEffect(() => {
        getTeacherByUID(firebase.auth().currentUser.uid).then(teacherInfo => {
            setTeacherData(teacherInfo);
            let currentWeekLessons = teacherInfo.lessons_this_week;
            let dayIndex;
            // load this week.
            for (dayIndex in Object.keys(currentWeekLessons)){
                let lessons_on_day = currentWeekLessons[WEEK[dayIndex]];
                let lessonIndex;
                for (lessonIndex in Object.keys(lessons_on_day)){
                    let lesson_id = Object.keys(lessons_on_day)[lessonIndex];
                    let lesson_data = lessons_on_day[lesson_id];
                    let startTime = lesson_data.date_utc.full_date;
                    let endTime = new Date(startTime);
                    endTime.setTime(startTime.getTime() + lesson_data.duration * 60000);
                    let slotInfo = {
                        start: startTime,
                        end: endTime,
                        duration: lesson_data.duration,
                        student: lesson_data.student_mail,
                        started: lesson_data.started,
                        no_show: lesson_data.no_show
                    };
                    addNewEvent("", slotInfo);
                }
            }

            // load Next two weeks
            let i;
            let thisSunday = new Date();
            thisSunday.setDate(thisSunday.getDate() - thisSunday.getDay());
            for (i = 1; i<=2; i++){
                let weeksSunday = thisSunday.setDate(thisSunday.getDate() + (i * 7));
                let weeksSaturday = new Date(weeksSunday);
                weeksSaturday.setDate(weeksSaturday.getDate() + 6);
                getWeekLessonByDateTeacher(teacherInfo.email, weeksSunday, weeksSaturday).then(week_lessons => {
                    let dayIndex;
                    for (dayIndex in Object.keys(week_lessons)){
                        let lessons_on_day = week_lessons[WEEK[dayIndex]];
                        let lessonIndex;
                        for (lessonIndex in Object.keys(lessons_on_day)){
                            let lesson_id = Object.keys(lessons_on_day)[lessonIndex];
                            let lesson_data = lessons_on_day[lesson_id];
                            let startTime = lesson_data.date_utc.full_date;
                            let endTime = new Date(startTime);
                            endTime.setTime(startTime.getTime() + lesson_data.duration * 60000);
                            let slotInfo = {
                                start: startTime,
                                end: endTime,
                                duration: lesson_data.duration,
                                student: lesson_data.student_mail,
                                started: lesson_data.started,
                                no_show: lesson_data.no_show
                            };
                            addNewEvent("", slotInfo);
                        }
                    }
                });
            }
        });
    }, []);

    function setNewTeacherEvents(){

    }
    const selectEvent = event => {
        setSelectedEvent(event);
        setModal(true);
    };

    const setLesson = (duration) => {

    };

    const LessonConfirmedSetAnother = () => {
        setEvents([]);
        setNewTeacherEvents();
        setModal3(false);
    };

    const BackToHome = () => {
        setModal3(false);
        history.push("/Student/homePage");
    };

    const addNewEventAlert = slotInfo => {
        setAlert(
            <SweetAlert
                input
                showCancel
                style={{ display: "block", marginTop: "-100px" }}
                title="Input something"
                onConfirm={title => addNewEvent(title, slotInfo)}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
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
            student: slotInfo.student_mail,
            started: slotInfo.started,
            no_show: slotInfo.no_show
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
            <Heading
                textAlign="center"
                title="Set New Lesson"
                category={
                    <span>
            A beautiful react component made by Netanel
            . Please checkout Yuval for
              full documentation.
          </span>
                }
            />
            {alert}
            <GridContainer justify="center">
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
                                views={['week']}
                                timeslots={2}
                                min={new Date(2019, 12, 0, 9, 0, 0)}
                                max={new Date(2030, 12, 0, 23, 0, 0)}
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={modal}
                transition={Transition}
                keepMounted
                onClose={() => setModal(false)}
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
                    <h3 className={classesPopup.modalTitle}>Set Lesson</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h4>Would you like to set the following lesson:</h4>
                    <h5>Date: {selectedEvent.start.toString().slice(0,15)}</h5>
                    <h5>Time: {selectedEvent.start.toString().slice(16,21)}</h5>
                    <h5>Duration: {selectedEvent.duration.toString()}</h5>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}
                >
                    <Button onClick={() => setModal(false)}>Never Mind</Button>
                    <Button onClick={() => setLesson(30)} color="success">
                        Yes, 30 min
                    </Button>
                    <Button disabled={!selectedEvent.duration.includes(60)} onClick={() => setLesson(60)} color="success">
                        Yes, 60 min
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={modal2}
                transition={Transition}
                keepMounted
                onClose={() => setModal2(false)}
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
                        onClick={() => setModal2(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>You just missed it...</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h4>The time slot you choose is no longer available...</h4>
                    <h4>Please choose a different time for your lesson</h4>
                </DialogContent>
                <DialogActions className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}>
                    <Button onClick={() => setModal2(false)} color="bad">OK</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={modal3}
                transition={Transition}
                keepMounted
                onClose={() => LessonConfirmedSetAnother()}
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
                        onClick={() => setModal3(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Your lesson is set!n</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h4>Do you want to set another lesson or go to home page?</h4>
                </DialogContent>
                <DialogActions className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}>
                    <Button onClick={() => LessonConfirmedSetAnother()} color="success">Set Another Lesson</Button>
                    <Button onClick={() => BackToHome()} color="bad">Back To Home</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
