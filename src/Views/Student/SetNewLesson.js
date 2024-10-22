import React from "react";
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

import {getTeachersWeekFreeTime} from "Actions/firestore_functions_teacher"
import {getStudentByUID, setNewLesson} from "Actions/firestore_functions_student"
import Button from "../../Components/CustomButtons/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/icons/Close";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";
import CardHeader from "../../Components/Card/CardHeader";
import CardIcon from "../../Components/Card/CardIcon";
import { InsertInvitation } from "@material-ui/icons";
import Loader from "Components/Loader/Loader.js";

const localizer = momentLocalizer(moment);

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);



export default function Calendar({history}) {
    const classes = useStyles();
    const classesPopup = useStylesPopup();
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [teacherFreeTime, setTeacherFreeTime] = React.useState({});
    const [studentData, setStudentData] = React.useState({teacher:{email:"",
        first_name: "", last_name:""}, email:"", first_name: "", last_name: "", credits: null});
    const [selectedEvent, setSelectedEvent] = React.useState({start:"", duration:[]});
    const [getEvents, setGetEvents] = React.useState(true);

    const [modal, setModal] = React.useState(false);


    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });
    const [currentDay] = React.useState(new Date());

    React.useEffect(() => {
        getStudentByUID(firebase.auth().currentUser.uid).then(studentInfo =>{
            setStudentData(studentInfo);
            let teacherMail = studentInfo.teacher.email;
            let i;
            let newEvents = [];
            for (i=0; i<=2; i++) {
                let displayDay = new Date(currentDay.toString());
                displayDay.setDate(currentDay.getDate() - currentDay.getDay() + 7*i);
                getTeachersWeekFreeTime(displayDay.getFullYear(), displayDay.getMonth() + 1,
                    displayDay.getDate(), teacherMail).then(freeTime => {
                        setTeacherFreeTime({...freeTime, ...teacherFreeTime});
                        var dateIndex;
                        var possibleLessonIndex;
                        for (dateIndex in Object.keys(freeTime)) {
                            // freeTimeOnDayArray looks like [{time: 12:00, duration: [30,60]}, {time: 12:30, duration: [30]}]
                            var freeTimeOnDayArray = freeTime[Object.keys(freeTime)[dateIndex]];
                            // date looks like 2020-01-31
                            var date = Object.keys(freeTime)[dateIndex];
                            for (possibleLessonIndex in freeTimeOnDayArray) {
                                let possibleLesson = freeTimeOnDayArray[possibleLessonIndex];
                                let startTime = new Date(date + "T" + possibleLesson.time + ":00.000Z");
                                let endTime = new Date(startTime.toISOString());
                                endTime.setTime(startTime.getTime() + 30 * 60000);
                                //let title = startTime.toString().slice(16,21);
                                let slotInfo = {
                                    title: '',
                                    start: startTime,
                                    end: endTime,
                                    duration: possibleLesson.duration
                                };
                                newEvents.push(slotInfo);
                            }
                        }
                        setEvents(newEvents);
                    });
                }
            setLoading(false);
            });
    }, [getEvents]);

    function setNewTeacherEvents(){
        let teacherMail = studentData.teacher.email;
        let i;
        let newEvents = [];
        for (i=0; i<=3; i++) {
            let displayDay = new Date(currentDay.toISOString());
            displayDay.setDate(currentDay.getDate() - currentDay.getDate() + 7*i);
            getTeachersWeekFreeTime(displayDay.getFullYear(), displayDay.getMonth() + 1,
                displayDay.getDate(), teacherMail).then(freeTime => {
                setTeacherFreeTime({...freeTime, ...teacherFreeTime});
                var dateIndex;
                var possibleLessonIndex;
                for (dateIndex in Object.keys(freeTime)) {
                    // freeTimeOnDayArray looks like [{time: 12:00, duration: [30,60]}, {time: 12:30, duration: [30]}]
                    var freeTimeOnDayArray = freeTime[Object.keys(freeTime)[dateIndex]];
                    // date looks like 2020-01-31
                    var date = Object.keys(freeTime)[dateIndex];
                    for (possibleLessonIndex in freeTimeOnDayArray) {
                        let possibleLesson = freeTimeOnDayArray[possibleLessonIndex];
                        let startTime = new Date(date + "T" + possibleLesson.time + ":00.000Z");
                        let endTime = new Date(startTime);
                        endTime.setTime(startTime.getTime() + 30 * 60000);
                        //let title = startTime.toString().slice(16,21);
                        let slotInfo = {
                            title:'',
                            start: startTime,
                            end: endTime,
                            duration: possibleLesson.duration
                        };
                        newEvents.push(slotInfo)
                    }
                }
                setEvents(newEvents)
            });
        }
    }

    const selectEvent = event => {
        setSelectedEvent(event);
        setModal(true);
    };

    const setLesson = (duration) => {
        setEvents([]);
        let teacher_name = studentData.teacher.first_name + " " + studentData.teacher.last_name;
        let student_name = studentData.first_name + " " + studentData.last_name;
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        setModal(false);
        setNewLesson(studentData.email, studentData.teacher.email,
            selectedEvent.start, duration, student_name, teacher_name).then(res => {
           if (res === true){
               confirmAlert();
           }
           else {
               denaiedAlert();
           }
            setGetEvents(!getEvents);
        });
    };

    const closeAlert = () => {
        setAlert(null);
    };

    const BackToHome = () => {
        history.push("/Student/homePage");
    };

    const confirmAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="You Are All Set!"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Lesson has been set!
            </SweetAlert>
        );
    };

    const denaiedAlert = () => {
        setAlert(
            <SweetAlert
                error
                style={{ display: "block"}}
                title="Sorry... You just missed it..."
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                The Time slot you choose is no longer available.
                Please pick a different time.
            </SweetAlert>
        );
    };
    const addNewEvent = (title, slotInfo) => {
        var newEvents = events;
        newEvents.push({
            title: title,
            start: slotInfo.start,
            end: slotInfo.end,
            duration: slotInfo.duration,
        });
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
                                <InsertInvitation/>
                            </CardIcon>
                            <h3  className={classes.cardCategory}>
                                Let's Set a New Lesson!
                            </h3>
                        </CardHeader>
                        <CardBody pricing>
                            {
                                loading === true ?
                                    <Loader width={'20%'}/> :
                                    studentData.credits > 0 ?
                                        <h3 className={`${classes.cardTitle}`}
                                            style={{fontSize: "16px",}}>
                                            Here is {studentData.teacher.first_name} {studentData.teacher.last_name}'s
                                            schedule, please choose a free time.
                                            <br/>
                                            <br/>
                                            Currently you have <b>{studentData.credits} credits</b>.
                                        </h3>
                                        :
                                        <h3 className={`${classes.cardTitle}`}
                                            style={{fontSize: "16px",}}>
                                            Currently you have don't have any credits, please update your subscription.
                                            You can purchase additional credits <a href="https://www.anglitlaam.com/">here!</a>
                                        </h3>

                            }
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem xs={12} sm={12} md={10}>
                    {
                        loading === false && studentData.credits > 0 &&
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
                    }
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
                    <h5>Teacher: {studentData.teacher.first_name} {studentData.teacher.last_name}</h5>
                    <h5>Possible Durations in Minutes: {selectedEvent.duration.toString()}</h5>
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
        </div>
);
}
