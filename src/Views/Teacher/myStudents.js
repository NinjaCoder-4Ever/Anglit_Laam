
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import logo from "assets/img/LogoText.png";
import firebase from 'Config/fire';
import SweetAlert from "react-bootstrap-sweetalert";


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
import {School} from "@material-ui/icons";

import stylesPopup from "assets/jss/material-dashboard-pro-react/modalStyle.js";
import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import Loader from "Components/Loader/Loader.js";
import {getTeacherByUID} from 'Actions/firestore_functions_teacher.js'
import {getStudentByMail} from "../../Actions/firestore_functions_student";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/core/SvgIcon/SvgIcon";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Transition from "react-transition-group/Transition";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);

function printFeedback(feedback) {
    return "this is feedback for the class"
}
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
        uid: '',
        last_feedback_given: {
            lesson_id: "",
            lesson_date: "",
            teacher_mail: "",
            teacher_name: "",
            grammar_corrections: "",
            pronunciation_corrections: "",
            vocabulary: "",
            home_work: "",
        }
    });
    const [studentTable, setStudentTable] = React.useState([]);
    const [teacherData,setTeacherData] = React.useState({
        students: []
    });
    const [modal, setModal] = React.useState(false);

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
        getStudentByMail(studentMail).then((studentInfo) => {
            setStudentData(studentInfo);
            setModal(true);
    });

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
                                            "Mail",
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
                        color="info"
                        onClick={() => setModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Last Feedback for {studentData.first_name} {studentData.last_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <form className={classes.form} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    disabled
                                    autoComplete="student_name"
                                    name="student_name"
                                    variant="outlined"
                                    fullWidth
                                    id="student_name"
                                    label="Student "
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
                                    label="Date: "
                                    name="lesson_date"
                                    autoComplete="lesson_date"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>Grammar Corrections</h5>
                                <TextField
                                    variant="outlined"
                                    disabled
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
                                    disabled
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
                                    disabled
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
                                    disabled
                                    fullWidth
                                    id="home_work"
                                    label="Home work for the student."
                                    name="Home Work"
                                    multiline={5}
                                />
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooter + " " + classesPopup.modalFooterCenter}
                >
                    <Button onClick={() => setModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
