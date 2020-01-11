import React, {useEffect} from "react";
import firebase from 'Config/fire';

// react components used to create a calendar with events on it
import {Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
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

import styles from "../../Layouts/buttonStyle";
import stylesPopup from "../../Layouts/modalStyle.js";

import { events as calendarEvents } from "../../Variables/general.js";
import {getTeachersWeekFreeTime} from "Actions/firestore_functions_teacher"
import {getStudentByUID} from "Actions/firestore_functions_sutdent"
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

export default function Calendar() {
    const classes = useStyles();
    const classesPopup = useStylesPopup();
    const [events, setEvents] = React.useState([]);
    const [alert, setAlert] = React.useState(null);
    const [teacherFreeTime, setTeacherFreeTime] = React.useState({});
    const [studentData, setstudentData] = React.useState({teacher:{email:"",
        first_name: "", last_name:""}});
    const [selectedEvent, setSelectedEvent] = React.useState({start:"", duration:[]});

    const [modal, setModal] = React.useState(false);

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });
    const [currentDay, setDsetCurrentDay] = React.useState(new Date());

    React.useEffect(() => {
        getStudentByUID(firebase.auth().currentUser.uid).then(studentInfo =>{
            setstudentData(studentInfo);
            let teacherMail = studentInfo.teacher.email;
            let i;
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
                                let endTime = new Date(startTime.toISOString());
                                endTime.setTime(startTime.getTime() + 30 * 60000);
                                //let title = startTime.toString().slice(16,21);
                                let title ='';
                                let slotInfo = {
                                    start: startTime,
                                    end: endTime,
                                    duration: possibleLesson.duration
                                };
                                addNewEvent(title, slotInfo)
                            }
                        }
                    });
                }
            });
    }, []);

    function setNetTeacherEvents(){
        var dateIndex;
        var possibleLessonIndex;
        for ( dateIndex in Object.keys(teacherFreeTime)){
            var freeTimeOnDayArray = teacherFreeTime[Object.keys(teacherFreeTime)[dateIndex]];
            var date = Object.keys(teacherFreeTime)[dateIndex];
            for (possibleLessonIndex in freeTimeOnDayArray){
                let possibleLesson = freeTimeOnDayArray[possibleLessonIndex];
                let startTime = new Date(date + "T" + possibleLesson.time + ":00.000Z");
                let endTime = new Date(startTime.toISOString());
                endTime.setTime(startTime.getTime() + 30*60000);
                let title = startTime.toString();
                let slotInfo = {
                    start: startTime,
                    end: endTime,
                    duration: possibleLesson.duration
                };
                addNewEvent(title, slotInfo)
            }
        }
    }
    const selectEvent = event => {
        setSelectedEvent(event)
        setModal(true)
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
            duration: slotInfo.duration
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
                title="React Big Calendar"
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
                    <h5>Teacher: {studentData.teacher.first_name} {studentData.teacher.last_name}</h5>
                    <h5>Duration: {selectedEvent.duration.toString()}</h5>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}
                >
                    <Button onClick={() => setModal(false)}>Never Mind</Button>
                    <Button onClick={() => setModal(false)} color="success">
                        Yes, 30 min
                    </Button>
                    <Button disabled={!selectedEvent.duration.includes(60)} onClick={() => setModal(false)} color="success">
                        Yes, 60 min
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
