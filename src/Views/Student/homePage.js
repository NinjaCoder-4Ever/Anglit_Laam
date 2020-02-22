import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
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
import RoundLogo from "Components/RoundLogo.js";
import Loader from "Components/Loader/Loader.js";

import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import {getStudentByUID, cancelLesson, getNextLessonsStudentByUID, updateFirstTimeEntry} from "Actions/firestore_functions_student";
import {CalendarToday, School} from "@material-ui/icons";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import stylesPopup from "assets/jss/material-dashboard-pro-react/modalStyle.js";
import {isDate} from "moment";
import Slide from "@material-ui/core/Slide";


const useStyles = makeStyles(styles);

const useStylesPopup = makeStyles(stylesPopup);

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default  function ExtendedTables({history}) {
    const [checked, setChecked] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [nextLesson, setNextLesson] = React.useState({});
    const [nextLessonDate, setNextLessonDate] = React.useState("");
    const [studentData,setStudentData] = React.useState({first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: '',
        teacher: {first_name: "", last_name: "", email: "", skype_username: ""},
        uid: ''});
    const [modal, setModal] = React.useState(false);
    const [buttonLesson, setButtonLesson] = React.useState(null);
    const classesPopup = useStylesPopup();
    const [triggerMount, setTriggerMount] = React.useState(true);


    React.useEffect(() => {
        getStudentByUID(firebase.auth().currentUser.uid).then((res)=>{
            if(res != null){
                setStudentData(res);
                // Check First Entry.
                if (res.first_time || res.first_time === undefined){
                    updateFirstTimeEntry(res.email);
                    setNextLessonDate("No Next Lesson... Go Ahead and Set your Next Lesson")
                    setLessonsButton();
                    setModal(true);
                }
                // If not first entry - get next lessons.
                else{
                    getNextLessonsStudentByUID(firebase.auth().currentUser.uid,10).then((lessons)=>{
                        if(lessons !== null && lessons !== undefined){
                            setNextLesson(lessons);
                            // setNextLessonDate(res[0].)
                            if (lessons[0] !== null && lessons[0] !== undefined) {
                                setNextLessonDate(new Date(lessons[0].date_utc.full_date_string));
                            }
                            else {
                                noNextLessonAlert();
                                setNextLessonDate("No Next Lesson... Go Ahead and Set your Next Lesson");
                                setLessonsButton();
                            }
                        }
                    })
                }
            }
            setLoading(false);
        });
    },[triggerMount]);

    const openSkype = () => {
        let skype_user = studentData.teacher.skype_username;
        let url = `skype:live:${skype_user}?chat`;
        window.open(url, '_blank');
    };

    const deleteLesson = (line) => {
        let student_mail = studentData.email;
        let teacher_mail = line.teacher_mail;
        let lesson_date = new Date(line.lesson_date);
        cancelLesson(student_mail, teacher_mail, lesson_date);
        if (new Date(lesson_date).toString() === new Date(nextLessonDate).toString()){
            setLoading(true);
            setTriggerMount(!triggerMount);
        }
        else {
            delete nextLesson[line.index];
        }

        setChecked(checked+1);
    };

    const warningWithConfirmMessage = (line) => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Are you sure?"
                onConfirm={() => successDelete(line)}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText="Yes, delete it!"
                cancelBtnText="Cancel"
                showCancel
            >
                <b>Canceling a lesson less than 24 hours ahead will not restore Credits for that lesson!</b>
            </SweetAlert>
        );
    };

    const hideAlert = () => {
        setAlert(null)
    };

    const noNextLessonAlert = () => {
        setAlert(
            <SweetAlert
                info
                style={{ display: "block"}}
                title="We See You Dont Have Future Lessons..."
                onConfirm={() => goToSetLesson()}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
                confirmBtnText="Lets Go Ahead and Set You a New Lesson!"
                showCancelButton={true}
                cancelBtnCssClass={classes.button + " " + classes.default}
                cancelBtnText="I'll Set a Lesson Later..."
                showCancel
            >
            </SweetAlert>
        );
    };

    const successDelete = (line) => {
        deleteLesson(line);
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Deleted!"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Your lesson has been deleted.
            </SweetAlert>
        );
    };

    const classes = useStyles();

    const nextLessonMessage = () => {
        if (isDate(nextLessonDate)){
            return nextLessonDate.toString().slice(0, 21)
        }
        else{
            return nextLessonDate
        }
    };

    function getSimpleButtons(line)
    {
        return  [
            {color: "danger", icon: Close, data: line}
        ].map((prop, key) => {
            return (
                <Button
                    color={prop.color}
                    simple
                    className={classes.actionButton}
                    key={key}
                    onClick={() => {
                        warningWithConfirmMessage(prop.data);
                    }}
                >
                    <prop.icon className={classes.icon}/>
                </Button>
            );
        });
    }

    const goToSetLesson = () => {
        history.push("/Student/SetNewLesson");
    };

    const setLessonsButton = () => {
        setButtonLesson(<Button round color="rose" onClick={() => {
            goToSetLesson();
        }}>
            Lets Set a New Lesson!
        </Button>)
    };

    let lessons = Object.keys(nextLesson).map((lesson_id,index) => {
        let teacher_name = nextLesson[lesson_id].teacher_name;
        let teacher_mail = nextLesson[lesson_id].teacher_mail;
        let lesson_full_date = new Date(nextLesson[lesson_id].date_utc.full_date_string);
        let lesson_date = new Date(nextLesson[lesson_id].date_utc.full_date_string).toString().slice(0, 21);
        let duration = nextLesson[lesson_id].duration;
        return (
            [teacher_name, lesson_date, duration,getSimpleButtons({lesson_date: lesson_full_date, index: lesson_id, teacher_mail: teacher_mail})]
        );

    });
    return (
        <div>
            {alert}

            <GridContainer justify="center">
                <GridItem xs={6} sm={6} lg={6}>
                    <Card pricing>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <School/>
                            </CardIcon>
                            <h3 className={classes.cardCategory}>Your next lesson</h3>
                        </CardHeader>
                        <CardBody pricing>
                            <div className={classes.icon}>
                            </div>
                            <RoundLogo width={"100px"} height={"100px"} objectstyle={{ margin: "0 auto 25px", width: "min-content"}}>
                            </RoundLogo>
                            <h1 className={`${classes.cardTitle} ${classes.marginTop30}`}
                                style={{fontSize: "25px", fontWeight: "bold", marginBottom: "10x" }}>
                                {nextLessonMessage()}
                            </h1>
                            <Button round color="info" onClick={() => {
                                openSkype(studentData);
                            }}>
                                Open Skype
                            </Button>
                            {buttonLesson}
                        </CardBody>
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
                        {
                            loading === true ?
                                <Loader width={'20%'}/>:
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Teacher",
                                            "Date",
                                            "Duration",
                                            "Cancel Lesson"
                                        ]}
                                        tableData={
                                            lessons
                                        }
                                    />
                                </CardBody>
                        }
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
                    <h3 className={classesPopup.modalTitle}>Welcome To Anglit Laam!</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h4>Say hello to your Teacher: {studentData.teacher.first_name} {studentData.teacher.last_name}</h4>
                    <h5>Or Send him a message by Skype.

                    </h5>
                    <h5>We hope you will enjoy our service!</h5>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}
                >
                    <Button onClick={() => goToSetLesson()} color="info">
                        Lets Set Your First Lesson!
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}