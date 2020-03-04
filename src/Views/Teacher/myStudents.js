
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import firebase from 'Config/fire';

// material-ui icons
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
import {School} from "@material-ui/icons";

import stylesPopup from "assets/jss/material-dashboard-pro-react/modalStyle.js";
import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import Loader from "Components/Loader/Loader.js";
import {getTeacherByUID} from 'Actions/firestore_functions_teacher.js'
import {getStudentLastFeedbackByMail} from "../../Actions/firestore_functions_teacher";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/core/SvgIcon/SvgIcon";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Slide from "@material-ui/core/Slide";
import SweetAlert from "react-bootstrap-sweetalert";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);

export default  function ExtendedTables() {
    const classesPopup = useStylesPopup();
    const classes = useStyles();
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [lessonData,setLessonData] = React.useState({
        teacher_mail: "",
        teacher_name: "",
        student_mail: "",
        student_name: "",
        duration: "",
        date_utc: {
            full_date: "",
            full_date_string: ""
        },
        feedback: {
            grammar_corrections: "",
            pronunciation_corrections: "",
            vocabulary: "",
            home_work: "",
        },
    });
    const [studentTable, setStudentTable] = React.useState([]);
    const [teacherData,setTeacherData] = React.useState({
        students: []
    });
    const [modal, setModal] = React.useState(false);

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });

    React.useEffect(() => {

        getTeacherByUID(firebase.auth().currentUser.uid).then((teacherInfo)=>{
            if(teacherInfo != null){
                setTeacherData(teacherInfo);
                let studentsInfoTable = [];
                let studentList = teacherInfo.students;
                studentList.forEach(student => {
                    let row = [];
                    row.push(student.student_name);
                    row.push(student.student_mail);
                    row.push(getSimpleButtons(student.student_mail));
                    studentsInfoTable.push(row);
                });
                setStudentTable(studentsInfoTable);
            }
            setLoading(false);
        });
    },[]);

    const hideAlert = () => {
        setAlert(null);
    };

    const popFeedback = (studentMail) => {
        setLoading(true);
        getStudentLastFeedbackByMail(studentMail).then((lessonInfo) => {
            if (lessonInfo === null){
                noFeedbacksAlert();
                setLoading(false);
                return 0;
            }
            setLessonData(lessonInfo);
            setModal(true);
            setLoading(false);
    });

    };

    const noFeedbacksAlert = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="No Feedback Given To This Student Yet."
                onConfirm={() => setAlert(null)}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
            </SweetAlert>
        );
    };

    const closeModal = () => {
        document.getElementById("feedbackForm").reset();
        setModal(false)
    };

    function getSimpleButtons(data)
    {
        return  [
            {color: "info", icon: Check, data: data}
        ].map((prop, key) => {
            return (
                <Button
                    color={prop.color}

                    className={classes.actionButton}
                    key={key}
                    onClick={() => {
                        popFeedback(prop.data);
                    }}
                >
                    Last Feedback
                </Button>
            );
        });
    }

    return (
        <div>
            {alert}
            <br/>
            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <School/>
                            </CardIcon>
                            <h4 className={classes.cardCategory}>My Students</h4>
                        </CardHeader>
                        {
                            loading === true ?
                                <Loader width={'20%'}/>:
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Name",
                                            "Email",
                                        ]}
                                        tableData={
                                            studentTable
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
                                    autoComplete="student_name"
                                    name="student_name"
                                    variant="outlined"
                                    fullWidth
                                    id="student_name"
                                    label="Student"
                                    value={lessonData.student_name}
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
                                    value={new Date(lessonData.date_utc.full_date_string)}
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
                                    value={lessonData.feedback.grammar_corrections}
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
                                    value={lessonData.feedback.pronunciation_corrections}
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
                                    label="New vocabulary that the student learned in the lesson."
                                    name="Vocabulary"
                                    value={lessonData.feedback.vocabulary}
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
                                    label="Home work for the student."
                                    name="Home Work"
                                    value={lessonData.feedback.home_work}
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
