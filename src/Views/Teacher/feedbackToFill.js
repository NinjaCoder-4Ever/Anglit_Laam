
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
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Transition from "react-transition-group/Transition";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);

export default  function ExtendedTables(callback, deps) {
    const [alert, setAlert] = React.useState(null);
    const [teacherData,setTeacherData] = React.useState({first_name: '',
        last_name: '',
        students:[]
    });
    const [modal, setModal] = React.useState(false);
    const [feedbacks,setFeedbacks] = React.useState([]);
    const [selectedLesson, setSelectedLesson] = React.useState({
        student_name:"",
        date_utc: {
            full_date: ""
        },
        duration: "",
        student_mail: "",
        teacher_mail: "",
        lesson_id: ""
    });

    const classesPopup = useStylesPopup();
    const classes = useStyles();

    React.useEffect(() => {
        getTeacherByUID(firebase.auth().currentUser.uid).then(teacherInfo => {
            setTeacherData(teacherInfo);
            getFeedbackNecessaryLessonsForTeacher(teacherInfo.email).then(lessons => {
                let feedbacksInfo = [];
                lessons.forEach(lesson => {
                    let lessonArray = [];
                    lessonArray.push(lesson.student_name);
                    lessonArray.push(new Date(lesson.date_utc.full_date_string).toString());
                    lessonArray.push(lesson.duration);
                    lessonArray.push(getSimpleButtons(lesson));
                    feedbacksInfo.push(lessonArray);
                });
                setFeedbacks(feedbacksInfo);
            });
        })
    },[]);


    function getSimpleButtons(lessonData)
    {
        return  [
            {color: "info", icon: Check, data: lessonData}
        ].map((prop, key) => {
            return (
                <Button
                    color={prop.color}

                    className={classes.actionButton}
                    key={key}
                    onClick={() => {modalPopUp(lessonData)}}
                >
                    Submit Feedback
                </Button>
            );
        });
    }

    const modalPopUp = (lessonData) => {
        setSelectedLesson(lessonData);
        setModal(true);
    };

    const submitFeedback =(grammar, pronunciation, vocabulary, home_work, save=false) => {
        let student_mail = selectedLesson.student_mail;
        let teacher_mail = selectedLesson.teacher_mail;
        let lesson_id = selectedLesson.lesson_id;
        let feedback = {
            grammar_corrections: grammar.value,
            pronunciation_corrections: pronunciation.value,
            vocabulary: vocabulary.value,
            home_work: home_work.value,
        };

        if (save){
            saveFeedback(feedback, lesson_id, teacher_mail);
        }
        else {
            setFeedbackForLesson(feedback, lesson_id, teacher_mail, student_mail);
        }
    };

    const handleSubmit = useCallback(event => {
        event.preventDefault();
        const {
            student_name, lesson_date, grammar_corrections, pronunciation_corrections,
            vocabulary, home_work
        } = event.target.elements;
        submitFeedback(grammar_corrections, pronunciation_corrections, vocabulary, home_work);
    }, deps);

    return (
        <div>
            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info" icon>
                            <CardIcon color="rose">
                                <Assignment />
                            </CardIcon>
                            <h4 className={classes.cardIconTitle}>Past Lessons</h4>
                        </CardHeader>
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
                    <h3 className={classesPopup.modalTitle}>Submit Feedback</h3>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} className={classes.form} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    disabled
                                    autoComplete="student_name"
                                    name="student_name"
                                    variant="outlined"
                                    fullWidth
                                    id="student_name"
                                    label="Student "{...selectedLesson.student_name}
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    disabled
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lesson_date"
                                    label="Date: "{...selectedLesson.date_utc.full_date}
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
                            <Button
                                type="submit"
                                variant="contained"
                                color="info"
                                className={classes.submit}
                            >
                                Submit Feedback
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="default"
                                className={classes.submit}
                            >
                                Save Feedback
                            </Button>
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
