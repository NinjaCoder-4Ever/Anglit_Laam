
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import firebase from 'Config/fire';
import SweetAlert from "react-bootstrap-sweetalert";



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
import DialogTitle from "@material-ui/core/DialogTitle";
import Close from "@material-ui/core/SvgIcon/SvgIcon";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import {
    changeTeacherForStudent,
    deleteStudent, editStudentCategory,
    getAdminByUid,
    updateSubscriptionForStudent
} from "../../Actions/firestore_functions_admin";
import {updateCredits} from "../../Actions/firestore_functions_student";
import Slide from "@material-ui/core/Slide";
import {Checkbox} from "@material-ui/core";

const useStyles = makeStyles(styles);
const useStylesPopup = makeStyles(stylesPopup);


export default  function ExtendedTables() {
    const classes = useStyles();
    const classesPopup = useStylesPopup();
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });

    const [studentsTable, setStudentsTable] = React.useState([]);
    const [modal, setModal] = React.useState(false);
    const [creditsModal, setCreditsModal] = React.useState(false);
    const [subscriptionModal, setSubscriptionModal] = React.useState(false);
    const [teacherChangeModal, setTeacherChangeModal] = React.useState(false);
    const [categoryModal, setCategoryModal] = React.useState(false);
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
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [allTeacherMailsList, setAllTeacherMailsList] =React.useState([]);
    const [triggerMount, setTriggerMount] = React.useState(true);
    const [firstLoad, setFirstLoad] = React.useState(true);


    React.useEffect(() => {

        getAdminByUid(firebase.auth().currentUser.uid).then((adminData)=>{
            setAllTeacherMailsList(Object.keys(adminData.all_teachers));
            let all_students = adminData.all_students;
            //table for all rows/students
            let studentsInfoTable = [];

            //for each student in the collection
            let index = 0;
            Object.keys(all_students).forEach(student =>{
                let row = [];
                row.push(all_students[student].student_name);
                row.push(all_students[student].student_mail);
                row.push(all_students[student].phone_number);
                row.push(all_students[student].category);
                row.push(all_students[student].teacher_name);
                let subscriptiontext = "";
                if (all_students[student].subscription.recurring){
                    subscriptiontext = all_students[student].subscription.lessons_num + " Lessons Per Week"
                }
                else {
                    subscriptiontext = all_students[student].subscription.lessons_num + " Lessons Package"
                }
                row.push(subscriptiontext);
                row.push(all_students[student].credits);
                row.push(getSimpleButtons(all_students[student], index));
                console.log(row);

                studentsInfoTable.push(row);
                index = index + 1;
            });
            setStudentsTable(studentsInfoTable);
            setLoading(false);
            // create selected list only on first load.
            if (firstLoad) {
                let selectTeacher = document.getElementById('teacherSelect');
                for (const teacherMail of Object.keys(adminData.all_teachers)) {
                    let opt = document.createElement('option');
                    opt.textContent = teacherMail;
                    opt.value = teacherMail;
                    selectTeacher.appendChild(opt);
                }
                setFirstLoad(false);
            }
        });
    },[triggerMount]);


    function getSimpleButtons(studentData, index)
    {
            return (
                <Button
                    color={"info"}
                    className={classes.actionButton}
                    onClick={() => actionModal(studentData, index)}
                >
                    Edit Student Info
                </Button>
            )
    }

    const closeAlert = () => {
        setAlert(null);
    };

    const actionModal = (studentData, index) => {
        setSelectedStudent(studentData);
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
          confirmCreditsAlert();
          document.getElementById('creditsForm').reset();
          setCreditsModal(false);
          setTriggerMount(!triggerMount);
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
            lessons_num = parseInt(document.getElementById('subscriptionLessons').value);
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
            setTriggerMount(!triggerMount);
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
          delete studentsTable[selectedIndex];
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
                title="Student Deleted!"
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

    const categoryChangeSetup = () => {
        setModal(false);
        setCategoryModal(true);
    };

    const changeCategoryFunction = () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        let chosenCategory = "";
        let kids = document.getElementById('kidsBox');
        let adults = document.getElementById('adultsBox');
        let business = document.getElementById('businessBox');
        let spoken = document.getElementById('spokenBox');
        if (kids.checked){
            chosenCategory ='kids';
            kids.checked = false;
        }
        if (adults.checked){
            chosenCategory = 'adults';
            adults.checked = false;
        }
        if (business.checked){
            chosenCategory ='business';
            business.checked = false;
        }
        if (spoken.checked){
            chosenCategory = 'spoken';
            spoken.checked = false;
        }
        if (chosenCategory.length === 0){
            noCategoryChosenAlert();
            return 0;
        }
        else {
            editStudentCategory(selectedStudent.student_mail, chosenCategory).then(() => {
                setTriggerMount(!triggerMount);
                setCategoryModal(false);
                successCategoryChange();
            })
        }

    };

    const noCategoryChosenAlert = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Category Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                No Category Selected!
            </SweetAlert>
        );
    };

    const successCategoryChange = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Teacher Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Category Changed for {selectedStudent.student_name}!
            </SweetAlert>
        );
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
                                <School/>
                            </CardIcon>
                            <h4 className={classes.cardCategory}>Students List</h4>
                        </CardHeader>
                        {
                            loading === true ?
                                <Loader width={'20%'}/>:
                                <CardBody>
                                    <Table
                                        tableHead={[
                                            "Name",
                                            "Mail",
                                            "Phone",
                                            "Category",
                                            "Teacher",
                                            "Subscription",
                                            "Credit",
                                        ]}
                                        tableData={
                                            studentsTable
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
                            <Button onClick={() => updateCreditsModalSetup()} color="info" style={{width:"100%"}}>Update Credits</Button>
                            <Button onClick={() => subscriptionModalSetup()} color="info" style={{width:"100%"}}>Update Subscription</Button>
                            <Button onClick={() => categoryChangeSetup()} color="info" style={{width:"100%"}}>Update Category</Button>
                            <Button onClick={() => teacherChangeSetup()} color="info" style={{width:"100%"}}>Change Teacher</Button>
                            <Button onClick={() => warningWithConfirmMessage()} color="danger" style={{width:"100%"}}>Delete Student</Button>
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
                        <GridItem  xs={5} sm={5} md={5}>
                            <Button onClick={() => updateCreditstFunction()} color="info" style={{width:"100%"}}>Add Credits</Button>
                            <Button onClick={() => backToControlPanel()} color="primary" style={{width:"100%"}}>Back to Control Panel</Button>
                            <Button onClick={() => setCreditsModal(false)} color="default" style={{width:"100%"}}>Never Mind...</Button>
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
                        <GridItem  xs={5} sm={5} md={5}>
                            <Button onClick={() => updateSubscriptionFunction(false, 1)} color="info" style={{width:"100%"}}>Pay as you Learn</Button>
                            <Button onClick={() => updateSubscriptionFunction(true, 1)} color="info" style={{width:"100%"}}>1 lesson per week</Button>
                            <Button onClick={() => updateSubscriptionFunction(true, 2)} color="info" style={{width:"100%"}}>2 lessons per week</Button>
                            <Button onClick={() => updateSubscriptionFunction(true, 3)} color="info" style={{width:"100%"}}>3 lessons per week</Button>
                            <Button onClick={() => backToControlPanel()} color="primary" style={{width:"100%"}}>Back to Control Panel</Button>
                            <Button onClick={() => setSubscriptionModal(false)} color="default" style={{width:"100%"}}>Never Mind...</Button>
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
                    <h3 className={classesPopup.modalTitle}>Change Teacher for {selectedStudent.student_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Teacher: {selectedStudent.teacher_name}</h5>
                    <h5>Would you like to change a teacher?</h5>
                    <br/>
                    <form id={"teacherForm"}>
                        <select id="teacherSelect"/>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem  xs={5} sm={5} md={5}>
                            <Button onClick={() => warningWithConfirmMessageTeacher(false)} color="info" style={{width:"100%"}}>Choose Teacher For Me</Button>
                            <Button onClick={() => warningWithConfirmMessageTeacher(true)} color="info" style={{width:"100%"}}>Use Selected Teacher</Button>
                            <Button onClick={() => backToControlPanel()} color="primary" style={{width:"100%"}}>Back to Control Panel</Button>
                            <Button onClick={() => setTeacherChangeModal(false)} color="default" style={{width:"100%"}}>Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

            <Dialog
                classes={{
                    root: classesPopup.center,
                    paper: classesPopup.modal
                }}
                open={categoryModal}
                transition={Transition}
                keepMounted
                onClose={() => setCategoryModal(false)}
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
                        onClick={() => setCategoryModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Category for {selectedStudent.student_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Category: {selectedStudent.category}</h5>
                    <h5>Choose new category:</h5>
                    <form id={"categoryForm"}>
                        <input type={'radio'} name={"category"} id={'kidsBox'} value={"kids"} color={'primary'} label={'Kids'}/>Kids
                        <input type={'radio'} name={"category"} id={'adultsBox'} value={"adults"} color={'primary'} label={'Adults'}/>Adults
                        <input type={'radio'} name={"category"} id={'businessBox'} value={"business"} color={'primary'} label={'Business'}/>Business
                        <input type={'radio'} name={"category"} id={'spokenBox'} value={"spoken"} color={'primary'} label={"Spoken"}/>Spoken
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem>
                            <Button onClick={() => changeCategoryFunction()} color="info">Update Category</Button>
                            <Button onClick={() => backToControlPanel()} color="primary">Back to Control Panel</Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => setCategoryModal(false)} color="default">Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

        </div>
    );
}
