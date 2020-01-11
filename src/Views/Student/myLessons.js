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

import { events as calendarEvents } from "../../Variables/general.js";
import {getTeachersWeekFreeTime} from "Actions/firestore_functions_teacher"
import {getStudentByUID} from "Actions/firestore_functions_sutdent"

const localizer = momentLocalizer(moment);

const useStyles = makeStyles(styles);

export default function Calendar() {
    const classes = useStyles();
    const [events, setEvents] = React.useState([]);
    const [alert, setAlert] = React.useState(null);
    const [teacherFreeTime, setTeacherFreeTime] = React.useState({});
    const [currentDay, setDsetCurrentDay] = React.useState(new Date());
    const [studentData, setstudentData] = React.useState({});

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
                                let title = startTime.toString();
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
    const selectedEvent = event => {
        window.alert(event.title);
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
                                //onSelectEvent={event => selectedEvent(event)}
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
        </div>
    );
}
