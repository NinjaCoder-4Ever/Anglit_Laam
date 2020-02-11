
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import firebase from 'Config/fire';

// material-ui icons
import Assignment from "@material-ui/icons/Assignment";

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
import {getStudentByUID, getAllPastLessonsForStudent} from "Actions/firestore_functions_student";
import Loader from "Components/Loader/Loader.js";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/core/SvgIcon/SvgIcon";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";

const useStyles = makeStyles(styles);
function printFeedback(feedback) {
    return "this is feedback for the class"
}
const useStylesPopup = makeStyles(stylesPopup);

export default  function ExtendedTables() {
    const classesPopup = useStylesPopup();
    const classes = useStyles();
    const [checked, setChecked] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [studentData,setStudentData] = React.useState({first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: '',
        teacher: {},
        uid: ''});
    const [pastLessonsTable,setPastLessonsTable] = React.useState([[]]);
    const [modal, setModal] = React.useState(false);
    const [feedbackData, setFeedbackData] = React.useState({
        grammar_corrections: "",
        pronunciation_corrections: "",
        vocabulary: "",
        home_work: "",
        teacher_name: "",
        lesson_date: "",
    });

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });

    React.useEffect(() => {
        let lessonsTable = [];
        getStudentByUID(firebase.auth().currentUser.uid).then((studentInfo)=>{
            if(studentInfo != null){
                setStudentData(studentInfo);
            }
            getAllPastLessonsForStudent(studentInfo.email).then((lessons)=>{
                if(lessons != null){
                    lessons.forEach(lesson => {
                        let teacher_name = lesson.teacher_name;
                        let lesson_date = new Date(lesson.date_utc.full_date_string).toString();
                        let feedback = lesson.feedback;
                        lessonsTable.push([
                            teacher_name,
                            lesson_date,
                            getSimpleButtons(lesson.feedback_given, feedback, teacher_name, lesson_date)
                        ]);

                    })
                }
                setPastLessonsTable(lessonsTable);
                setLoading(false);
            });
        });
    },[]);

    const hideAlert = () => {
        setAlert(null);
    };

    const popFeedback = (feedback, teacher_name, lesson_date) => {
        let temp = {
            grammar_corrections: feedback.grammar_corrections,
            pronunciation_corrections: feedback.pronunciation_corrections,
            vocabulary: feedback.vocabulary,
            home_work: feedback.home_work,
            teacher_name: teacher_name,
            lesson_date: lesson_date,
        };
        setFeedbackData(temp);
        setModal(true);
    };

    function getSimpleButtons(feedback_given, feedback, teacher_name, lesson_date)
    {
        return (
            <Button
                color={"info"}
                disabled={!feedback_given}
                className={classes.actionButton}
                onClick={() => {
                    popFeedback(feedback, teacher_name, lesson_date);
                }}
            >
                Feedback
            </Button>
        )
    };

    const closeModal = () => {
        document.getElementById("feedbackForm").reset();
        setModal(false)
    };

    return (
        <div>
            {alert}
            <br/>
            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <Assignment />
                            </CardIcon>
                            <h4 className={classes.cardCategory}>Past Lessons and Feedback</h4>
                        </CardHeader>
                        {
                            loading === true ?
                                <Loader width={'20%'}/>:
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Teacher",
                                            "Date",
                                            "Duration"
                                        ]}
                                        tableData={
                                            pastLessonsTable
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
                    <h3 className={classesPopup.modalTitle}>Feedback</h3>
                </DialogTitle>
                <DialogContent>
                    <form id="feedbackForm" className={classes.form} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    readOnly
                                    autoComplete="teacher_name"
                                    name="teacher_name"
                                    variant="outlined"
                                    fullWidth
                                    id="teacher_name"
                                    label="Teacher"
                                    value={feedbackData.teacher_name}
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
                                    name="lesson_date"
                                    value={new Date(feedbackData.lesson_date).toString()}
                                    autoComplete="lesson_date"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Grammar Corrections</h5>
                                <TextField
                                    readOnly
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="grammar_corrections"
                                    label="Grammar corrections that happened during the lesson."
                                    name="Grammar Corrections"
                                    value={feedbackData.grammar_corrections}
                                    multiline={5}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Pronunciation Corrections</h5>
                                <TextField
                                    readOnly
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="pronunciation_corrections"
                                    label="Pronunciation corrections from the lesson."
                                    name="Pronunciation Corrections"
                                    value={feedbackData.pronunciation_corrections}
                                    multiline={5}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Vocabulary</h5>
                                <TextField
                                    readOnly
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="vocabulary"
                                    label="New vocabulary that I learned in the lesson."
                                    name="Vocabulary"
                                    value={feedbackData.vocabulary}
                                    multiline={5}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Home Work</h5>
                                <TextField
                                    readOnly
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="home_work"
                                    label="Home work I got from the lesson."
                                    name="Home Work"
                                    value={feedbackData.home_work}
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
