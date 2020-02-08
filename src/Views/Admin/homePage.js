
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
import {getAllStudents} from 'Actions/firestore_functions_admin.js'
import {getStudentLastFeedbackByMail} from "../../Actions/firestore_functions_teacher";
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/core/SvgIcon/SvgIcon";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Transition from "react-transition-group/Transition";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {
    changeTeacherForStudent,
    deleteStudent,
    getAdminByUid,
    updateSubscriptionForStudent
} from "../../Actions/firestore_functions_admin";
import {updateCredits} from "../../Actions/firestore_functions_student";
import {Redirect} from "react-router-dom";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);


export default  function ExtendedTables() {
    const classes = useStyles();
    const classesPopup = useStylesPopup();
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    const [redirect, setRedirect] = React.useState(false);
    const [teachersTable, setTeachersTable] = React.useState([]);
    const [modal, setModal] = React.useState(false);
    const [creditsModal, setCreditsModal] = React.useState(false);
    const [subscriptionModal, setSubscriptionModal] = React.useState(false);
    const [teacherChangeModal, setTeacherChangeModal] = React.useState(false);
    const [selectedStudent, setSelectedStudent] = React.useState({
        category: "",
        credits: 0,
        phone_number: "",
        skype_username: "",
        student_mail: "",
        student_name: "",
        subscription: {
            recurring: "",
            lessons_num: ""
        },
        teacher_name: "",
        teacher_mail: "",
        uid: "",
    });
    const [SelectedTeacher, setSelectedTeacher] = React.useState({
        category: "",
        credits: 0,
        phone_number: "",
        skype_username: "",
        teacher_name: "",
        teacher_mail: "",
        uid: "",
    });
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [allTeacherMailsList, setAllTeacherMailsList] =React.useState([]);
    const [triggerMount, setTriggerMount] = React.useState(true);


    React.useEffect(() => {

        getAdminByUid(firebase.auth().currentUser.uid).then((adminData)=>{
            setAllTeacherMailsList(Object.keys(adminData.all_teachers));
            let all_teachers = adminData.all_teachers;
            //table for all rows/students
            let studentsInfoTable = [];

            //for each student in the collection
            let index = 0;
            Object.keys(all_teachers).forEach(teacher =>{
                let row = [];
                row.push(all_teachers[teacher].teacher_name);
                row.push(all_teachers[teacher].teacher_mail);
                row.push(getSimpleButtons(all_teachers[teacher], index));
                console.log(row);

                studentsInfoTable.push(row);
                index = index + 1;
            });
            setTeachersTable(studentsInfoTable);
            setLoading(false);
            let selectTeacher = document.getElementById('teacherSelect');
            for (const teacherMail of Object.keys(adminData.all_teachers)){
                let opt = document.createElement('option');
                opt.textContent = teacherMail;
                opt.value = teacherMail;
                selectTeacher.appendChild(opt);
            }
        });
    },[triggerMount]);


    function goToTeacherSchedule(teacherData, index) {

        setRedirect(
            <Redirect
                to={{
                    pathname: "/Admin/teacherCalendar",
                    search: "?email=" + teacherData.teacher_mail,
                    state: { teacher: teacherData }
                }}
            /> );
    }

    function getSimpleButtons(teacherData, index)
    {
        return (
            <>
                <Button
                    color={"info"}
                    className={classes.actionButton}
                    onClick={() => goToTeacherSchedule(teacherData, index)}
                >
                    Schedule
                </Button>
                <Button
                    color={"info"}
                    className={classes.actionButton}
                    onClick={() => actionModal(teacherData, index)}
                >
                    Options
                </Button>
            </>
        )
    }

    const closeAlert = () => {
        setAlert(null);
    };

    const actionModal = (teacherData, index) => {
        setSelectedTeacher(teacherData);
        setSelectedIndex(index);
        setModal(true);
    };

    const updateCreditsModalSetup = () => {
        setModal(false);
        setCreditsModal(true);
    };

    const updateCreditstFunction = () => {
        let amountToUpdate = parseInt(document.getElementById('creditsToAdd').value);
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        updateCredits(selectedStudent.student_mail, amountToUpdate).then(() => {
            teachersTable[selectedIndex][5] = teachersTable[selectedIndex][5] + amountToUpdate;
            confirmCreditsAlert();
            document.getElementById('creditsForm').reset();
            setCreditsModal(false);
        })
    };

    const confirmCreditsAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Credits Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Credits were updated for {selectedStudent.student_name}
            </SweetAlert>
        );
    };

    const subscriptionModalSetup = () => {
        setModal(false);
        setSubscriptionModal(true);
    };

    const updateSubscriptionFunction = (recurring, lessons_num) => {
        if (!recurring){
            lessons_num = document.getElementById('subscriptionLessons');
        }
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        updateSubscriptionForStudent(selectedStudent.student_mail, recurring, lessons_num).then(() => {
            ConfirmSubscriptionAlert();
            setSubscriptionModal(false);
            document.getElementById('subscriptionForm').reset();
        });
    };

    const ConfirmSubscriptionAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Subscription Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Subscription was updated for {selectedStudent.student_name}
            </SweetAlert>
        );
    };

    const deleteStudentFunction = () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        deleteStudent(selectedStudent.student_mail).then( () => {
            confirmDeletedStudent();
            delete teachersTable[selectedIndex];
            setModal(false);
        })
    };

    const warningWithConfirmMessage = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Are you sure?"
                onConfirm={() => deleteStudentFunction()}
                onCancel={() => setAlert(null)}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText={"Yes, delete " + selectedStudent.student_name + "!"}
                cancelBtnText="Cancel"
                showCancel
            >
                <b>Once deleted there is no going back!</b>
            </SweetAlert>
        );
    };

    const confirmDeletedStudent = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Subscription Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                {selectedStudent.student_name} was deleted!
            </SweetAlert>
        );
    };

    const teacherChangeSetup = () => {
        setModal(false);
        setTeacherChangeModal(true);
    };

    const warningWithConfirmMessageTeacher = (use_preset_teacher) => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Are you sure?"
                onConfirm={() => changeTeacherFunction(use_preset_teacher)}
                onCancel={() => setAlert(null)}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText={"Yes, Change the teacher for " + selectedStudent.student_name + "!"}
                cancelBtnText="Cancel"
                showCancel
            >
                <b>Once changed all future lessons for the student with the current teacher will be deleted!</b>
            </SweetAlert>
        );
    };

    const changeTeacherFunction = (use_preset_teacher) => {
        let newTeacherMail = null;
        if (use_preset_teacher) {
            newTeacherMail = document.getElementById('teacherSelect').value;
            console.log(newTeacherMail);
        }
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        changeTeacherForStudent(selectedStudent.student_mail, newTeacherMail, false).then(() => {
            setTriggerMount(!triggerMount);
            confirmStudentsTeacherChange();
            setTeacherChangeModal(false);
        });
    };

    const confirmStudentsTeacherChange = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Teacher Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                {selectedStudent.student_name} teacher was changed!
            </SweetAlert>
        );
    };

    const backToControlPanel = () => {
        setCreditsModal(false);
        setTeacherChangeModal(false);
        setSubscriptionModal(false);
        setModal(true);
    };

    return (
        <div>
            {redirect}
            {alert}

            <GridContainer>
                <GridItem xs={12}>
                    <Card>
                        <CardHeader color="info">
                            <CardIcon color="rose">
                                <School/>
                            </CardIcon>
                            <h4 className={classes.cardCategory}>Teachers List</h4>
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
                                            teachersTable
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
                    <h3 className={classesPopup.modalTitle}>Control Panel: {selectedStudent.student_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem  xs={5} sm={5} md={5}>
                            <div>
                                <Button onClick={() => {}} color="info" style={{width:"100%"}}>Edit working time</Button>
                                <Button onClick={() => {}} color="info" style={{width:"100%"}}>Edit contact info</Button>
                                <Button onClick={() => {}} color="info" style={{width:"100%"}}>Edit categories</Button>
                                <Button onClick={() => {}} color="danger" style={{width:"100%"}}>Delete Teacher</Button>
                                <Button onClick={() => setModal(false)} color="default" style={{width:"100%"}}>Never Mind..</Button>
                            </div>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={creditsModal}
                transition={Transition}
                keepMounted
                onClose={() => setCreditsModal(false)}
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
                        onClick={() => setCreditsModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Credits for {selectedStudent.student_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Credit Status: {selectedStudent.credits}</h5>
                    <h5>How many would you like to add?</h5>
                    <form id={"creditsForm"}>
                        <TextField
                            id={"creditsToAdd"}
                            fullWidth
                        />
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem>
                            <Button onClick={() => updateCreditstFunction()} color="info">Add Credits</Button>
                            <Button onClick={() => backToControlPanel()} color="primary">Back to Control Panel</Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => setCreditsModal(false)} color="default">Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={subscriptionModal}
                transition={Transition}
                keepMounted
                onClose={() => setSubscriptionModal(false)}
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
                        onClick={() => setSubscriptionModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Subscription for {selectedStudent.student_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Subscription: {selectedStudent.subscription.lessons_num.toString() +
                    (selectedStudent.subscription.recurring ?
                        " weekly lessons subscription" :
                        " lessons package")}</h5>
                    <h5>Would you like to change it?</h5>
                    <br/>
                    <h5>If you change to Pay As You Learn - please enter number of lessons purchased</h5>
                    <form id={"subscriptionForm"}>
                        <TextField
                            id={"subscriptionLessons"}
                            fullWidth
                        />
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem>
                            <Button onClick={() => updateSubscriptionFunction(false, 1)} color="info">Pay as you Learn</Button>
                            <Button onClick={() => updateSubscriptionFunction(true, 1)} color="info">1 lesson per week</Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => updateSubscriptionFunction(true, 2)} color="info">2 lessons per week</Button>
                            <Button onClick={() => updateSubscriptionFunction(true, 3)} color="info">3 lessons per week</Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => backToControlPanel()} color="primary">Back to Control Panel</Button>
                            <Button onClick={() => setSubscriptionModal(false)} color="default">Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={teacherChangeModal}
                transition={Transition}
                keepMounted
                onClose={() => setTeacherChangeModal(false)}
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
                        onClick={() => setTeacherChangeModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Subscription for {selectedStudent.student_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Teacher: {selectedStudent.teacher_name}</h5>
                    <h5>Would you like to change a teacher?</h5>
                    <br/>
                    <h5>If you change to Pay As You Learn - please enter number of lessons purchased</h5>
                    <form id={"teacherForm"}>
                        <select id="teacherSelect"/>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem>
                            <Button onClick={() => warningWithConfirmMessageTeacher(false)} color="info">Choose Teacher For Me</Button>
                            <Button onClick={() => warningWithConfirmMessageTeacher(true)} color="info">Use Selected Teacher</Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => backToControlPanel()} color="primary">Back to Control Panel</Button>
                            <Button onClick={() => setTeacherChangeModal(false)} color="default">Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

        </div>
    );
}
