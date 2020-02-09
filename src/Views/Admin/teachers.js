
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
//import Transition from "react-transition-group/Transition";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {
    changeTeacherForStudent,
    deleteStudent, deleteTeacher, editTeacherCategory, editTeacherContactInfo,
    getAdminByUid,
    updateSubscriptionForStudent
} from "../../Actions/firestore_functions_admin";
import {updateCredits} from "../../Actions/firestore_functions_student";
import {Redirect} from "react-router-dom";
import Slide from "@material-ui/core/Slide";

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
    const [contactInfoModal, setContactInfoModal] = React.useState(false);
    const [categoryModal, setCategoryModal] = React.useState(false);

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="down" ref={ref} {...props} />;
    });

    const [selectedTeacher, setSelectedTeacher] = React.useState({
        category: "",
        credits: 0,
        phone_number: "",
        skype_username: "",
        teacher_name: "",
        teacher_mail: "",
        uid: "",
        students: ""
    });
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [allTeacherMailsList, setAllTeacherMailsList] =React.useState([]);
    const [triggerMount, setTriggerMount] = React.useState(true);


    React.useEffect(() => {

        getAdminByUid(firebase.auth().currentUser.uid).then((adminData)=>{
            setAllTeacherMailsList(Object.keys(adminData.all_teachers));
            let all_teachers = adminData.all_teachers;
            //table for all rows/students
            let teacherInfoTable = [];

            //for each student in the collection
            let index = 0;
            Object.keys(all_teachers).forEach(teacher =>{
                let row = [];
                row.push(all_teachers[teacher].teacher_name);
                row.push(all_teachers[teacher].teacher_mail);
                row.push(all_teachers[teacher].phone_number);
                row.push(all_teachers[teacher].skype_username);
                row.push(all_teachers[teacher].category.toString());
                row.push(getSimpleButtons(all_teachers[teacher], index));
                console.log(row);

                teacherInfoTable.push(row);
                index = index + 1;
            });
            setTeachersTable(teacherInfoTable);
            setLoading(false);
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
                    See Schedule
                </Button>

                <Button
                    color={"info"}
                    className={classes.actionButton}
                    onClick={() => actionModal(teacherData, index)}
                >
                    Edit Teacher Info
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

    const contactInfoSetup = () => {
        setModal(false);
        setContactInfoModal(true);
    };

    const updateContactInfoFunction = () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
      let newPhoneNumber = document.getElementById('phoneForm').value;
      let newSkypeUser = document.getElementById('skypeForm').value;
      if (newSkypeUser === "" || newSkypeUser === undefined || newSkypeUser === null){
          newSkypeUser = selectedTeacher.skype_username;
      }
        if (newPhoneNumber === "" || newPhoneNumber === undefined || newPhoneNumber === null){
            newPhoneNumber = selectedTeacher.phone_number;
        }
      editTeacherContactInfo(selectedTeacher.teacher_mail, newPhoneNumber, newSkypeUser, selectedTeacher.students).then(() =>{
          setContactInfoModal(false);
          confirmContactUpdateAlert();
          setTriggerMount(!triggerMount);
          document.getElementById('conactForm').reset();
      })
    };

    const confirmContactUpdateAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Contact Info Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Updated contact info for {selectedTeacher.teacher_name}
            </SweetAlert>
        );
    };

    const categoryModalSetup = () => {
      setModal(false);
      setCategoryModal(true);
    };

    const updateCategoryFunction = () => {
        setAlert(
            <SweetAlert
                customButtons={
                    <React.Fragment>
                    </React.Fragment>
                }>
                <Loader width={'30%'}/>
            </SweetAlert>
        );
        let selectedCategories = document.getElementById('catogorySelect').options;
        let categoryList = [];
        for (const opt of selectedCategories){
            if (opt.selected){
                categoryList.push(opt.value);
            }
        }
        editTeacherCategory(selectedTeacher.teacher_mail, categoryList).then(() =>{
            setCategoryModal(false);
            confirmCategoryUpdateAlert();
            setTriggerMount(!triggerMount);
            document.getElementById('categoryForm').reset();
        })
    };

    const confirmCategoryUpdateAlert = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Categories Updated"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                Updated categories info for {selectedTeacher.teacher_name}
            </SweetAlert>
        );
    };

    const warningWithConfirmMessage = () => {
        setAlert(
            <SweetAlert
                warning
                style={{ display: "block"}}
                title="Are you sure?"
                onConfirm={() => deleteTeacherFunction()}
                onCancel={() => setAlert(null)}
                confirmBtnCssClass={classes.button + " " + classes.success}
                cancelBtnCssClass={classes.button + " " + classes.danger}
                confirmBtnText={"Yes, delete " + selectedTeacher.teacher_name + "!"}
                cancelBtnText="Cancel"
                showCancel
            >
                <b>Once deleted there is no going back!</b>
            </SweetAlert>
        );
    };

    const deleteTeacherFunction = () => {
        deleteTeacher(selectedTeacher.teacher_mail).then(() => {
            confirmDeletion();
            setTriggerMount(!triggerMount);
        });
    };

    const confirmDeletion = () => {
        setAlert(
            <SweetAlert
                success
                style={{ display: "block"}}
                title="Teacher Deleted"
                onConfirm={() => closeAlert()}
                confirmBtnCssClass={classes.button + " " + classes.success}
            >
                {selectedTeacher.teacher_name} was deleted!
            </SweetAlert>
        );
    };

    const backToControlPanel = () => {
        setContactInfoModal(false);
        setCategoryModal(false);
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
                                            "Phone",
                                            "Skype Username",
                                            "Categories"
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
                    <h3 className={classesPopup.modalTitle}>Control Panel: {selectedTeacher.teacher_name}</h3>
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
                                <Button onClick={() => setModal(false)} color="info" style={{width:"100%"}}>Edit working time</Button>
                                <Button onClick={() => contactInfoSetup()} color="info" style={{width:"100%"}}>Edit contact info</Button>
                                <Button onClick={() => categoryModalSetup()} color="info" style={{width:"100%"}}>Edit categories</Button>
                                <Button onClick={() => warningWithConfirmMessage()} color="danger" style={{width:"100%"}}>Delete Teacher</Button>
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
                open={contactInfoModal}
                transition={Transition}
                keepMounted
                onClose={() => setContactInfoModal(false)}
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
                        onClick={() => setContactInfoModal(false)}
                    >
                        <Close className={classesPopup.modalClose} />
                    </Button>
                    <h3 className={classesPopup.modalTitle}>Contact Info for {selectedTeacher.teacher_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <form id={"conactForm"}>
                        <h5>Teacher's phone number: {selectedTeacher.phone_number}</h5>
                        <TextField
                            id={"phoneForm"}
                            fullWidth
                            label={"Enter new phone number"}
                            defaultValue={selectedTeacher.phone_number}
                        />
                        <br/>
                        <h5>Teacher's Skype username: {selectedTeacher.skype_username} </h5>
                        <TextField
                            id={"skypeForm"}
                            fullWidth
                            label={"Enter new Skype username:"}
                            defaultValue={selectedTeacher.skype_username}
                        />
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem>
                            <Button onClick={() => updateContactInfoFunction()} color="info">Update Changes</Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => backToControlPanel()} color="primary">Back to Control Panel</Button>
                            <Button onClick={() => setContactInfoModal(false)} color="default">Never Mind...</Button>
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
                    <h3 className={classesPopup.modalTitle}>Set Category for {selectedTeacher.teacher_name}</h3>
                </DialogTitle>
                <DialogContent
                    id="modal-slide-description"
                    className={classesPopup.modalBody}
                >
                    <h5>Current Categories: {selectedTeacher.category.toString()}</h5>
                    <h5>Would you like to change the categories?</h5>
                    <br/>
                    <form id={"categoryForm"}>
                        <select id="catogorySelect" multiple={true}>
                            <option value={"kids"}>Kids</option>
                            <option value={"adults"}>Adults</option>
                            <option value={"business"}>Business</option>
                            <option value={"spoken"}>Spoken</option>
                        </select>
                    </form>
                </DialogContent>
                <DialogActions
                    className={classesPopup.modalFooterCenter + " " +
                    classesPopup.modalFooterCenter + " " + classesPopup.modalFooterCenter}
                >
                    <GridContainer justify="center">
                        <GridItem>
                            <Button onClick={() => updateCategoryFunction()} color="info">Update Categories</Button>
                        </GridItem>
                        <GridItem>
                            <Button onClick={() => backToControlPanel()} color="primary">Back to Control Panel</Button>
                            <Button onClick={() => setCategoryModal(false)} color="default">Never Mind...</Button>
                        </GridItem>
                    </GridContainer>
                </DialogActions>
            </Dialog>

        </div>
    );
}
