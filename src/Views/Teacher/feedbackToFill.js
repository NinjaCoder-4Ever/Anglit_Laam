
import React, {useCallback} from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import firebase from 'Config/fire';

// material-ui icons
import Assignment from "@material-ui/icons/Assignment";
import Check from "@material-ui/icons/Check";

// core components
import GridContainer from "Components/Grid/GridContainer.js";
import GridItem from "Components/Grid/GridItem.js";
import Table from "Components/Table/Table.js";
import Button from "Components/CustomButtons/Button.js";
import Card from "Components/Card/Card.js";
import CardBody from "Components/Card/CardBody.js";
import CardIcon from "Components/Card/CardIcon.js";
import CardHeader from "Components/Card/CardHeader.js";

import stylesPopup from "assets/jss/material-dashboard-pro-react/modalStyle.js";
import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import {getTeacherByUID, getFeedbackNecessaryLessonsForTeacher, setFeedbackForLesson,
    saveFeedback} from "Actions/firestore_functions_teacher";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/core/SvgIcon/SvgIcon";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
//import Transition from "react-transition-group/Transition";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from "../../Components/Loader/Loader";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);

export default  function ExtendedTables(callback, deps) {
    const [alert, setAlert] = React.useState(null);
    const [teacherData,setTeacherData] = React.useState({first_name: '',
        last_name: '',
        students:[]
    });
    const [loading, setLoading] = React.useState(true);
    const [modal, setModal] = React.useState(false);
    const [feedbacks,setFeedbacks] = React.useState([]);
    const [reloadToken, setReloadToken] = React.useState(true);
    const [selectedLesson, setSelectedLesson] = React.useState({
        student_name:"",
        lesson_date: "",
        duration: "",
        student_mail: "",
        teacher_mail: "",
        lesson_id: "",
        grammar_corrections: null,
        pronunciation_corrections: null,
        vocabulary: null,
        home_work: null,
        index: ""
    });

    const classesPopup = useStylesPopup();
    const classes = useStyles();

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });

    React.useEffect(() => {
        getTeacherByUID(firebase.auth().currentUser.uid).then(teacherInfo => {
            setTeacherData(teacherInfo);
            getFeedbackNecessaryLessonsForTeacher(teacherInfo.email).then(lessons => {
                let feedbacksInfo = [];
                let index = 0;
                lessons.forEach(lesson => {
                    let lessonArray = [];
                    lessonArray.push(lesson.student_name);
                    lessonArray.push(new Date(lesson.date_utc.full_date_string).toString());
                    lessonArray.push(lesson.duration);
                    lessonArray.push(getSimpleButtons(lesson.student_mail, lesson.teacher_mail, lesson.lesson_id,
                        lesson.date_utc.full_date_string, lesson.duration, lesson.student_name, lesson.feedback, index));
                    index++;
                    feedbacksInfo.push(lessonArray);
                });
                setFeedbacks(feedbacksInfo);
                setLoading(false);
            });
        })
    },[reloadToken]);


    function getSimpleButtons(student_mail, teacher_mail, lesson_id, lesson_date, duration, student_name, feedback, index) {
        return (
            <Button
                color="info"
                className={classes.actionButton}
                onClick={() => {modalPopUp(student_mail, teacher_mail, lesson_id, lesson_date, duration, student_name, feedback, index)}}
            >
                Submit Feedback
            </Button>
        );
    }

    const modalPopUp = (student_mail, teacher_mail, lesson_id, lesson_date, duration, student_name, feedback, index) => {
        console.log(student_mail);
        let lessonInfo = {
            student_mail: student_mail,
            teacher_mail: teacher_mail,
            lesson_id: lesson_id,
            lesson_date: lesson_date,
            duration: duration,
            student_name: student_name,
            grammar_corrections: feedback.grammar_corrections,
            pronunciation_corrections: feedback.pronunciation_corrections,
            vocabulary: feedback.vocabulary,
            home_work: feedback.home_work,
            index: index
        };
        setSelectedLesson(lessonInfo);
        setModal(true);
    };

    const submitFeedback =() => {
        var formInfo = document.getElementById("feedbackForm");
        let student_mail = selectedLesson.student_mail;
        let teacher_mail = selectedLesson.teacher_mail;
        let lesson_id = selectedLesson.lesson_id;
        let feedback = {
            grammar_corrections: formInfo.elements["grammar_corrections"].value,
            pronunciation_corrections: formInfo.elements["pronunciation_corrections"].value,
            vocabulary: formInfo.elements["vocabulary"].value,
            home_work: formInfo.elements["home_work"].value,
        };
        setFeedbackForLesson(feedback, lesson_id, teacher_mail, student_mail);
        let tempFeedbacks = feedbacks;
        delete tempFeedbacks[selectedLesson.index];
        console.log(tempFeedbacks);
        setFeedbacks(tempFeedbacks);
        formInfo.reset();
        setModal(false);
        confirmMessage()
    };

    const closeModal = () => {
        document.getElementById("feedbackForm").reset();
        setModal(false)
    };

    const saveTempFeedback = () => {
        setLoading(true);
        var formInfo = document.getElementById("feedbackForm");
        let teacher_mail = selectedLesson.teacher_mail;
        let lesson_id = selectedLesson.lesson_id;
        let feedback = {
            grammar_corrections: formInfo.elements["grammar_corrections"].value,
            pronunciation_corrections: formInfo.elements["pronunciation_corrections"].value,
            vocabulary: formInfo.elements["vocabulary"].value,
            home_work: formInfo.elements["home_work"].value,
        };
        saveFeedback(feedback, lesson_id, teacher_mail);
        formInfo.reset();
        setReloadToken(!reloadToken);
        setModal(false);
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

    return (
        <div>
            {alert}
            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <Assignment />
                            </CardIcon>
                            <h4 className={classes.cardCategory}>Feedback To Fill</h4>
                        </CardHeader>
                        {
                            loading === true ?
                                <Loader width={'20%'}/> :
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Student",
                                            "Date",
                                            "Duration",
                                        ]}
                                        tableData={
                                            feedbacks
                                        }
                                    />
                                </CardBody>
                        }
                    </Card>
                </GridItem>
            </GridContainer>

            <Dialog
                classes={{
                    root: classesPopup.center
                }}
                open={modal}
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
                    <form id="feedbackForm" className={classes.form}>
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
                                    value={selectedLesson.student_name}
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
                                    value={new Date(selectedLesson.lesson_date).toString()}
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
                                    helperText="Grammar corrections that happened during the lesson."
                                    name="Grammar Corrections"
                                    defaultValue={selectedLesson.grammar_corrections}
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
                                    helperText="Pronunciation corrections from the lesson."
                                    name="Pronunciation Corrections"
                                    defaultValue={selectedLesson.pronunciation_corrections}
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
                                    helperText="New vocabulary that the student learned in the lesson."
                                    name="Vocabulary"
                                    defaultValue={selectedLesson.vocabulary}
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
                                    helperText="Home work for the student."
                                    name="Home Work"
                                    defaultValue={selectedLesson.home_work}
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
